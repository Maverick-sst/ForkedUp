const express = require("express");
const router = express.Router();
const foodPartnerController = require("../controllers/food-partner.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");

// GET /api/food-partner/details ----- food-partner
router.get("/me",authMiddleware, foodPartnerController.getMyDetails)

// PATCH /api/food-partner/profile---- food-partner
router.patch("/profile",authMiddleware,foodPartnerController.updateProfile)

// GET /api/food-partner/:id {protected}----user
router.get("/:id", authMiddleware, foodPartnerController.getFoodItemsByPartner);

module.exports = router;
