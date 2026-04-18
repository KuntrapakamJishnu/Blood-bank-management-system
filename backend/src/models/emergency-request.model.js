import mongoose from "mongoose";

const emergencyRequestSchema = new mongoose.Schema(
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
    bloodType: {
      type: String,
      enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    unit: {
      type: String,
      enum: ["units", "bags"],
      default: "units",
    },
    urgency: {
      type: String,
      enum: ["standard", "urgent", "critical"],
      default: "standard",
    },
    reason: String,
    distance: Number, // in km
    estimatedETA: {
      type: Number, // in minutes
      default: 0,
    },
    status: {
      type: String,
      enum: ["created", "acknowledged", "in-progress", "completed", "cancelled"],
      default: "created",
    },
    adminStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: String,
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    donorLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(v) {
            return !v || (Array.isArray(v) && v.length === 2);
          },
        },
      },
    },
    facilityLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(v) {
            return !v || (Array.isArray(v) && v.length === 2);
          },
        },
      },
    },
    timeline: {
      created: { type: Date, default: Date.now },
      acknowledged: Date,
      inProgress: Date,
      completed: Date,
      cancelled: Date,
    },
    notes: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "notes.authorModel",
        },
        authorModel: {
          type: String,
          enum: ["Donor", "Facility", "Admin"],
        },
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Create geospatial indexes
emergencyRequestSchema.index({ "donorLocation": "2dsphere" });
emergencyRequestSchema.index({ "facilityLocation": "2dsphere" });
emergencyRequestSchema.index({ donor: 1, status: 1 });
emergencyRequestSchema.index({ facility: 1, status: 1 });
emergencyRequestSchema.index({ adminStatus: 1 });
emergencyRequestSchema.index({ urgency: 1, adminStatus: 1 });

export default mongoose.model("EmergencyRequest", emergencyRequestSchema);
