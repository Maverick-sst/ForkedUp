const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    user: {
      // The user who is following
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      // The food partner being followed
      type: mongoose.Schema.Types.ObjectId,
      ref: "foodPartner",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only follow a partner once
followSchema.index({ user: 1, following: 1 }, { unique: true });

// Index for quickly finding who a user follows
followSchema.index({ user: 1 });

// Index for quickly finding a partner's followers (less common, but possible)
followSchema.index({ following: 1 });

const Follow = mongoose.model("Follow", followSchema);

module.exports = Follow;
