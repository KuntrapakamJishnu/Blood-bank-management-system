import asyncHandler from "../utils/async-handler.js";
import ApiError from "../errors/api-error.js";
import EmergencyRequest from "../models/emergency-request.model.js";
import Donor from "../models/donor.model.js";
import Facility from "../models/facility.model.js";
import ChatThread from "../models/chat.model.js";

// Donor: Create emergency request
export const createEmergencyRequest = asyncHandler(async (req, res) => {
  const { facilityId, bloodType, quantity, urgency, reason } = req.body;
  const donorId = req.user.id;

  // Validate input
  if (!facilityId || !bloodType) {
    throw new ApiError(400, "Facility ID and blood type are required");
  }

  // Fetch donor and facility
  const donor = await Donor.findById(donorId);
  const facility = await Facility.findById(facilityId);

  if (!donor) throw new ApiError(404, "Donor not found");
  if (!facility) throw new ApiError(404, "Facility not found");

  // Calculate distance if coordinates available
  let distance = 0;
  if (donor.address?.location?.coordinates && facility.address?.location?.coordinates) {
    const [donorLng, donorLat] = donor.address.location.coordinates;
    const [facilityLng, facilityLat] = facility.address.location.coordinates;

    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = ((facilityLat - donorLat) * Math.PI) / 180;
    const dLng = ((facilityLng - donorLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((donorLat * Math.PI) / 180) *
        Math.cos((facilityLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distance = Math.round(R * c * 100) / 100;
  }

  // Calculate ETA (base speed 40 km/h + facility response time)
  const avgSpeed = 40; // km/h
  const travelTime = distance > 0 ? Math.ceil((distance / avgSpeed) * 60) : 0;
  const facilityResponseTime = facility.responseTimeMinutes || 30;
  const estimatedETA = travelTime + facilityResponseTime;

  const newRequest = new EmergencyRequest({
    donor: donorId,
    facility: facilityId,
    bloodType,
    quantity: quantity || 1,
    urgency: urgency || "standard",
    reason,
    distance,
    estimatedETA,
    donorLocation: donor.address?.location,
    facilityLocation: facility.address?.location,
  });

  await newRequest.save();

  // Auto-create chat thread
  let chatThread = await ChatThread.findOne({
    donor: donorId,
    facility: facilityId,
  });

  if (!chatThread) {
    chatThread = new ChatThread({
      donor: donorId,
      facility: facilityId,
      emergencyRequest: newRequest._id,
      subject: `Emergency Blood Request - ${bloodType}`,
      messages: [],
    });
    await chatThread.save();
  }

  res.status(201).json({
    success: true,
    message: "Emergency request created successfully",
    data: newRequest,
  });
});

// Donor: Get their emergency requests
export const getDonorEmergencyRequests = asyncHandler(async (req, res) => {
  const donorId = req.user.id;
  const { status, adminStatus } = req.query;

  const filter = { donor: donorId };
  if (status) filter.status = status;
  if (adminStatus) filter.adminStatus = adminStatus;

  const requests = await EmergencyRequest.find(filter)
    .populate("facility", "name facilityType address phone email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Emergency requests fetched successfully",
    count: requests.length,
    data: requests,
  });
});

// Facility: Get their emergency requests
export const getFacilityEmergencyRequests = asyncHandler(async (req, res) => {
  const facilityId = req.user.id;
  const { status, adminStatus, urgency } = req.query;

  const filter = { facility: facilityId };
  if (status) filter.status = status;
  if (adminStatus) filter.adminStatus = adminStatus;
  if (urgency) filter.urgency = urgency;

  const requests = await EmergencyRequest.find(filter)
    .populate("donor", "name email phone address")
    .sort({ urgency: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Emergency requests fetched successfully",
    count: requests.length,
    data: requests,
  });
});

// Admin: Get all emergency requests (with filtering)
export const getAllEmergencyRequests = asyncHandler(async (req, res) => {
  const { adminStatus, urgency, status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (adminStatus) filter.adminStatus = adminStatus;
  if (urgency) filter.urgency = urgency;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const requests = await EmergencyRequest.find(filter)
    .populate("donor", "name email phone address.city")
    .populate("facility", "name facilityType address.city phone")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await EmergencyRequest.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "All emergency requests fetched successfully",
    count: requests.length,
    total,
    pages: Math.ceil(total / limit),
    page: parseInt(page),
    data: requests,
  });
});

// Admin: Approve emergency request
export const approveEmergencyRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  const request = await EmergencyRequest.findByIdAndUpdate(
    id,
    {
      adminStatus: "approved",
      adminNotes,
      priority: "high",
    },
    { new: true }
  )
    .populate("donor", "name email")
    .populate("facility", "name email");

  if (!request) throw new ApiError(404, "Emergency request not found");

  res.status(200).json({
    success: true,
    message: "Emergency request approved successfully",
    data: request,
  });
});

// Admin: Reject emergency request
export const rejectEmergencyRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { adminNotes } = req.body;

  const request = await EmergencyRequest.findByIdAndUpdate(
    id,
    {
      adminStatus: "rejected",
      adminNotes,
      status: "cancelled",
    },
    { new: true }
  )
    .populate("donor", "name email")
    .populate("facility", "name email");

  if (!request) throw new ApiError(404, "Emergency request not found");

  res.status(200).json({
    success: true,
    message: "Emergency request rejected successfully",
    data: request,
  });
});

// Facility: Acknowledge request
export const acknowledgeEmergencyRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await EmergencyRequest.findByIdAndUpdate(
    id,
    {
      status: "acknowledged",
      "timeline.acknowledged": new Date(),
    },
    { new: true }
  );

  if (!request) throw new ApiError(404, "Emergency request not found");

  res.status(200).json({
    success: true,
    message: "Emergency request acknowledged successfully",
    data: request,
  });
});

// Facility: Mark request as in-progress
export const startEmergencyRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await EmergencyRequest.findByIdAndUpdate(
    id,
    {
      status: "in-progress",
      "timeline.inProgress": new Date(),
    },
    { new: true }
  );

  if (!request) throw new ApiError(404, "Emergency request not found");

  res.status(200).json({
    success: true,
    message: "Emergency request marked as in-progress",
    data: request,
  });
});

// Facility: Complete request
export const completeEmergencyRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const request = await EmergencyRequest.findByIdAndUpdate(
    id,
    {
      status: "completed",
      "timeline.completed": new Date(),
      ...(notes && {
        $push: {
          notes: {
            author: req.user.id,
            authorModel: "Facility",
            content: notes,
          },
        },
      }),
    },
    { new: true }
  );

  if (!request) throw new ApiError(404, "Emergency request not found");

  res.status(200).json({
    success: true,
    message: "Emergency request completed successfully",
    data: request,
  });
});

// Get emergency request details
export const getEmergencyRequestDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const request = await EmergencyRequest.findById(id)
    .populate("donor", "name email phone address bloodGroup")
    .populate("facility", "name facilityType address phone email emergencyContact is24x7 operatingHours")
    .populate("notes.author");

  if (!request) throw new ApiError(404, "Emergency request not found");

  res.status(200).json({
    success: true,
    message: "Emergency request details fetched successfully",
    data: request,
  });
});
