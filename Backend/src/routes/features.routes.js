const express=require("express");
const { authUserMiddleware } = require("../middlewares/auth.middleware");
const {dislike,like,addToWatchlist,removeFromWatchlist} = require("../controllers/feedfeatures.controller")
const router=express.Router();


// POST api/feature/like---user 
router.post("/like",authUserMiddleware,like)
// DELETE api/feature/like---user
router.delete("/like",authUserMiddleware,dislike)

// POST api/feature/save---user 
router.post("/save",authUserMiddleware,addToWatchlist)
// DELETE api/feature/save---user
router.delete("/save",authUserMiddleware,removeFromWatchlist)
module.exports = router;
