const foodModel = require("../models/food.model");
const storageService = require("../services/storage.service");
const { v4: uuid } = require("uuid");
const mongoose = require("mongoose");

async function createFood(req, res) {
  try {
    // Basic server‑side validation
    if (!req.body.name) {
      return res.status(400).json({ error: "Food name is required." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Food video file is required." });
    }

    // Upload the video file
    const fileUploadResult = await storageService.uploadFile(
      req.file.buffer,
      uuid()
    );

    // Create the food document
    const foodItem = await foodModel.create({
      name: req.body.name,
      video: fileUploadResult.url,
      description: req.body.description,
      foodPartner: req.foodPartner._id,
    });

    // Respond with the created item
    res.status(201).json({
      message: "Food Item Created Successfully",
      food: foodItem,
    });
  } catch (error) {
    console.error("Error creating food item:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}

async function getFoodItems(req, res) {
  const userId = req.user ? req.user._id : null;

  try {
    const foodItems = await foodModel.aggregate([
      {
        $lookup: {
          from: "likemodels",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$video", "$$videoId"] },
                    userId
                      ? { $eq: ["$user", new mongoose.Types.ObjectId(userId)] }
                      : {},
                  ],
                },
              },
            },
          ],
          as: "userLike",
        },
      },
      {
        $addFields: {
          likedByUser: { $gt: [{ $size: "$userLike" }, 0] },
        },
      },
      {
        $lookup: {
          from: "savemodels",
          let: { videoId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$video", "$$videoId"] },
                    userId
                      ? { $eq: ["$user", new mongoose.Types.ObjectId(userId)] }
                      : {},
                  ],
                },
              },
            },
          ],
          as: "userSave",
        },
      },
      {
        $addFields: {
          savedByUser: { $gt: [{ $size: "$userSave" }, 0] },
        },
      },
      {
        $project: {
          userLike: 0,
          userSave: 0,
        },
      },
    ]);

    res.status(200).json({
      message: "Food Items Fetched Successfully",
      foodItems,
    });
  } catch (error) {
    console.error("Failed to fetch food feed:", error);
    res.status(500).json({ message: "Server error while fetching feed" });
  }
}

module.exports = { createFood, getFoodItems };
