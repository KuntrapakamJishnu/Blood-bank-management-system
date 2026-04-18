import "dotenv/config";
import { randomInt } from "node:crypto";
import mongoose from "mongoose";
import SmokeUser from "../src/models/smoke-user.model.js";
import { findAnyUserByEmail, findAnyUserByPhone } from "../src/repositories/auth.repository.js";

const base = "http://localhost:5000";
const now = Date.now();
const checks = [];
const push = (name, ok, detail = "") => checks.push({ name, ok, detail });

let dbConnected = false;

const buildUniqueEmail = async (prefix, domain) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `${prefix}.${now}.${randomInt(100000, 999999)}@${domain}`;
    if (!(await findAnyUserByEmail(candidate))) {
      return candidate;
    }
  }

  throw new Error(`Unable to generate unique email for ${prefix}`);
};

const buildUniquePhone = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `9${randomInt(100000000, 999999999)}`;
    if (!(await findAnyUserByPhone(candidate))) {
      return candidate;
    }
  }

  throw new Error("Unable to generate unique phone number");
};

const getSmokeUser = async (key) => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to load smoke user fixtures");
  }

  if (!dbConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    dbConnected = true;
  }

  const fixture = await SmokeUser.findOne({ key }).lean();
  if (!fixture?.payload) {
    throw new Error(`Missing smoke user fixture: ${key}`);
  }

  return fixture.payload;
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
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { status: response.status, data };
}

(async () => {
  try {
    const labFixture = await getSmokeUser("lab-register");
    const labEmail = await buildUniqueEmail(labFixture.emailPrefix, labFixture.emailDomain);

    const adminLogin = await req("/api/auth/login", {
      method: "POST",
      body: { email: "admin@bbms.local", password: "bbms@admin" },
    });
    const adminToken = adminLogin.data?.token;
    push("POST /api/auth/login admin", adminLogin.status === 200 && !!adminToken, `status=${adminLogin.status}`);

    const otpReq = await req("/api/auth/request-otp", {
      method: "POST",
      body: { email: labEmail, channel: "email", purpose: "register" },
    });
    push("POST /api/auth/request-otp lab", otpReq.status === 200, `status=${otpReq.status}`);

    const otpVerify = await req("/api/auth/verify-otp", {
      method: "POST",
      body: { email: labEmail, channel: "email", code: otpReq.data?.devOtp, purpose: "register" },
    });
    push("POST /api/auth/verify-otp lab", otpVerify.status === 200, `status=${otpVerify.status}`);

    const reg = await req("/api/auth/register", {
      method: "POST",
      body: {
        role: labFixture.role,
        facilityType: labFixture.facilityType,
        name: labFixture.name,
        email: labEmail,
        password: labFixture.password,
        phone: await buildUniquePhone(),
        emergencyContact: await buildUniquePhone(),
        registrationNumber: `${labFixture.registrationPrefix}${now}`,
        address: labFixture.address,
        documents: labFixture.documents,
      },
    });
    push("POST /api/auth/register blood-lab", reg.status === 201, `status=${reg.status}`);

    const facList = await req("/api/admin/facilities?includeTestData=true", { token: adminToken });
    const created = facList.data?.facilities?.find((f) => f.email === labEmail);
    push("GET /api/admin/facilities", facList.status === 200 && !!created?._id, `status=${facList.status}`);

    const approve = await req(`/api/admin/facility/approve/${created._id}`, { method: "PUT", token: adminToken });
    push("PUT /api/admin/facility/approve lab", approve.status === 200, `status=${approve.status}`);

    const labLogin = await req("/api/auth/login", {
      method: "POST",
      body: { email: labEmail, password: "Password@123" },
    });
    const labToken = labLogin.data?.token;
    push("POST /api/auth/login lab", labLogin.status === 200 && !!labToken, `status=${labLogin.status}`);

    for (const path of [
      "/api/blood-lab/dashboard",
      "/api/blood-lab/history",
      "/api/blood-lab/camps",
      "/api/blood-lab/blood/stock",
      "/api/blood-lab/blood/requests",
      "/api/blood-lab/donations/recent",
      "/api/blood-lab/donors/search?term=smoke",
    ]) {
      const rr = await req(path, { token: labToken });
      push(`GET ${path}`, rr.status === 200, `status=${rr.status}`);
    }

    const campCreate = await req("/api/blood-lab/camps", {
      method: "POST",
      token: labToken,
      body: {
        title: "Amaravathi Blood Donation Drive",
        description: "automation",
        date: new Date(Date.now() + 86400000).toISOString(),
        time: { start: "10:00", end: "14:00" },
        location: { venue: "Community Hall", city: "Hyderabad", state: "Telangana" },
        expectedDonors: 20,
      },
    });
    push("POST /api/blood-lab/camps", campCreate.status === 201, `status=${campCreate.status}`);

    const campRoutes = await req("/api/camps", { token: labToken });
    push("GET /api/camps", campRoutes.status === 200, `status=${campRoutes.status}`);
  } catch (error) {
    push("Smoke script runtime", false, error.message);
  } finally {
    if (dbConnected) {
      await mongoose.disconnect();
    }
  }

  const failed = checks.filter((check) => !check.ok);
  console.log("--- LAB/CAMP SMOKE TEST SUMMARY ---");
  console.log(`Total: ${checks.length}, Passed: ${checks.length - failed.length}, Failed: ${failed.length}`);
  for (const check of checks) {
    console.log(`${check.ok ? "PASS" : "FAIL"} | ${check.name} | ${check.detail}`);
  }
  if (failed.length) process.exitCode = 1;
})();
