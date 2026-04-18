import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  createEmergencyRequest,
  getDonorEmergencyRequests,
  getFacilityEmergencyRequests,
  getAllEmergencyRequests,
  approveEmergencyRequest,
  rejectEmergencyRequest,
  acknowledgeEmergencyRequest,
  startEmergencyRequest,
  completeEmergencyRequest,
  getEmergencyRequestDetails,
} from "../controllers/emergency-request.controller.js";

const router = express.Router();

// Donor routes
router.post("/", protect, authorize("donor"), createEmergencyRequest);
router.get("/donor/requests", protect, authorize("donor"), getDonorEmergencyRequests);
router.get("/:id", protect, getEmergencyRequestDetails);

// Facility routes
router.get("/facility/requests", protect, authorize("hospital", "blood-lab"), getFacilityEmergencyRequests);
router.put("/:id/acknowledge", protect, authorize("hospital", "blood-lab"), acknowledgeEmergencyRequest);
router.put("/:id/start", protect, authorize("hospital", "blood-lab"), startEmergencyRequest);
router.put("/:id/complete", protect, authorize("hospital", "blood-lab"), completeEmergencyRequest);

// Admin routes
router.get("/", protect, authorize("admin", "superadmin"), getAllEmergencyRequests);
router.put("/:id/approve", protect, authorize("admin", "superadmin"), approveEmergencyRequest);
router.put("/:id/reject", protect, authorize("admin", "superadmin"), rejectEmergencyRequest);

export default router;
