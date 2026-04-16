import express from "express";
import {
  getAllLabs,
  getFacilityDashboard,
  getProfile,
  updateProfile,
} from "../controllers/facility.controller.js";
import { protectFacility } from "../middleware/facility.middleware.js";


const router = express.Router();

/**
 * @route   GET /api/facility/dashboard
 * @desc    Get facility dashboard stats
 * @access  Private (facility only)
 */
router.get("/dashboard", protectFacility, getFacilityDashboard);

/**
 * @route   GET /api/facility/profile
 * @desc    Get facility profile details
 * @access  Private
 */
router.get("/profile", protectFacility, getProfile);

/**
 * @route   PUT /api/facility/profile
 * @desc    Update facility profile
 * @access  Private
 */
router.put("/profile", protectFacility, updateProfile);

router.get("/labs", protectFacility , getAllLabs);

export default router;