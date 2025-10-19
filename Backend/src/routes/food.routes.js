const express = require("express");
const foodController = require("../controllers/food.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const likedReelsController = require("../controllers/UserProfileController/likedreels.controller.js");
const savedReelsController = require("../controllers/UserProfileController/savedreels.controller.js");
const { comment } = require("../controllers/feedfeatures.controller.js");
const router = express.Router();


// POST api/food/:foodId/comment ---- user
router.post("/:foodId/comment",authMiddleware,comment)
// POST /api/food/{protected}---partner
router.post("/", authMiddleware, foodController.createFood);

// GET /api/food/{protected}----user
router.get("/", authMiddleware, foodController.getFoodItems);

// GET /api/food/user/:id/likedreels?page=1&limit=20----user bef
// GET /api/food/user/likedreels?page=1&limit=20----user after
router.get("/user/likedreels", authMiddleware, likedReelsController);

// GET /api/food/user/savedreels?page=1&limit=20----user
router.get("/user/savedreels", authMiddleware, savedReelsController);

module.exports = router;
