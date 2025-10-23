const foodModel = require("../models/food.model");
const foodPartner = require("../models/foodpartner.model");
const mongoose = require("mongoose");

async function createFood(req, res) {
  try {
    if (!req.body.name) {
      return res.status(400).json({ error: "Food name is required." });
    }
    if (!req.body.video) {
      return res.status(400).json({ error: "Food video file is required." });
    }
    const {
      name,
      video,
      description,
      price,
      category,
      dietaryPreference,
      cuisine,
    } = req.body;
    const foodPartner = req.foodPartner._id;
    // Create the food document
    const foodItem = await foodModel.create({
      name: name,
      video: video,
      description: description,
      price: price,
      category: category,
      dietaryPreference: dietaryPreference,
      cuisine: cuisine,
      foodPartner: foodPartner,
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
  // Pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  try {
    // 1. Get total count for pagination
    const totalItems = await foodModel.countDocuments();

    // 2. Fetch paginated food items, sorted by newest
    const foodItems = await foodModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    res.status(200).json({
      message: "Food Items Fetched Successfully",
      foodItems, // This is now a simple array of food documents
      currentPage: page,
      totalPages: totalPages,
      hasMore: hasMore,
      totalItems: totalItems,
    });
  } catch (error) {
    console.error("Failed to fetch food feed:", error);
    res.status(500).json({ message: "Server error while fetching feed" });
  }
}

async function searchFoodItems(req, res) {
  const searchTerm = req.query.q || ""; // Get search term from query param 'q'
  const partnerId = req.query.partnerId; // Optional partner ID filter
  const limit = parseInt(req.query.limit, 10) || 20; // Limit results

  if (!searchTerm.trim()) {
    return res
      .status(200)
      .json({ message: "Search term is empty", results: [] });
  }

  // Create a case-insensitive regex
  const regex = new RegExp(searchTerm.trim(), "i");

  try {
    // Base query filters
    const queryConditions = {
      $or: [
        { name: regex }, // Search by dish name
        { description: regex }, // Search by description
        { cuisine: regex }, // Search by cuisine
        { category: regex }, // Search by category
        { dietaryPreference: regex }, // Search by dietary preference
      ],
    };

    // Add partner filter if partnerId is provided
    if (partnerId && mongoose.Types.ObjectId.isValid(partnerId)) {
      queryConditions.foodPartner = partnerId; //
    } else if (partnerId) {
      console.warn("Invalid partnerId provided for search:", partnerId);
    } else {
      // Global Search: Also search by partner name
      const matchingPartners = await foodPartner
        .find({ name: regex })
        .select("_id"); //
      const matchingPartnerIds = matchingPartners.map((p) => p._id);

      if (matchingPartnerIds.length > 0) {
        // Add partner name match condition
        queryConditions.$or.push({ foodPartner: { $in: matchingPartnerIds } }); //
      }
    }

    const results = await foodModel
      .find(queryConditions)
      .limit(limit)
      .populate("foodPartner", "name profilePhoto"); // Populate basic partner info

    res.status(200).json({
      message: `Search results for "${searchTerm}"`,
      results: results,
    });
  } catch (error) {
    console.error("Error searching food items:", error);
    res.status(500).json({ message: "Server error during search." });
  }
}
module.exports = { createFood, getFoodItems, searchFoodItems };
