const express = require("express");
const router = express.Router();
const foodPartnerController = require("../controllers/food-partner.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// GET /api/food-partner/:id {protected}----user
router.get("/:id", authMiddleware, foodPartnerController.getFoodItemsByPartner);

module.exports = router;
