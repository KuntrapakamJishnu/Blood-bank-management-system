import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  getOrCreateChatThread,
  sendMessage,
  getMessages,
  getDonorChatThreads,
  getFacilityChatThreads,
  closeChatThread,
  getChatStatistics,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Chat thread routes
router.get("/threads/donor", protect, authorize("donor"), getDonorChatThreads);
router.get("/threads/facility", protect, authorize("hospital", "blood-lab"), getFacilityChatThreads);
router.get("/facility/:facilityId", protect, authorize("donor"), getOrCreateChatThread);
router.post("/:threadId/messages", protect, sendMessage);
router.get("/:threadId/messages", protect, getMessages);
router.put("/:threadId/close", protect, closeChatThread);

// Admin statistics
router.get("/statistics", protect, authorize("admin", "superadmin"), getChatStatistics);

export default router;
