// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import Donor from "../models/donor.model.js";
import Admin from "../models/admin.model.js";
import Facility from "../models/facility.model.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let user =
        (await Donor.findById(decoded.id).select("-password")) ||
        (await Admin.findById(decoded.id).select("-password")) ||
        (await Facility.findById(decoded.id).select("-password"));

      if (!user)
        return res.status(401).json({ message: "User not found or unauthorized" });

      req.user = { id: user._id, _id: user._id, role: decoded.role };
      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Token invalid or expired" });
    }
  } else {
    res.status(401).json({ message: "No token provided" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
};