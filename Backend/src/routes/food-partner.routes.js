const express = require("express");
const router = express.Router();
const foodPartnerController = require("../controllers/food-partner.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const { addOrUpdateRating } = require("../controllers/rating.controller");

// PATCH /api/food-partner/profile---- food-partner
router.patch("/profile", authMiddleware, foodPartnerController.updateProfile);

// GET /api/food-partner/:id/menu-summary
router.get(
  "/:id/menu-summary",
  authMiddleware,
  foodPartnerController.getMenuSummary
);

// GET /api/food-partner/:id {protected}----user
router.get("/:id", authMiddleware, foodPartnerController.getFoodItemsByPartner);

module.exports = router;
