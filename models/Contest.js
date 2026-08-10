const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentUrl: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    voteCount: {
      type: Number,
      default: 0,
    },
    judgeScore: {
      type: Number,
      default: 0,
    },
    // Users who voted on this submission (prevent double voting)
    voters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const WinnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    placement: {
      type: Number, // 1, 2, 3
    },
    reward: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const ContestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    bannerImage: {
      type: String,
      default: "",
    },

    // Blueprint §20 contest types
    type: {
      type: String,
      enum: ["MANGA_DRAWING", "STORY_WRITING", "COSPLAY", "GAMING", "FAN_ART", "COMMUNITY"],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Entry fee (blueprint §21 same split as events: 80/15/5)
    entryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Blueprint §20: winners selected by HOST | COMMUNITY | HYBRID
    votingMethod: {
      type: String,
      enum: ["HOST", "COMMUNITY", "HYBRID"],
      default: "COMMUNITY",
    },

    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "JUDGING", "COMPLETED", "CANCELLED"],
      default: "UPCOMING",
    },

    // Prize pool accumulated from entry fees (80% of each entry)
    prizePool: {
      type: Number,
      default: 0,
    },

    maxParticipants: {
      type: Number,
      default: 100,
      min: 2,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    tags: [
      {
        type: String,
      },
    ],

    submissions: [SubmissionSchema],

    winners: [WinnerSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
ContestSchema.index({ status: 1 });
ContestSchema.index({ type: 1 });
ContestSchema.index({ createdBy: 1 });
ContestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Contest", ContestSchema);
