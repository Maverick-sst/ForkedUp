const foodPartnerModel = require("../models/foodpartner.model");
const foodModel = require("../models/food.model");
const mongoose = require("mongoose");

async function getFoodItemsByPartner(req, res) {
  const foodPartnerId = req.params.id;
  // Pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  try {
    // Added try/catch for better error handling
    const foodPartner = await foodPartnerModel.findById(foodPartnerId);
    if (!foodPartner) {
      return res.status(404).json({
        message: "Food Partner not found",
      });
    }

    // Create the query
    const query = { foodPartner: foodPartnerId };

    // 1. Get total count for this partner
    const totalItems = await foodModel.countDocuments(query);

    // 2. Fetch paginated reels for this partner
    const foodReels = await foodModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    return res.status(200).json({
      message: "Food Partner Found",
      foodPartner,
      foodReels,
      currentPage: page,
      totalPages: totalPages,
      hasMore: hasMore,
      totalItems: totalItems,
    });
  } catch (error) {
    console.error("Failed to fetch partner food items:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching partner feed" });
  }
}

async function updateProfile(req, res) {
  if (!req.foodPartner) {
    return res.status(401).json({
      message: "Unauthorized Access",
    });
  }

  const foodPartnerId = req.foodPartner._id;
  const updates = req.body;
  try {
    const updatedPartner = await foodPartnerModel.findByIdAndUpdate(
      foodPartnerId,
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!updatedPartner) {
      return res.status(404).json({
        message: "Food Partner not Found",
      });
    }
    return res.status(200).json({
      message: "Profile Updated Successfully",
      foodPartner: updatedPartner,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating profile",
      error: error,
    });
  }
}

async function getMenuSummary(req, res) {
  const foodPartnerId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(foodPartnerId)) {
    return res.status(400).json({ message: "Invalid Food Partner ID format." });
  }

  try {
    // Use aggregation to group and count items
    const summary = await foodModel.aggregate([
      // Stage 1: Match documents for the specific food partner
      {
        $match: { foodPartner: new mongoose.Types.ObjectId(foodPartnerId) }, //
      },
      // Stage 2: Group by multiple criteria using $facet
      {
        $facet: {
          categories: [
            { $group: { _id: "$category", count: { $sum: 1 } } }, //
            { $sort: { count: -1 } },
          ],
          cuisines: [
            { $match: { cuisine: { $ne: null, $ne: "" } } }, // Filter out null/empty
            { $group: { _id: "$cuisine", count: { $sum: 1 } } }, //
            { $sort: { count: -1 } },
          ],
          dietaryPreferences: [
            { $group: { _id: "$dietaryPreference", count: { $sum: 1 } } }, //
            { $sort: { count: -1 } },
          ],
          totalItems: [{ $count: "count" }],
        },
      },
      // Stage 3: Reshape the output
      {
        $project: {
          totalItems: {
            $ifNull: [{ $arrayElemAt: ["$totalItems.count", 0] }, 0],
          },
          categories: "$categories",
          cuisines: "$cuisines",
          dietaryPreferences: "$dietaryPreferences",
        },
      },
    ]);

    const result = summary[0] || {
      totalItems: 0,
      categories: [],
      cuisines: [],
      dietaryPreferences: [],
    };

    res.status(200).json({
      message: "Menu summary fetched successfully.",
      summary: result,
    });
  } catch (error) {
    console.error("Error fetching menu summary:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching menu summary." });
  }
}

module.exports = { getFoodItemsByPartner, updateProfile, getMenuSummary };
