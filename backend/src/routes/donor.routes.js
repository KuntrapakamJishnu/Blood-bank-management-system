import express from "express";
import { getDonorCamps, getDonorHistory, getDonorProfile, getDonorStats, updateDonorProfile } from "../controllers/donor.controller.js";
import { protectDonor } from "../middleware/donor.middleware.js";


const router = express.Router();

router.get("/profile", protectDonor, getDonorProfile)

router.put("/profile", protectDonor, updateDonorProfile);

router.get("/camps", protectDonor, getDonorCamps);

router.get("/history", protectDonor, getDonorHistory);

router.get("/stats", protectDonor, getDonorStats);



export default router;