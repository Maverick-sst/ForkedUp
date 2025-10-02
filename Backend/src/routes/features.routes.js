const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  dislike,
  like,
  addToWatchlist,
  removeFromWatchlist,
} = require("../controllers/feedfeatures.controller");
const router = express.Router();

// POST api/feature/like---user
router.post("/like", authMiddleware, like);
// DELETE api/feature/like---user
router.delete("/like", authMiddleware, dislike);

// POST api/feature/save---user
router.post("/save", authMiddleware, addToWatchlist);
// DELETE api/feature/save---user
router.delete("/save", authMiddleware, removeFromWatchlist);
module.exports = router;
