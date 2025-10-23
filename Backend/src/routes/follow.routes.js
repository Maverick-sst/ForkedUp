// Backend/src/routes/follow.routes.js
const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  followPartner,
  unfollowPartner,
  getFollowStatus,
} = require("../controllers/follow.controller");

const router = express.Router();

// Requires USER authentication (authMiddleware adds req.user)

// Check if the current user follows a specific partner
// GET /api/follow/status/:partnerId
router.get("/status/:partnerId", authMiddleware, getFollowStatus);

// Follow a partner
// POST /api/follow/:partnerId
router.post("/:partnerId", authMiddleware, followPartner);

// Unfollow a partner
// DELETE /api/follow/:partnerId
router.delete("/:partnerId", authMiddleware, unfollowPartner);

module.exports = router;
