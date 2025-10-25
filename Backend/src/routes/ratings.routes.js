const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { addOrUpdateRating } = require("../controllers/rating.controller");

const router = express.Router();

// POST /api/ratings/:partnerId - Add or update rating for a food partner
router.post("/:partnerId", authMiddleware, addOrUpdateRating);

module.exports = router;
