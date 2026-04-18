import ApiError from "../errors/api-error.js";
import { signToken } from "../utils/jwt.js";
import { createUserByRole, findAuthUserByEmail, findProfileByRoleAndId } from "../repositories/auth.repository.js";
import Otp from "../models/otp.model.js";
import { deliverOtp, getOtpProviderStatus, normalizePhoneNumber, verifySmsOtp } from "./otp-delivery.service.js";

const OTP_EXPIRY_MINUTES = 10;
const DEV_OTP_ENABLED = process.env.ENABLE_DEV_OTP === "true";

const toPoint = (payload) => {
  const latitude = Number(payload?.latitude);
  const longitude = Number(payload?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    type: "Point",
    coordinates: [longitude, latitude],
  };
};

const buildOtpCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const channelsFromRequest = (channel) => {
  if (channel === "both") return ["email", "sms"];
  return [channel];
};

const ensureOtpVerifiedForRegistration = async (email) => {
  const normalizedEmail = email.toLowerCase();
  const otp = await Otp.findOne({ email: normalizedEmail, purpose: "register" });

  if (!otp) {
    throw new ApiError(400, "OTP verification required before registration");
  }

  if (otp.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "OTP expired. Request a new OTP");
  }

  // Backward compatibility for OTP documents created before channel-specific flags existed.
  if (!Array.isArray(otp.requiredChannels) || otp.requiredChannels.length === 0) {
    if (!otp.verified) {
      throw new ApiError(400, "OTP not verified. Please verify OTP to continue");
    }
    return;
  }

  if (otp.requiredChannels.includes("email") && !otp.emailVerified) {
    throw new ApiError(400, "Email OTP is not verified");
  }

  if (otp.requiredChannels.includes("sms") && !otp.smsVerified) {
    throw new ApiError(400, "SMS OTP is not verified");
  }

  if (!otp.verified) {
    throw new ApiError(400, "OTP not verified. Please verify OTP to continue");
  }
};

const getRedirect = (role) => {
  if (role === "donor") return "/donor";
  if (role === "hospital") return "/hospital";
  if (role === "blood-lab") return "/lab";
  if (role === "admin") return "/admin";
  return "/";
};

const hasValidPointCoordinates = (coordinates) => {
  return (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    coordinates.every((value) => Number.isFinite(Number(value)))
  );
};

const sanitizeGeoLocation = (user) => {
  const location = user?.address?.location;
  if (!location) return;

  if (location.type === "Point" && hasValidPointCoordinates(location.coordinates)) {
    user.address.location = {
      type: "Point",
      coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
    };
    return;
  }

  // Legacy documents may contain { type: "Point" } without coordinates.
  // Remove invalid location so 2dsphere index updates do not fail on login/profile updates.
  user.address.location = undefined;
};

export const registerUser = async (payload) => {
  if (!payload.role) {
    throw new ApiError(400, "Role is required");
  }

  await ensureOtpVerifiedForRegistration(payload.email);

  const normalizedPayload = { ...payload };

  const locationPoint =
    toPoint(payload?.geoLocation) ||
    toPoint(payload?.location) ||
    (Array.isArray(payload?.address?.location?.coordinates)
      ? payload.address.location
      : null);

  if (locationPoint) {
    normalizedPayload.address = {
      ...normalizedPayload.address,
      location: locationPoint,
    };
  }

  if (normalizedPayload.role === "hospital" || normalizedPayload.role === "blood-lab") {
    if (!normalizedPayload.name && normalizedPayload.fullName) {
      normalizedPayload.name = normalizedPayload.fullName;
    }
    if (!normalizedPayload.facilityType) {
      normalizedPayload.facilityType = normalizedPayload.role;
    }
  }

  const user = await createUserByRole(normalizedPayload);
  if (!user) {
    throw new ApiError(400, "Invalid role");
  }

  await Otp.deleteOne({ email: payload.email.toLowerCase(), purpose: "register" });

  return {
    success: true,
    message:
      payload.role === "donor"
        ? "Donor registered successfully! Redirecting to dashboard..."
        : "Facility registered successfully! Please wait for admin approval.",
    user: { id: user._id, email: user.email, role: user.role },
    redirect: payload.role === "donor" ? "/donor/dashboard" : "/",
  };
};

export const requestOtpCode = async ({ email, phone, purpose = "register", channel = "both" }) => {
  const normalizedEmail = email.toLowerCase();
  const normalizedPhone = phone ? normalizePhoneNumber(phone) : undefined;
  const requiredChannels = channelsFromRequest(channel);
  const code = buildOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  if ((channel === "sms" || channel === "both") && !phone) {
    throw new ApiError(400, "Phone number is required for SMS OTP");
  }

  await Otp.findOneAndUpdate(
    { email: normalizedEmail, purpose },
    {
      code,
      phone: normalizedPhone,
      requiredChannels,
      emailVerified: !requiredChannels.includes("email"),
      smsVerified: !requiredChannels.includes("sms"),
      emailVerifiedAt: null,
      smsVerifiedAt: null,
      expiresAt,
      verified: false,
      verifiedAt: null,
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );

  const delivery = await deliverOtp({
    email: normalizedEmail,
    phone: normalizedPhone,
    code,
    purpose,
    channel,
  });

  const deliveryResults = Array.isArray(delivery?.results) ? delivery.results : [];
  const emailRequired = requiredChannels.includes("email");
  const smsRequired = requiredChannels.includes("sms");
  const emailDelivered = emailRequired
    ? Boolean(deliveryResults.find((result) => result.channel === "email")?.delivered)
    : true;
  const smsDelivered = smsRequired
    ? Boolean(deliveryResults.find((result) => result.channel === "sms")?.delivered)
    : true;

  if (!delivery.delivered && process.env.NODE_ENV === "production") {
    throw new ApiError(503, "Unable to deliver OTP via configured providers");
  }

  if (!emailDelivered) {
    throw new ApiError(503, "Unable to deliver Email OTP. Please try again or contact support.");
  }

  if (smsRequired && !smsDelivered && process.env.NODE_ENV === "production") {
    throw new ApiError(503, "Unable to deliver SMS OTP. Please try again.");
  }

  // In development, return OTP for easy testing when delivery setup is incomplete.
  const response = {
    success: true,
    message: "OTP sent successfully",
    expiresInMinutes: OTP_EXPIRY_MINUTES,
    delivery,
    providerStatus: getOtpProviderStatus(),
  };

  if (DEV_OTP_ENABLED) {
    if (requiredChannels.includes("email") || !process.env.TWILIO_VERIFY_SERVICE_SID) {
      response.devOtp = code;
    }
  }

  return response;
};

export const verifyOtpCode = async ({ email, phone, channel = "email", code, purpose = "register" }) => {
  const normalizedEmail = email.toLowerCase();

  const otp = await Otp.findOne({ email: normalizedEmail, purpose });
  if (!otp) {
    throw new ApiError(404, "OTP not found. Request OTP first");
  }

  if (otp.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "OTP expired. Request a new OTP");
  }

  if (channel === "email") {
    if (otp.code !== code) {
      throw new ApiError(400, "Invalid OTP code");
    }

    otp.emailVerified = true;
    otp.emailVerifiedAt = new Date();
  } else {
    const smsPhone = normalizePhoneNumber(phone || otp.phone);
    if (!smsPhone) {
      throw new ApiError(400, "Phone number is required for SMS OTP verification");
    }

    if (process.env.TWILIO_VERIFY_SERVICE_SID) {
      const smsVerification = await verifySmsOtp({ phone: smsPhone, code });
      if (!smsVerification.verified) {
        throw new ApiError(400, smsVerification.reason || "Invalid OTP code");
      }
    } else if (otp.code !== code) {
      throw new ApiError(400, "Invalid OTP code");
    }

    otp.smsVerified = true;
    otp.smsVerifiedAt = new Date();
    otp.phone = smsPhone;
  }

  const requiredChannels = Array.isArray(otp.requiredChannels) && otp.requiredChannels.length
    ? otp.requiredChannels
    : ["email"];

  const emailOk = !requiredChannels.includes("email") || otp.emailVerified;
  const smsOk = !requiredChannels.includes("sms") || otp.smsVerified;

  otp.verified = emailOk && smsOk;
  otp.verifiedAt = otp.verified ? new Date() : null;
  await otp.save();

  return {
    success: true,
    message: otp.verified
      ? "OTP verified successfully"
      : `${channel.toUpperCase()} OTP verified. Verify remaining channel(s) to continue registration`,
    verifiedChannels: {
      email: Boolean(otp.emailVerified),
      sms: Boolean(otp.smsVerified),
    },
    allRequiredVerified: Boolean(otp.verified),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await findAuthUserByEmail(email);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.role === "hospital" || user.role === "blood-lab") {
    if (user.status === "pending") {
      throw new ApiError(403, "Your account is awaiting admin approval. Please wait before logging in.");
    }
    if (user.status === "rejected") {
      throw new ApiError(403, "Your registration has been rejected by admin. Contact support for details.");
    }
  }

  sanitizeGeoLocation(user);
  user.lastLogin = new Date();
  if (Array.isArray(user.history)) {
    user.history.push({
      eventType: "Login",
      description: "Facility logged in successfully",
      date: new Date(),
    });
    if (user.history.length > 50) user.history = user.history.slice(-50);
  }
  await user.save();

  const token = signToken({ id: user._id, role: user.role });

  return {
    success: true,
    message: "Login successful",
    token,
    user: { id: user._id, email: user.email, role: user.role, status: user.status },
    redirect: getRedirect(user.role),
  };
};

export const getUserProfile = async ({ role, id }) => {
  const user = await findProfileByRoleAndId(role, id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return {
    success: true,
    message: "Profile fetched successfully",
    user,
    data: { user },
  };
};

export const getOtpDebugStatus = async ({ email, purpose = "register" }) => {
  const normalizedEmail = email.toLowerCase();
  const otp = await Otp.findOne({ email: normalizedEmail, purpose }).lean();

  if (!otp) {
    return {
      success: true,
      message: "No OTP record found",
      otp: null,
      providerStatus: getOtpProviderStatus(),
      data: {
        otp: null,
        providerStatus: getOtpProviderStatus(),
      },
    };
  }

  const requiredChannels = Array.isArray(otp.requiredChannels) && otp.requiredChannels.length
    ? otp.requiredChannels
    : ["email"];

  return {
    success: true,
    message: "OTP status fetched",
    otp: {
      email: otp.email,
      phone: otp.phone || null,
      purpose: otp.purpose,
      requiredChannels,
      verified: Boolean(otp.verified),
      verifiedAt: otp.verifiedAt || null,
      verifiedChannels: {
        email: Boolean(otp.emailVerified || otp.verified),
        sms: Boolean(otp.smsVerified),
      },
      emailVerifiedAt: otp.emailVerifiedAt || null,
      smsVerifiedAt: otp.smsVerifiedAt || null,
      expiresAt: otp.expiresAt,
      isExpired: otp.expiresAt ? new Date(otp.expiresAt).getTime() < Date.now() : true,
      createdAt: otp.createdAt,
      updatedAt: otp.updatedAt,
      ...(process.env.NODE_ENV !== "production" ? { code: otp.code } : {}),
    },
    providerStatus: getOtpProviderStatus(),
    data: {
      otp: {
        email: otp.email,
        phone: otp.phone || null,
        purpose: otp.purpose,
        requiredChannels,
        verified: Boolean(otp.verified),
        verifiedAt: otp.verifiedAt || null,
        verifiedChannels: {
          email: Boolean(otp.emailVerified || otp.verified),
          sms: Boolean(otp.smsVerified),
        },
        emailVerifiedAt: otp.emailVerifiedAt || null,
        smsVerifiedAt: otp.smsVerifiedAt || null,
        expiresAt: otp.expiresAt,
        isExpired: otp.expiresAt ? new Date(otp.expiresAt).getTime() < Date.now() : true,
        createdAt: otp.createdAt,
        updatedAt: otp.updatedAt,
        ...(process.env.NODE_ENV !== "production" ? { code: otp.code } : {}),
      },
      providerStatus: getOtpProviderStatus(),
    },
  };
};
