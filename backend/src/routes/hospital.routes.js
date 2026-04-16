import express from "express";
import { authorizeFacilityTypes, protectFacility } from "../middleware/facility.middleware.js";
import {
  hospitalRequestBlood,
  getHospitalRequests,
  getHospitalDashboard,
  getHospitalStock,
  getHospitalHistory,
  getAllDonors,
  logContactAttempt
} from "../controllers/hospital.controller.js";

const router = express.Router();

// Blood request routes for hospitals
router.post("/blood/request", protectFacility, authorizeFacilityTypes("hospital"), hospitalRequestBlood);
router.get("/blood/requests", protectFacility, authorizeFacilityTypes("hospital"), getHospitalRequests);

// Dashboard routes
router.get("/dashboard", protectFacility, authorizeFacilityTypes("hospital"), getHospitalDashboard);
router.get("/blood/stock", protectFacility, authorizeFacilityTypes("hospital"), getHospitalStock);
router.get("/history", protectFacility, authorizeFacilityTypes("hospital"), getHospitalHistory);

// Add to bloodLabRoutes.js
router.get("/donors", protectFacility, authorizeFacilityTypes("hospital"), getAllDonors);
router.post("/donors/:id/contact", protectFacility, authorizeFacilityTypes("hospital"), logContactAttempt);

export default router;