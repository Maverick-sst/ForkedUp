const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    video: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // To categorize the dish (e.g., appetizer, main)
    category: {
      type: String,
      required: true,
      enum: ["Starter", "Main Course", "Dessert", "Beverage", "Siders"],
    },
    // For dietary information (e.g., veg, non-veg)
    dietaryPreference: {
      type: String,
      required: true,
      enum: ["Veg", "Non-Veg", "Vegan", "Jain"],
    },
    // For the type of cuisine (e.g., Indian, Italian)
    cuisine: {
      type: String,
      trim: true,
      lowercase: true,
    },
    foodPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "foodPartner",
      required: true,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const foodModel = mongoose.model("foodModel", foodSchema);
module.exports = foodModel;
