import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "messages.senderModel",
    required: true,
  },
  senderModel: {
    type: String,
    enum: ["Donor", "Facility", "Admin"],
    required: true,
  },
  senderName: String,
  content: {
    type: String,
    required: true,
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const chatThreadSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donor",
      required: true,
    },
    facility: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    emergencyRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyRequest",
    },
    subject: String,
    messages: [messageSchema],
    status: {
      type: String,
      enum: ["active", "closed", "archived"],
      default: "active",
    },
    donorLastRead: Date,
    facilityLastRead: Date,
    lastMessage: Date,
  },
  { timestamps: true }
);

// Index for faster queries
chatThreadSchema.index({ donor: 1, facility: 1 });
chatThreadSchema.index({ status: 1 });
chatThreadSchema.index({ lastMessage: -1 });

export default mongoose.model("ChatThread", chatThreadSchema);
