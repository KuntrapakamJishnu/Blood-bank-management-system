import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getAllFacilities,
  approveFacility,
  rejectFacility,
  getDashboardStats,
  getAllDonors,
  getAllBloodCamps,
  createBloodCamp,
  updateBloodCamp,
  deleteBloodCamp,
  getBloodCampDetails,
  getEmergencyRequestStats,
  getSystemAnalytics,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Facility management
router.get("/facilities", protect, authorize("admin", "superadmin"), getAllFacilities);
router.put("/facility/approve/:id", protect, authorize("admin", "superadmin"), approveFacility);
router.put("/facility/reject/:id", protect, authorize("admin", "superadmin"), rejectFacility);

// Dashboard & Stats
router.get("/dashboard", protect, authorize("admin", "superadmin"), getDashboardStats);
router.get("/analytics", protect, authorize("admin", "superadmin"), getSystemAnalytics);
router.get("/donors", protect, authorize("admin", "superadmin"), getAllDonors);

// Blood camps management
router.get("/camps", protect, authorize("admin", "superadmin"), getAllBloodCamps);
router.post("/camps", protect, authorize("admin", "superadmin"), createBloodCamp);
router.put("/camps/:id", protect, authorize("admin", "superadmin"), updateBloodCamp);
router.delete("/camps/:id", protect, authorize("admin", "superadmin"), deleteBloodCamp);
router.get("/camps/:id", protect, authorize("admin", "superadmin"), getBloodCampDetails);

// Emergency requests monitoring
router.get("/emergency-stats", protect, authorize("admin", "superadmin"), getEmergencyRequestStats);

export default router;