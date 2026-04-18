import Donor from "../models/donor.model.js";
import Facility from "../models/facility.model.js";
import BloodCamp from "../models/camp.model.js";
import EmergencyRequest from "../models/emergency-request.model.js";
import asyncHandler from "../utils/async-handler.js";
import ApiError from "../errors/api-error.js";

// 🧩 Get Dashboard Overview Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const totalFacilities = await Facility.countDocuments();
    const pendingFacilities = await Facility.countDocuments({ status: "pending" });
    const approvedFacilities = await Facility.countDocuments({ status: "approved" });

    // Count total donations across all donors
    const donors = await Donor.find({}, "donationHistory");
    const totalDonations = donors.reduce(
      (sum, donor) => sum + (donor.donationHistory?.length || 0),
      0
    );

    const activeDonors = await Donor.countDocuments({ isEligible: true });

    const stats = {
      totalDonors,
      totalFacilities,
      approvedFacilities,
      pendingFacilities,
      totalDonations,
      activeDonors,
      upcomingCamps: 3, // Placeholder
    };

    res.status(200).json({
      success: true,
      message: "Admin dashboard statistics fetched successfully",
      ...stats,
      data: { stats },
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};

// 🧍 Get All Donors
export const getAllDonors = async (req, res) => {
  try {
    // Note: This function was present in your code block but not used in the router
    const donors = await Donor.find().select("-password");
    res.status(200).json({
      success: true,
      message: "Donors fetched successfully",
      donors,
      data: { donors },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching donors" });
  }
};

// 🏥 Get All Facilities (Pending + Approved)
export const getAllFacilities = async (req, res) => {
  try {
    const includeTestData = req.query.includeTestData === "true";
    const filter = includeTestData
      ? {}
      : {
          email: { $not: /^(smoke\.|test\.(hospital|lab)\.)/i },
        };

    const facilities = await Facility.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Facilities fetched successfully",
      facilities,
      data: { facilities },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching facilities" });
  }
};

// ✅ Approve a Facility
export const approveFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ success: false, message: "Facility not found" });

    facility.status = "approved";
    facility.approvedBy = req.user?._id;
    facility.approvedAt = new Date();
    facility.rejectionReason = undefined;

    facility.history.push({
      eventType: "Verification",
      description: "Facility approved by admin",
      date: new Date(),
    });

    await facility.save();

    res.status(200).json({
      success: true,
      message: "Facility approved",
      facility,
      data: { facility },
    });
  } catch (err) {
    console.error("Facility Approval Error:", err);
    res.status(500).json({ success: false, message: "Error approving facility" });
  }
};

// ❌ Reject / Update Facility Status to Rejected
export const rejectFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ success: false, message: "Facility not found" });

    const { rejectionReason } = req.body;
    if (!rejectionReason) return res.status(400).json({ success: false, message: "Rejection reason is required." });

    facility.status = "rejected";
    facility.rejectionReason = rejectionReason;
    facility.approvedBy = undefined;
    facility.approvedAt = undefined;

    facility.history.push({
      eventType: "Verification",
      description: `Facility rejected by admin: ${rejectionReason}`,
      date: new Date(),
    });

    await facility.save();

    res.status(200).json({
      success: true,
      message: "Facility rejected and status updated",
      facility,
      data: { facility },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error rejecting facility" });
  }
};

// ============ BLOOD CAMPS MANAGEMENT ============

// Get all blood camps
export const getAllBloodCamps = asyncHandler(async (req, res) => {
  const { status, facilityId, page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = status;
  if (facilityId) filter.hospital = facilityId;

  const camps = await BloodCamp.find(filter)
    .populate("hospital", "name city address.city phone")
    .sort({ date: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await BloodCamp.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: "Blood camps fetched successfully",
    count: camps.length,
    total,
    pages: Math.ceil(total / limit),
    page: parseInt(page),
    data: camps,
  });
});

// Create blood camp (admin)
export const createBloodCamp = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    hospital,
    venue,
    city,
    state,
    pincode,
    date,
    startTime,
    endTime,
    expectedDonors,
    targetBloodGroups,
  } = req.body;

  // Validate required fields
  if (!title || !hospital || !venue || !city || !date) {
    throw new ApiError(400, "Missing required fields: title, hospital, venue, city, date");
  }

  // Verify hospital exists and is approved
  const facilityExists = await Facility.findOne({
    _id: hospital,
    status: "approved",
    facilityType: "hospital",
  });

  if (!facilityExists) {
    throw new ApiError(404, "Approved hospital not found");
  }

  const newCamp = new BloodCamp({
    title,
    description,
    hospital,
    venue,
    city,
    state,
    pincode,
    date: new Date(date),
    startTime,
    endTime,
    expectedDonors: expectedDonors || 0,
    actualDonors: 0,
    targetBloodGroups: targetBloodGroups || [],
    status: "scheduled",
    createdBy: req.user.id,
  });

  await newCamp.save();
  await newCamp.populate("hospital", "name city phone email");

  res.status(201).json({
    success: true,
    message: "Blood camp created successfully",
    data: newCamp,
  });
});

// Update blood camp
export const updateBloodCamp = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    venue,
    city,
    state,
    pincode,
    date,
    startTime,
    endTime,
    expectedDonors,
    status,
    targetBloodGroups,
  } = req.body;

  const camp = await BloodCamp.findById(id);
  if (!camp) throw new ApiError(404, "Blood camp not found");

  // Update fields
  if (title) camp.title = title;
  if (description) camp.description = description;
  if (venue) camp.venue = venue;
  if (city) camp.city = city;
  if (state) camp.state = state;
  if (pincode) camp.pincode = pincode;
  if (date) camp.date = new Date(date);
  if (startTime) camp.startTime = startTime;
  if (endTime) camp.endTime = endTime;
  if (expectedDonors) camp.expectedDonors = expectedDonors;
  if (status) camp.status = status;
  if (targetBloodGroups) camp.targetBloodGroups = targetBloodGroups;

  await camp.save();
  await camp.populate("hospital", "name city phone email");

  res.status(200).json({
    success: true,
    message: "Blood camp updated successfully",
    data: camp,
  });
});

// Delete blood camp
export const deleteBloodCamp = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const camp = await BloodCamp.findByIdAndDelete(id);
  if (!camp) throw new ApiError(404, "Blood camp not found");

  res.status(200).json({
    success: true,
    message: "Blood camp deleted successfully",
    data: camp,
  });
});

// Get blood camp details
export const getBloodCampDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const camp = await BloodCamp.findById(id).populate(
    "hospital",
    "name city address phone email emergencyContact"
  );

  if (!camp) throw new ApiError(404, "Blood camp not found");

  res.status(200).json({
    success: true,
    message: "Blood camp details fetched successfully",
    data: camp,
  });
});

// ============ EMERGENCY REQUESTS MONITORING ============

// Get emergency request statistics
export const getEmergencyRequestStats = asyncHandler(async (req, res) => {
  const totalRequests = await EmergencyRequest.countDocuments();
  const pendingApproval = await EmergencyRequest.countDocuments({
    adminStatus: "pending",
  });
  const approved = await EmergencyRequest.countDocuments({
    adminStatus: "approved",
  });
  const rejected = await EmergencyRequest.countDocuments({
    adminStatus: "rejected",
  });
  const completed = await EmergencyRequest.countDocuments({ status: "completed" });
  const inProgress = await EmergencyRequest.countDocuments({
    status: "in-progress",
  });

  // Count by urgency
  const urgencyBreakdown = await EmergencyRequest.aggregate([
    {
      $group: {
        _id: "$urgency",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    message: "Emergency request statistics fetched successfully",
    data: {
      totalRequests,
      pendingApproval,
      approved,
      rejected,
      completed,
      inProgress,
      urgencyBreakdown: Object.fromEntries(
        urgencyBreakdown.map((item) => [item._id, item.count])
      ),
    },
  });
});

// ============ SYSTEM MONITORING & ANALYTICS ============

// Get system-wide statistics for admin dashboard
export const getSystemAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const totalDonors = await Donor.countDocuments();
  const activeDonors = await Donor.countDocuments({ isEligible: true });
  const totalFacilities = await Facility.countDocuments();
  const approvedFacilities = await Facility.countDocuments({ status: "approved" });
  const pendingFacilities = await Facility.countDocuments({ status: "pending" });

  const recentDonations = await Donor.aggregate([
    {
      $match: {
        "donationHistory.date": { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: null,
        totalRecentDonations: {
          $sum: {
            $size: {
              $filter: {
                input: "$donationHistory",
                as: "donation",
                cond: { $gte: ["$$donation.date", thirtyDaysAgo] },
              },
            },
          },
        },
      },
    },
  ]);

  const camps = await BloodCamp.countDocuments();
  const upcomingCamps = await BloodCamp.countDocuments({
    date: { $gte: now },
    status: "scheduled",
  });

  res.status(200).json({
    success: true,
    message: "System analytics fetched successfully",
    data: {
      donors: {
        total: totalDonors,
        active: activeDonors,
        inactive: totalDonors - activeDonors,
      },
      facilities: {
        total: totalFacilities,
        approved: approvedFacilities,
        pending: pendingFacilities,
        rejected: totalFacilities - approvedFacilities - pendingFacilities,
      },
      donations: {
        totalRecent30Days:
          recentDonations.length > 0 ? recentDonations[0].totalRecentDonations : 0,
      },
      camps: {
        total: camps,
        upcoming: upcomingCamps,
      },
    },
  });
});