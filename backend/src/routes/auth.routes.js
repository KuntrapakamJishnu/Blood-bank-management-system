import express from "express";
import {
	register,
	login,
	getProfile,
	requestOtp,
	verifyOtp,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validate from "../middleware/validate.middleware.js";
import {
	loginSchema,
	registerSchema,
	otpRequestSchema,
	otpVerifySchema,
} from "../validators/auth.validator.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/request-otp", validate(otpRequestSchema), requestOtp);
router.post("/verify-otp", validate(otpVerifySchema), verifyOtp);
router.get("/profile", protect, getProfile);

export default router;
