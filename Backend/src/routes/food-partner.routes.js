const express = require("express");
const router = express.Router();
const foodPartnerController = require("../controllers/food-partner.controller");
const { authUserMiddleware } = require("../middlewares/auth.middleware");

// GET /api/food-partner/:id {protected}----user
router.get("/:id", authUserMiddleware, foodPartnerController.getFoodItemsByPartner);

module.exports = router;





