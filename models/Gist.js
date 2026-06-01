const mongoose = require("mongoose");

const GistSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    coverUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

GistSchema.index({ name: 1 });

module.exports = mongoose.model("Gist", GistSchema);
