import express from "express";
import {
  createBloodCamp,
  deleteBloodCamp,
  getBloodLabCamps,
  getBloodLabDashboard,
  getBloodLabHistory,
  updateBloodCamp,        // ADD THIS
  updateCampStatus,       // ADD THIS
  addBloodStock,
  removeBloodStock,
  getBloodStock,
  updateBloodRequestStatus,
  getLabBloodRequests,
  getAllLabs,
} from "../controllers/blood-lab.controller.js";
import { authorizeFacilityTypes, protectFacility } from "../middleware/facility.middleware.js";
import { getRecentDonations, markDonation, searchDonor } from "../controllers/donor.controller.js";

const router = express.Router();

// Dashboard routes
router.get("/dashboard", protectFacility, authorizeFacilityTypes("blood-lab"), getBloodLabDashboard);
router.get("/history", protectFacility, authorizeFacilityTypes("blood-lab"), getBloodLabHistory);

// Camp management
router.post("/camps", protectFacility, authorizeFacilityTypes("blood-lab"), createBloodCamp);
router.get("/camps", protectFacility, authorizeFacilityTypes("blood-lab"), getBloodLabCamps);
router.put("/camps/:id", protectFacility, authorizeFacilityTypes("blood-lab"), updateBloodCamp);        // ADD THIS
router.patch("/camps/:id/status", protectFacility, authorizeFacilityTypes("blood-lab"), updateCampStatus); // ADD THIS
router.delete("/camps/:id", protectFacility, authorizeFacilityTypes("blood-lab"), deleteBloodCamp);

// Blood stock routes
router.post("/blood/add", protectFacility, authorizeFacilityTypes("blood-lab"), addBloodStock);
router.post("/blood/remove", protectFacility, authorizeFacilityTypes("blood-lab"), removeBloodStock);
router.get("/blood/stock", protectFacility, authorizeFacilityTypes("blood-lab"), getBloodStock);


// Blood request routes for labs
router.get("/blood/requests", protectFacility, authorizeFacilityTypes("blood-lab"), getLabBloodRequests);
router.put("/blood/requests/:id", protectFacility, authorizeFacilityTypes("blood-lab"), updateBloodRequestStatus);

// Get labs for hospitals
router.get("/labs", protectFacility, authorizeFacilityTypes("blood-lab"), getAllLabs);

// Add these routes to your bloodLabRoutes.js
router.get("/donors/search", protectFacility, authorizeFacilityTypes("blood-lab"), searchDonor);
router.post("/donors/donate/:id", protectFacility, authorizeFacilityTypes("blood-lab"), markDonation);
router.get("/donations/recent", protectFacility, authorizeFacilityTypes("blood-lab"), getRecentDonations);

export default router;