// Backend/src/controllers/follow.controller.js
const mongoose = require("mongoose");
const Follow = require("../models/follow.model");
const foodPartnerModel = require("../models/foodpartner.model");

// --- Follow a Partner ---
async function followPartner(req, res) {
  // User must be logged in (authMiddleware ensures req.user exists)
  if (!req.user || req.role !== "user") {
    return res.status(401).json({ message: "User authentication required." });
  }

  const userId = req.user._id;
  const partnerId = req.params.partnerId;

  if (!mongoose.Types.ObjectId.isValid(partnerId)) {
    return res.status(400).json({ message: "Invalid Food Partner ID format." });
  }

  try {
    // Check if partner exists
    const partner = await foodPartnerModel.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Food partner not found." });
    }

    // Check if already following (though the unique index handles this, checking first is cleaner)
    const alreadyFollowing = await Follow.findOne({
      user: userId,
      following: partnerId,
    });
    if (alreadyFollowing) {
      return res
        .status(409)
        .json({ message: "Already following this partner." });
    }

    // Create the follow relationship
    await Follow.create({ user: userId, following: partnerId });

    // Increment follower count (using $inc for atomicity)
    const updatedPartner = await foodPartnerModel.findByIdAndUpdate(
      partnerId,
      { $inc: { followerCount: 1 } },
      { new: true } // Return the updated document
    );

    res.status(201).json({
      message: `Successfully followed ${partner.name}.`,
      followerCount: updatedPartner?.followerCount, // Send back updated count
    });
  } catch (error) {
    // Handle potential unique index constraint violation gracefully
    if (error.code === 11000) {
      return res
        .status(409)
        .json({
          message: "Already following this partner (concurrent request).",
        });
    }
    console.error("Error following partner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// --- Unfollow a Partner ---
async function unfollowPartner(req, res) {
  if (!req.user || req.role !== "user") {
    return res.status(401).json({ message: "User authentication required." });
  }

  const userId = req.user._id;
  const partnerId = req.params.partnerId;

  if (!mongoose.Types.ObjectId.isValid(partnerId)) {
    return res.status(400).json({ message: "Invalid Food Partner ID format." });
  }

  try {
    // Delete the follow relationship
    const deletedFollow = await Follow.findOneAndDelete({
      user: userId,
      following: partnerId,
    });

    // If a relationship was actually deleted, decrement the count
    let updatedPartner = null;
    if (deletedFollow) {
      updatedPartner = await foodPartnerModel.findByIdAndUpdate(
        partnerId,
        { $inc: { followerCount: -1 } }, // Decrement count
        // Ensure count doesn't go below zero (though it shouldn't if logic is correct)
        // { $max: { followerCount: 0 } } // Could use $max with aggregation, but $inc is simpler here
        { new: true }
      );
      // Ensure count is not negative after update
      if (updatedPartner && updatedPartner.followerCount < 0) {
        updatedPartner.followerCount = 0;
        await updatedPartner.save();
      }
    } else {
      // If no follow existed, return 404 but still fetch current count
      updatedPartner = await foodPartnerModel
        .findById(partnerId)
        .select("followerCount");
      return res.status(404).json({
        message: "You are not following this partner.",
        followerCount: updatedPartner?.followerCount ?? 0,
      });
    }

    res.status(200).json({
      message: "Successfully unfollowed.",
      followerCount: updatedPartner?.followerCount, // Send back updated count
    });
  } catch (error) {
    console.error("Error unfollowing partner:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// --- Check Follow Status ---
async function getFollowStatus(req, res) {
  if (!req.user || req.role !== "user") {
    // Allow even unauthenticated users to check, but return false
    return res.status(200).json({ isFollowing: false });
    // Or enforce login:
    // return res.status(401).json({ message: "User authentication required." });
  }

  const userId = req.user._id;
  const partnerId = req.params.partnerId;

  if (!mongoose.Types.ObjectId.isValid(partnerId)) {
    return res.status(400).json({ message: "Invalid Food Partner ID format." });
  }

  try {
    const followExists = await Follow.exists({
      user: userId,
      following: partnerId,
    });
    res.status(200).json({ isFollowing: !!followExists }); // Convert result to boolean
  } catch (error) {
    console.error("Error checking follow status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = {
  followPartner,
  unfollowPartner,
  getFollowStatus,
};
