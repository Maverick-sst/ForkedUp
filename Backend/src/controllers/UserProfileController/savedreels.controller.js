const saveModel = require("../../models/Features/save.model");
const foodModel = require("../../models/food.model");

async function getSavedReels(req, res) {
  const userId = req.user._id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 15;

  if (!userId || !page) {
    return res.status(404).json({
      message: "userId or page not found",
    });
  }

  try {
    const savedRecords = await saveModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit + 1);

    const hasMore = savedRecords.length > limit;
    const trimmedSaves = hasMore ? savedRecords.slice(0, limit) : savedRecords;

    const videoIds = trimmedSaves.map((item) => item.video);
    const reels = await foodModel.find({ _id: { $in: videoIds } });

    res.status(200).json({
      message: "Saved Reels Fetched Successfully",
      reels: reels,
      hasMore: hasMore,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Saved Reels couldn't be Fetched",
      error: error.message,
    });
  }
}

module.exports = getSavedReels;
