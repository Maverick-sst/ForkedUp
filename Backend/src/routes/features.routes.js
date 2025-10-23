const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  dislike,
  like,
  addToWatchlist,
  removeFromWatchlist,
  getInteractionsForVideos,
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

// GET /api/feature/interactions?ids=id1,id2,id3
router.get("/interactions", authMiddleware, getInteractionsForVideos);
module.exports = router;
