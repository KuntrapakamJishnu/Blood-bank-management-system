import jwt from "jsonwebtoken";

export const signToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};
