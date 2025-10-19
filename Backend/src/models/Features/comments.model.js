const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // This links the comment to a specific food reel
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "foodModel", // This should match the name you used when creating the foodModel
      required: true,
    },
    // This optional field allows for threaded replies in the future
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  { timestamps: true }
);

// This index helps fetch all comments for a specific food item quickly, sorted by newest first.
commentSchema.index({ food: 1, createdAt: -1 });

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
