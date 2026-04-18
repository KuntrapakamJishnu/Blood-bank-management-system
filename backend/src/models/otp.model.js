import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      enum: ["register"],
      default: "register",
      index: true,
    },
    code: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    requiredChannels: {
      type: [String],
      enum: ["email", "sms"],
      default: ["email"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    smsVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    smsVerifiedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

export default mongoose.model("Otp", otpSchema);
