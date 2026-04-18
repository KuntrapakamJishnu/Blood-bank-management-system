import Donor from "../models/donor.model.js";
import Facility from "../models/facility.model.js";
import Admin from "../models/admin.model.js";

const normalizePhone = (phone) => {
  const digits = `${phone || ""}`.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 10) return digits;
  return "";
};

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

export const findAnyUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const [donor, facility, admin] = await Promise.all([
    Donor.findOne({ email: normalizedEmail }).select("_id role email"),
    Facility.findOne({ email: normalizedEmail }).select("_id role email"),
    Admin.findOne({ email: normalizedEmail }).select("_id role email"),
  ]);

  return donor || facility || admin || null;
};

export const findAnyUserByPhone = async (phone) => {
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) return null;

  const [donor, facility] = await Promise.all([
    Donor.findOne({ phone: normalizedPhone }).select("_id role phone"),
    Facility.findOne({ phone: normalizedPhone }).select("_id role phone"),
  ]);

  return donor || facility || null;
};

export const findProfileByRoleAndId = async (role, id) => {
  if (role === "donor") return Donor.findById(id).select("-password");
  if (role === "admin") return Admin.findById(id).select("-password");
  return Facility.findById(id).select("-password");
};
