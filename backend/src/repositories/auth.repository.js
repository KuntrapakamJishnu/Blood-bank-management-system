import Donor from "../models/donor.model.js";
import Facility from "../models/facility.model.js";
import Admin from "../models/admin.model.js";

export const createUserByRole = async (payload) => {
  if (payload.role === "donor") return Donor.create(payload);
  if (payload.role === "hospital" || payload.role === "blood-lab") return Facility.create(payload);
  return null;
};

export const findAuthUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase();

  const donor = await Donor.findOne({ email: normalizedEmail }).select("+password");
  if (donor) return donor;

  const admin = await Admin.findOne({ email: normalizedEmail }).select("+password");
  if (admin) return admin;

  const facility = await Facility.findOne({ email: normalizedEmail }).select("+password");
  if (facility) return facility;

  return null;
};

export const findProfileByRoleAndId = async (role, id) => {
  if (role === "donor") return Donor.findById(id).select("-password");
  if (role === "admin") return Admin.findById(id).select("-password");
  return Facility.findById(id).select("-password");
};
