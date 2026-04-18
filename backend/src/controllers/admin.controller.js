import Donor from "../models/donor.model.js";
import Facility from "../models/facility.model.js";

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
    const facilities = await Facility.find();
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