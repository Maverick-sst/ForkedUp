const Rating = require("../models/ratings.model");
const FoodPartner = require("../models/foodpartner.model");

async function calculateAverageRating(foodPartnerId) {
  // This is a powerful MongoDB aggregation pipeline
  const stats = await Rating.aggregate([
    {
      $match: { foodPartner: foodPartnerId }, // 1. Find all ratings for this partner
    },
    {
      $group: {
        // group by id and then apply aggregate
        _id: "$foodPartner",
        ratingCount: { $sum: 1 }, // 2. Count the number of ratings
        ratingAverage: { $avg: "$rating" }, // 3. Calculate the average of the 'rating' field
      },
    },
  ]);

  // Update the FoodPartner document with the new average and count
  if (stats.length > 0) {
    await FoodPartner.findByIdAndUpdate(foodPartnerId, {
      ratingCount: stats[0].ratingCount,
      ratingAverage: stats[0].ratingAverage,
    });
  } else {
    // If there are no ratings, reset to default values
    await FoodPartner.findByIdAndUpdate(foodPartnerId, {
      ratingCount: 0,
      ratingAverage: 0,
    });
  }
}

async function addOrUpdateRating(req, res) {
  try {
    const foodPartnerId = req.params.partnerId;
    const userId = req.user._id;
    const { rating, comment } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "A rating value is required." });
    }

    // Use findOneAndUpdate with the 'upsert' option
    const updatedRating = await Rating.findOneAndUpdate(
      { user: userId, foodPartner: foodPartnerId },
      { rating, comment, user: userId, foodPartner: foodPartnerId }, // The data to update or insert
      {
        new: true, // Return the new, updated document
        upsert: true, // This is the magic: create a new doc if one doesn't exist
        runValidators: true,
      }
    );

    // After creating or updating, recalculate the average
    await calculateAverageRating(foodPartnerId);

    return res.status(201).json({
      message: "Thank you for your rating!",
      data: updatedRating,
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while submitting your rating." });
  }
}

module.exports = { addOrUpdateRating };
