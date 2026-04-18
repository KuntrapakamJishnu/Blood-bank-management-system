import asyncHandler from "../utils/async-handler.js";
import ApiError from "../errors/api-error.js";
import ChatThread from "../models/chat.model.js";
import Donor from "../models/donor.model.js";
import Facility from "../models/facility.model.js";

// Get or create chat thread between donor and facility
export const getOrCreateChatThread = asyncHandler(async (req, res) => {
  const { facilityId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  if (userRole !== "donor") {
    throw new ApiError(403, "Only donors can initiate chat");
  }

  let chatThread = await ChatThread.findOne({
    donor: userId,
    facility: facilityId,
  })
    .populate("donor", "name email phone")
    .populate("facility", "name email phone facilityType");

  if (!chatThread) {
    const facility = await Facility.findById(facilityId);
    if (!facility) throw new ApiError(404, "Facility not found");

    chatThread = new ChatThread({
      donor: userId,
      facility: facilityId,
      subject: `Chat with ${facility.name}`,
      messages: [],
    });
    await chatThread.save();
    await chatThread.populate("donor", "name email phone");
    await chatThread.populate("facility", "name email phone facilityType");
  }

  res.status(200).json({
    success: true,
    message: "Chat thread retrieved successfully",
    data: chatThread,
  });
});

// Send message in chat thread
export const sendMessage = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || !content.trim()) {
    throw new ApiError(400, "Message content is required");
  }

  const chatThread = await ChatThread.findById(threadId);
  if (!chatThread) throw new ApiError(404, "Chat thread not found");

  // Verify user is part of this thread
  const isParticipant =
    chatThread.donor.toString() === userId ||
    chatThread.facility.toString() === userId;

  if (!isParticipant) {
    throw new ApiError(403, "You are not part of this chat");
  }

  // Get sender info
  let senderModel, senderName;
  if (chatThread.donor.toString() === userId) {
    const donor = await Donor.findById(userId);
    senderModel = "Donor";
    senderName = donor.name;
  } else {
    const facility = await Facility.findById(userId);
    senderModel = "Facility";
    senderName = facility.name;
  }

  // Add message
  chatThread.messages.push({
    sender: userId,
    senderModel,
    senderName,
    content,
  });

  chatThread.lastMessage = new Date();

  // Update read status for sender
  if (senderModel === "Donor") {
    chatThread.donorLastRead = new Date();
  } else {
    chatThread.facilityLastRead = new Date();
  }

  await chatThread.save();

  // Return latest message
  const lastMessage = chatThread.messages[chatThread.messages.length - 1];

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: {
      threadId,
      message: lastMessage,
    },
  });
});

// Get messages from a chat thread
export const getMessages = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const userId = req.user.id;

  const chatThread = await ChatThread.findById(threadId);
  if (!chatThread) throw new ApiError(404, "Chat thread not found");

  // Verify user is part of this thread
  const isParticipant =
    chatThread.donor.toString() === userId ||
    chatThread.facility.toString() === userId;

  if (!isParticipant) {
    throw new ApiError(403, "You are not part of this chat");
  }

  // Paginate messages
  const skip = (page - 1) * limit;
  const messages = chatThread.messages.slice(-skip - limit, -skip || undefined);

  // Mark messages as read
  if (chatThread.donor.toString() === userId) {
    chatThread.donorLastRead = new Date();
  } else {
    chatThread.facilityLastRead = new Date();
  }
  await chatThread.save();

  res.status(200).json({
    success: true,
    message: "Messages fetched successfully",
    count: messages.length,
    page: parseInt(page),
    data: {
      threadId,
      messages: messages.reverse(),
    },
  });
});

// Get all chat threads for donor
export const getDonorChatThreads = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status = "active" } = req.query;

  const threads = await ChatThread.find({
    donor: userId,
    status,
  })
    .populate("facility", "name email phone facilityType address.city")
    .sort({ lastMessage: -1 })
    .lean();

  // Calculate unread count for each thread
  const threadsWithUnread = threads.map((thread) => ({
    ...thread,
    unreadCount: thread.messages.filter(
      (m) => m.senderModel === "Facility" && (!thread.donorLastRead || m.createdAt > thread.donorLastRead)
    ).length,
  }));

  res.status(200).json({
    success: true,
    message: "Chat threads fetched successfully",
    count: threadsWithUnread.length,
    data: threadsWithUnread,
  });
});

// Get all chat threads for facility
export const getFacilityChatThreads = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status = "active" } = req.query;

  const threads = await ChatThread.find({
    facility: userId,
    status,
  })
    .populate("donor", "name email phone address.city")
    .sort({ lastMessage: -1 })
    .lean();

  // Calculate unread count for each thread
  const threadsWithUnread = threads.map((thread) => ({
    ...thread,
    unreadCount: thread.messages.filter(
      (m) => m.senderModel === "Donor" && (!thread.facilityLastRead || m.createdAt > thread.facilityLastRead)
    ).length,
  }));

  res.status(200).json({
    success: true,
    message: "Chat threads fetched successfully",
    count: threadsWithUnread.length,
    data: threadsWithUnread,
  });
});

// Close chat thread
export const closeChatThread = asyncHandler(async (req, res) => {
  const { threadId } = req.params;
  const userId = req.user.id;

  const chatThread = await ChatThread.findById(threadId);
  if (!chatThread) throw new ApiError(404, "Chat thread not found");

  // Verify user is part of this thread
  const isParticipant =
    chatThread.donor.toString() === userId ||
    chatThread.facility.toString() === userId;

  if (!isParticipant) {
    throw new ApiError(403, "You are not part of this chat");
  }

  chatThread.status = "closed";
  await chatThread.save();

  res.status(200).json({
    success: true,
    message: "Chat thread closed successfully",
    data: chatThread,
  });
});

// Get chat statistics (for admin)
export const getChatStatistics = asyncHandler(async (req, res) => {
  const totalThreads = await ChatThread.countDocuments();
  const activeThreads = await ChatThread.countDocuments({ status: "active" });
  const closedThreads = await ChatThread.countDocuments({ status: "closed" });
  const archivedThreads = await ChatThread.countDocuments({ status: "archived" });

  const totalMessages = await ChatThread.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: { $size: "$messages" } },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "Chat statistics fetched successfully",
    data: {
      totalThreads,
      activeThreads,
      closedThreads,
      archivedThreads,
      totalMessages: totalMessages[0]?.total || 0,
    },
  });
});
