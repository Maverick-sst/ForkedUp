const foodModel = require("../models/food.model");
const Like = require("../models/Features/likes.model");
const saveSchemaModel = require("../models/Features/save.model");
const commentModel = require("../models/Features/comments.model");
const mongoose = require("mongoose");
async function like(req, res) {
  const userId = req.user && req.user._id;
  const { videoId } = req.body;

  if (!userId || !videoId) {
    return res.status(400).json({ message: "Missing userId or videoId" });
  }

  const video = await foodModel.findById(videoId);
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  try {
    const likeEntry = await Like.create({ user: userId, video: videoId });
    await foodModel.findByIdAndUpdate(videoId, { $inc: { likeCount: 1 } });
    return res.status(201).json({
      message: "Video liked successfully",
      like: likeEntry,
    });
  } catch (err) {
    // Duplicate like (unique index) or other DB errors
    if (err.code === 11000) {
      return res.status(409).json({ message: "Already liked" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function dislike(req, res) {
  const userId = req.user && req.user._id;
  const { videoId } = req.body;

  if (!userId || !videoId) {
    return res.status(400).json({ message: "Missing userId or videoId" });
  }

  try {
    const deletedLike = await Like.findOneAndDelete({
      user: userId,
      video: videoId,
    });
    if (deletedLike) {
      await foodModel.findByIdAndUpdate(videoId, { $inc: { likeCount: -1 } });
    } else {
      return res.status(404).json({ message: "Like not found" });
    }
    return res.status(200).json({
      message: "Record Deleted Successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}
async function addToWatchlist(req, res) {
  const userId = req.user && req.user._id;
  const { videoId } = req.body;

  if (!userId || !videoId) {
    return res.status(400).json({ message: "Missing userId or videoId" });
  }

  const video = await foodModel.findById(videoId);
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  try {
    const watchlistEntry = await saveSchemaModel.create({
      user: userId,
      video: videoId,
    });
    return res.status(201).json({
      message: "Video added to watchlist successfully",
      watchlist: watchlistEntry,
    });
  } catch (err) {
    // Duplicate save (unique index) or other DB errors
    if (err.code === 11000) {
      return res.status(409).json({ message: "Already in watchlist" });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

async function removeFromWatchlist(req, res) {
  const userId = req.user && req.user._id;
  const { videoId } = req.body;

  if (!userId || !videoId) {
    return res.status(400).json({ message: "Missing userId or videoId" });
  }

  try {
    const deletedSave = await saveSchemaModel.findOneAndDelete({
      user: userId,
      video: videoId,
    });
    if (deletedSave) {
      await foodModel.findByIdAndUpdate(videoId, { $inc: { saveCount: -1 } });
    } else {
      return res.status(404).json({ message: "Save not found" });
    }
    return res.status(200).json({
      message: "Video removed from watchlist successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Server Error",
    });
  }
}

async function comment(req, res) {
  const userId = req.user._id;
  const foodId = req.params.foodId;
  const { comment } = req.body;
  if (!foodId) {
    return res.status(401).json({
      message: "Missing Food ID",
    });
  }
  const commentMade = await commentModel.create({
    comment: comment,
    user: userId,
    food: foodId,
  });
  await foodModel.findByIdAndUpdate(foodId, { $inc: { commentCount: 1 } });
  return res.status(201).json({
    message: "Commented Successfully",
    data: commentMade,
  });
}

async function getComments(req, res) {
    const foodId = req.params.foodId;
    // Default to page 1, limit 15 comments per page
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const skip = (page - 1) * limit;

    if (!foodId || !mongoose.Types.ObjectId.isValid(foodId)) {
        return res.status(400).json({ message: "Invalid or missing Food ID." });
    }

    try {
        const commentsQuery = commentModel.find({ food: foodId })
            .sort({ createdAt: -1 }) // Show newest comments first
            .skip(skip)
            .limit(limit)
            .populate('user', 'userName name profilePhoto'); // Populate user details (adjust fields as needed)

        const totalCommentsQuery = commentModel.countDocuments({ food: foodId });

        // Execute queries concurrently
        const [comments, totalComments] = await Promise.all([
             commentsQuery.exec(),
             totalCommentsQuery.exec()
        ]);


        // Determine if there are more comments to load
        const hasMore = (skip + comments.length) < totalComments;

        return res.status(200).json({
            message: "Comments fetched successfully",
            comments: comments,
            currentPage: page,
            totalPages: Math.ceil(totalComments / limit),
            totalComments: totalComments,
            hasMore: hasMore
        });

    } catch (error) {
        console.error("Error fetching comments:", error);
        return res.status(500).json({ message: "Failed to fetch comments due to server error." });
    }
}
module.exports = {
  like,
  addToWatchlist,
  dislike,
  removeFromWatchlist,
  comment,
  getComments
};
