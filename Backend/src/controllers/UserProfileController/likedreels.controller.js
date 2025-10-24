const likeModel = require("../../models/Features/likes.model");
const foodModel = require("../../models/food.model");

async function getlikedReels(req, res) {
  const userId = req.user._id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;

  if (!userId || !page) {
    return res.status(404).json({
      message: "userId or page not found",
    });
  }

  try {
    const likedRecords = await likeModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit + 1);

    const hasMore = likedRecords.length > limit;
    const trimmedLikes = hasMore ? likedRecords.slice(0, limit) : likedRecords;

    const videoIds = trimmedLikes.map((like) => like.video);
    const reels = await foodModel.find({ _id: { $in: videoIds } });

    res.status(200).json({
      message: "Liked Reels Fetched Successfully",
      reels: reels,
      hasMore: hasMore,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Liked Reels couldn't be Fetched",
      error: error.message,
    });
  }
}

module.exports = getlikedReels;
