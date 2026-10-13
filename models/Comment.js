const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentType: {
      type: String,
      enum: ["MANGA_CHAPTER", "STORY_PART", "GIST_TOPIC", "EVENT"],
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    isSpam: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

CommentSchema.index({ contentType: 1, contentId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", CommentSchema);
