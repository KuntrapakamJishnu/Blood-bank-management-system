const base = "http://localhost:5000";
const now = Date.now();
const donorEmail = `test.donor.${now}@example.com`;
const facilityEmail = `test.hospital.${now}@example.com`;

const donorPayload = {
  role: "donor",
  fullName: "Smoke Donor",
  email: donorEmail,
  password: "Password@123",
  phone: "9876543211",
  emergencyContact: "9876543212",
  age: 25,
  gender: "Male",
  bloodGroup: "O+",
  weight: 65,
  address: {
    street: "123 Test St",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001",
  },
};

const facilityPayload = {
  role: "hospital",
  facilityType: "hospital",
  name: `Smoke General Hospital ${now}`,
  email: facilityEmail,
  password: "Password@123",
  phone: "9876543213",
  emergencyContact: "9876543214",
  registrationNumber: `SGH${now}`,
  address: {
    street: "456 Test Ave",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500002",
  },
  documents: {
    registrationProof: {
      url: "https://example.com/proof.pdf",
      filename: "proof.pdf",
    },
  },
};

const checks = [];
const push = (name, ok, detail = "") => {
  checks.push({ name, ok, detail });
};

async function req(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(base + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  let text = "";
  try {
    data = await response.json();
  } catch {
    try {
      text = await response.text();
    } catch {
      text = "";
    }
  }

  return { status: response.status, data, text };
}

(async () => {
  try {
    let r = await req("/api/v1/health");
    push("GET /api/v1/health", r.status === 200, `status=${r.status}`);

    r = await req("/api/auth/request-otp", {
      method: "POST",
      body: { email: donorEmail, channel: "email", purpose: "register" },
    });
    push("POST /api/auth/request-otp donor", r.status === 200 && r.data?.success === true, `status=${r.status}`);
    const donorOtp = r.data?.devOtp;

    r = await req("/api/auth/verify-otp", {
      method: "POST",
      body: { email: donorEmail, channel: "email", code: donorOtp, purpose: "register" },
    });
    push("POST /api/auth/verify-otp donor", r.status === 200 && r.data?.success === true, `status=${r.status}`);

    r = await req("/api/auth/register", { method: "POST", body: donorPayload });
    push("POST /api/auth/register donor", r.status === 201 && r.data?.success === true, `status=${r.status}`);

    r = await req("/api/auth/login", { method: "POST", body: { email: donorEmail, password: "Password@123" } });
    push("POST /api/auth/login donor", r.status === 200 && Boolean(r.data?.token), `status=${r.status}`);
    const donorToken = r.data?.token;

    for (const path of ["/api/donor/profile", "/api/donor/stats", "/api/donor/history", "/api/donor/camps"]) {
      const rr = await req(path, { token: donorToken });
      push(`GET ${path}`, rr.status === 200 && rr.data?.success === true, `status=${rr.status}`);
    }

    r = await req("/api/donor/matches", { token: donorToken });
    push("GET /api/donor/matches donor", r.status === 200 && r.data?.success === true, `status=${r.status}`);

    r = await req("/api/auth/request-otp", {
      method: "POST",
      body: { email: facilityEmail, channel: "email", purpose: "register" },
    });
    push("POST /api/auth/request-otp facility", r.status === 200 && r.data?.success === true, `status=${r.status}`);
    const facilityOtp = r.data?.devOtp;

    r = await req("/api/auth/verify-otp", {
      method: "POST",
      body: { email: facilityEmail, channel: "email", code: facilityOtp, purpose: "register" },
    });
    push("POST /api/auth/verify-otp facility", r.status === 200 && r.data?.success === true, `status=${r.status}`);

    r = await req("/api/auth/register", { method: "POST", body: facilityPayload });
    push("POST /api/auth/register facility", r.status === 201 && r.data?.success === true, `status=${r.status}`);

    r = await req("/api/auth/login", { method: "POST", body: { email: facilityEmail, password: "Password@123" } });
    push("POST /api/auth/login pending facility blocked", r.status === 403, `status=${r.status}`);

    const adminLogin = await req("/api/auth/login", {
      method: "POST",
      body: { email: "admin@bbms.local", password: "bbms@admin" },
    });
    const adminToken = adminLogin.data?.token;
    push("POST /api/auth/login admin", adminLogin.status === 200 && Boolean(adminToken), `status=${adminLogin.status}`);

    let facilityToken = null;
    if (adminToken) {
      const facilityList = await req("/api/admin/facilities", { token: adminToken });
      push("GET /api/admin/facilities", facilityList.status === 200, `status=${facilityList.status}`);

      const createdFacility = facilityList.data?.facilities?.find((f) => f.email === facilityEmail);
      if (createdFacility?._id) {
        const approval = await req(`/api/admin/facility/approve/${createdFacility._id}`, {
          method: "PUT",
          token: adminToken,
        });
        push("PUT /api/admin/facility/approve/:id", approval.status === 200, `status=${approval.status}`);

        const facilityLogin = await req("/api/auth/login", {
          method: "POST",
          body: { email: facilityEmail, password: "Password@123" },
        });
        facilityToken = facilityLogin.data?.token;
        push("POST /api/auth/login approved facility", facilityLogin.status === 200 && Boolean(facilityToken), `status=${facilityLogin.status}`);
      }
    }

    if (facilityToken) {
      const facilityPaths = [
        "/api/facility/profile",
        "/api/facility/dashboard",
        "/api/facility/labs",
        "/api/hospital/dashboard",
        "/api/hospital/blood/stock",
        "/api/hospital/blood/requests",
        "/api/hospital/history",
        "/api/hospital/donors",
      ];

      for (const path of facilityPaths) {
        const rr = await req(path, { token: facilityToken });
        push(`GET ${path}`, rr.status === 200, `status=${rr.status}`);
      }
    } else {
      push("Facility dashboard/hospital route checks", false, "Skipped because admin login/approval failed");
    }

    const smsReq = await req("/api/auth/request-otp", {
      method: "POST",
      body: {
        email: `sms.${now}@example.com`,
        phone: "9876543210",
        channel: "both",
        purpose: "register",
      },
    });
    const smsResult = smsReq.data?.delivery?.results?.find((x) => x.channel === "sms");
    push(
      "POST /api/auth/request-otp both (sms path)",
      smsReq.status === 200 && Boolean(smsResult),
      `status=${smsReq.status}; smsDelivered=${smsResult?.delivered}`
    );
  } catch (error) {
    push("Smoke script runtime", false, error.message);
  }

  const failed = checks.filter((check) => !check.ok);
  console.log("--- SMOKE TEST SUMMARY ---");
  console.log(`Total: ${checks.length}, Passed: ${checks.length - failed.length}, Failed: ${failed.length}`);
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} | ${check.name} | ${check.detail}`);
  }

  if (failed.length) {
    process.exitCode = 1;
  }
})();
