const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    bannerImage: {
      type: String,
      default: ""
    },

    organizer: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      default: 0,
      min: 0
    },

    reward: {
      type: String,
      default: ""
    },

    date: {
      type: String, // or Date, but mock uses string like "2025-01-05"
      required: true
    },

    location: {
      type: String,
      default: ""
    },

    maxParticipants: {
      type: Number,
      required: true,
      min: 1
    },

    status: {
      type: String,
      enum: ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING"
    },

    tags: [
      {
        type: String
      }
    ],

    participants: [
      {
        userId: {
          type: String, // or mongoose.Schema.Types.ObjectId if User model
          required: true
        },
        name: {
          type: String,
          required: true
        }
      }
    ],

    winner: {
      userId: {
        type: String,
        default: null
      },
      name: {
        type: String,
        default: null
      }
    },

    createdBy: {
      type: String, // or mongoose.Schema.Types.ObjectId ref: "User"
      default: "admin"
    }
  },
  {
    timestamps: true
  }
);

// 🔍 Indexes
EventSchema.index({ status: 1 });
EventSchema.index({ date: 1 });
EventSchema.index({ createdAt: -1 });

// 🚀 Export
module.exports = mongoose.model("Event", EventSchema);