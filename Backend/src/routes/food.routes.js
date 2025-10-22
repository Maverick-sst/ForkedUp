const express = require("express");
const foodController = require("../controllers/food.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const likedReelsController = require("../controllers/UserProfileController/likedreels.controller.js");
const savedReelsController = require("../controllers/UserProfileController/savedreels.controller.js");
const { comment , getComments} = require("../controllers/feedfeatures.controller.js");
const router = express.Router();


// POST /api/food/ - Create food (Partner)
router.post("/", authMiddleware, foodController.createFood);
// GET /api/food/ - Get food feed (User)
router.get("/", authMiddleware, foodController.getFoodItems);
// GET /api/food/user/likedreels - Get liked reels (User)
router.get("/user/likedreels", authMiddleware, likedReelsController);
// GET /api/food/user/savedreels - Get saved reels (User)
router.get("/user/savedreels", authMiddleware, savedReelsController);

// --- Comment Routes ---
// POST /api/food/:foodId/comment - Post a comment (User)
router.post("/:foodId/comment", authMiddleware, comment);
// GET /api/food/:foodId/comments - Get comments for a food item (User) <<< NEW ROUTE
router.get("/:foodId/comments", authMiddleware, getComments);

module.exports = router;
