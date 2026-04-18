import asyncHandler from "../utils/async-handler.js";
import {
  getUserProfile,
  getOtpDebugStatus,
  loginUser,
  registerUser,
  requestOtpCode,
  verifyOtpCode,
} from "../services/auth.service.js";

/**
 * REGISTER (Unified)
 */
export const register = asyncHandler(async (req, res) => {
  const response = await registerUser(req.body);
  res.status(201).json(response);
});

/**
 * LOGIN (Unified)
 */
export const login = asyncHandler(async (req, res) => {
  const response = await loginUser(req.body);
  res.status(200).json(response);
});

/**
 * PROFILE FETCH
 */
export const getProfile = asyncHandler(async (req, res) => {
  const response = await getUserProfile(req.user);
  res.status(200).json(response);
});

/**
 * REQUEST OTP
 */
export const requestOtp = asyncHandler(async (req, res) => {
  const response = await requestOtpCode(req.body);
  res.status(200).json(response);
});

/**
 * VERIFY OTP
 */
export const verifyOtp = asyncHandler(async (req, res) => {
  const response = await verifyOtpCode(req.body);
  res.status(200).json(response);
});

/**
 * OTP STATUS (Admin debug)
 */
export const otpStatus = asyncHandler(async (req, res) => {
  const response = await getOtpDebugStatus(req.body);
  res.status(200).json(response);
});