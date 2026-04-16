import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  getAllFacilities,
  approveFacility,
  rejectFacility,
  getDashboardStats,
  getAllDonors,
} from "../controllers/admin.controller.js";

const router = express.Router();
router.get("/facilities", protect, authorize("admin", "superadmin"), getAllFacilities);
router.put("/facility/approve/:id", protect, authorize("admin", "superadmin"), approveFacility);
router.put("/facility/reject/:id", protect, authorize("admin", "superadmin"), rejectFacility);
router.get("/dashboard", protect, authorize("admin", "superadmin"), getDashboardStats);
router.get("/donors", protect, authorize("admin", "superadmin"), getAllDonors);


export default router;