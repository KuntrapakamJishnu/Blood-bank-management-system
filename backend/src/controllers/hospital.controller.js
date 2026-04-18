import Blood from "../models/blood.model.js";
import Facility from "../models/facility.model.js";
import BloodRequest from "../models/blood-request.model.js";
import Donor from "../models/donor.model.js";

/* ==============================================================
   HOSPITAL BLOOD REQUEST MANAGEMENT
   ============================================================== */

/**
 * @desc Hospital requests blood from lab
 * @route POST /api/hospital/blood/request
 * @access Private (Hospital)
 */
export const hospitalRequestBlood = async (req, res) => {
  try {
    const hospitalId = req.user._id;
    const { labId, bloodType, units } = req.body;

    // Validation
    if (!labId || !bloodType || !units) {
      return res.status(400).json({
        success: false,
        message: "Please provide labId, bloodType, and units"
      });
    }

    if (units < 1) {
      return res.status(400).json({
        success: false,
        message: "Units must be at least 1"
      });
    }

    // Check if lab exists and is approved
    const lab = await Facility.findOne({ 
      _id: labId, 
      facilityType: "blood-lab", 
      status: "approved" 
    });

    if (!lab) {
      return res.status(404).json({
        success: false,
        message: "Blood lab not found or not approved"
      });
    }

    // Create blood request
    const request = await BloodRequest.create({
      hospitalId,
      labId,
      bloodType,
      units
    });

    // Add to hospital history
    await Facility.findByIdAndUpdate(hospitalId, {
      $push: {
        history: {
          eventType: "Stock Update",
          description: `Requested ${units} units of ${bloodType} from ${lab.name}`,
          date: new Date(),
          referenceId: request._id,
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Blood request sent to lab successfully",
      data: request
    });

  } catch (error) {
    console.error("Hospital Request Blood Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error sending blood request" 
    });
  }
};

/**
 * @desc Get hospital's blood requests
 * @route GET /api/hospital/blood/requests
 * @access Private (Hospital)
 */
export const getHospitalRequests = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const requests = await BloodRequest.find({ hospitalId })
      .populate("labId", "name email phone address")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Hospital blood requests fetched successfully",
      data: requests,
      requests,
    });
  } catch (err) {
    console.error("Get Hospital Requests Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch blood requests" 
    });
  }
};

/* ==============================================================
   HOSPITAL DASHBOARD & INVENTORY
   ============================================================== */

export const getHospitalDashboard = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const [inventory, requests, hospital] = await Promise.all([
      Blood.find({ hospital: hospitalId }),
      BloodRequest.find({ hospitalId }).populate("labId", "name").sort({ createdAt: -1 }),
      Facility.findById(hospitalId).select("history name email phone address lastLogin")
    ]);

    const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const pendingRequests = requests.filter(r => r.status === "pending").length;

    const stats = {
      totalUnits,
      pendingRequests,
      totalRequests: requests.length,
    };

    res.json({
      success: true,
      message: "Hospital dashboard fetched successfully",
      stats,
      inventory,
      recentRequests: requests.slice(0, 5),
      hospital,
      data: {
        stats,
        inventory,
        recentRequests: requests.slice(0, 5),
        hospital,
      },
    });

  } catch (error) {
    console.error("Hospital Dashboard Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to load hospital dashboard" 
    });
  }
};

export const getHospitalStock = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const stock = await Blood.find({ hospital: hospitalId }).sort({ bloodGroup: 1 });

    res.json({
      success: true,
      message: "Hospital blood stock fetched successfully",
      data: stock,
      stock,
    });
  } catch (error) {
    console.error("Get Hospital Stock Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch hospital stock" 
    });
  }
};

export const getHospitalHistory = async (req, res) => {
  try {
    const hospitalId = req.user._id;

    const hospital = await Facility.findById(hospitalId).select("history lastLogin");

    if (!hospital) return res.status(404).json({ 
      success: false, 
      message: "Hospital not found" 
    });

    const history = hospital.history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      message: "Hospital history fetched successfully",
      history,
      data: { history },
    });

  } catch (error) {
    console.error("Get Hospital History Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch hospital history" 
    });
  }
};

// Add to bloodLabController.js

/**
 * @desc Get all donors with filtering and pagination
 * @route GET /api/blood-lab/donors
 * @access Private (Blood Lab)
 */
export const getAllDonors = async (req, res) => {
  try {
    const {
      search = "",
      bloodGroup = "all",
      city = "all",
      availability = "all",
      sortBy = "lastDonation",
      latitude,
      longitude,
      maxDistanceKm = 50,
      page = 1,
      limit = 20
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const andConditions = [];

    // Search filter
    if (search) {
      andConditions.push({
        $or: [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { 'address.city': { $regex: search, $options: "i" } }
        ],
      });
    }

    // Blood group filter
    if (bloodGroup !== "all") {
      andConditions.push({ bloodGroup });
    }

    // City filter
    if (city !== "all") {
      andConditions.push({ 'address.city': { $regex: city, $options: "i" } });
    }

    // Availability filter
    if (availability !== "all") {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      if (availability === "available") {
        andConditions.push({
          $or: [
          { lastDonationDate: { $lt: threeMonthsAgo } },
          { lastDonationDate: { $exists: false } }
          ],
        });
      } else if (availability === "soon") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 2);
        andConditions.push({
          lastDonationDate: {
            $gte: threeMonthsAgo,
            $lte: oneMonthAgo,
          },
        });
      }
    }

    const filter = andConditions.length ? { $and: andConditions } : {};

    const hasGeoSearch = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
    const maxDistanceMeters = Math.max(Number(maxDistanceKm) || 50, 1) * 1000;

    // Sort options
    const sortOptions = {};
    switch (sortBy) {
      case "name":
        sortOptions.fullName = 1;
        break;
      case "bloodGroup":
        sortOptions.bloodGroup = 1;
        break;
      case "city":
        sortOptions['address.city'] = 1;
        break;
      case "distance":
        sortOptions.distanceMeters = 1;
        break;
      case "lastDonation":
      default:
        sortOptions.lastDonationDate = -1;
        break;
    }

    let donors = [];
    let total = 0;

    if (hasGeoSearch) {
      const nearPoint = {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      };

      const geoNearStage = {
        $geoNear: {
          near: nearPoint,
          key: "address.location",
          distanceField: "distanceMeters",
          spherical: true,
          maxDistance: maxDistanceMeters,
          query: filter,
        },
      };

      const aggregateSort = Object.keys(sortOptions).length
        ? { $sort: sortOptions }
        : { $sort: { distanceMeters: 1 } };

      const [donorRows, totalRows] = await Promise.all([
        Donor.aggregate([
          geoNearStage,
          aggregateSort,
          { $skip: skip },
          { $limit: parsedLimit },
          {
            $project: {
              fullName: 1,
              email: 1,
              phone: 1,
              bloodGroup: 1,
              lastDonationDate: 1,
              donationHistory: 1,
              address: 1,
              distanceKm: { $round: [{ $divide: ["$distanceMeters", 1000] }, 2] },
            },
          },
        ]),
        Donor.aggregate([geoNearStage, { $count: "total" }]),
      ]);

      donors = donorRows;
      total = totalRows[0]?.total || 0;
    } else {
      [donors, total] = await Promise.all([
        Donor.find(filter)
          .select('fullName email phone bloodGroup lastDonationDate donationHistory address')
          .sort(sortOptions)
          .skip(skip)
          .limit(parsedLimit),
        Donor.countDocuments(filter)
      ]);
    }

    // Calculate stats
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const [availableDonors, rareBloodDonors] = await Promise.all([
      Donor.countDocuments({
        $or: [
          { lastDonationDate: { $lt: threeMonthsAgo } },
          { lastDonationDate: { $exists: false } }
        ]
      }),
      Donor.countDocuments({
        bloodGroup: { $in: ['O-', 'AB-', 'B-', 'A-'] }
      })
    ]);

    const pagination = {
      total,
      currentPage: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      hasNext: parsedPage * parsedLimit < total,
      hasPrev: parsedPage > 1,
    };

    const stats = {
      total,
      available: availableDonors,
      rareBlood: rareBloodDonors,
    };

    res.json({
      success: true,
      message: "Donors fetched successfully",
      donors,
      pagination,
      stats,
      data: {
        donors,
        pagination,
        stats,
      },
    });
  } catch (err) {
    console.error("Get all donors error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch donors" });
  }
};

/**
 * @desc Log contact attempt
 * @route POST /api/blood-lab/donors/:id/contact
 * @access Private (Blood Lab)
 */
export const logContactAttempt = async (req, res) => {
  try {
    const donorId = req.params.id;
    const labId = req.user._id;

    const donor = await Donor.findById(donorId);
    if (!donor) {
      return res.status(404).json({ success: false, message: "Donor not found" });
    }

    // Add to facility history
    await Facility.findByIdAndUpdate(labId, {
      $push: {
        history: {
          eventType: "Contact",
          description: `Contacted donor ${donor.fullName} (${donor.bloodGroup})`,
          date: new Date(),
          referenceId: donor._id,
        },
      },
    });

    // Add to donor contact history
    donor.contactHistory = donor.contactHistory || [];
    donor.contactHistory.push({
      contactedBy: labId,
      contactDate: new Date(),
      contactType: "hospital"
    });

    await donor.save();

    res.json({
      success: true,
      message: "Contact logged successfully",
      data: null,
    });
  } catch (err) {
    console.error("Log contact error:", err);
    res.status(500).json({ success: false, message: "Failed to log contact" });
  }
};