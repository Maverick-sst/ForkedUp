const mongoose = require("mongoose");
const locationSchema = require("./location.model");

const foodPartnerSchema = new mongoose.Schema(
  {
    profilePhoto: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
    },
    location: locationSchema,
    workingHours: [
      {
        dayofWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6,
        },
        isOpen: {
          type: Boolean,
          default: true, // Assume open if the day is listed
        },
        periods: [
          {
            openTime: {
              type: String, // Store as "HH:MM" in 24-hour format (e.g., "09:00" or "14:30")
              required: true,
            },
            closeTime: {
              type: String,
              required: true,
            },
          },
        ],
      },
    ],
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    followerCount: {
      type: Number,
      default: 0,
      min: 0
    },
  },
  {
    timestamps: true,
  }
);
const foodPartnerModel = mongoose.model("foodPartner", foodPartnerSchema);
module.exports = foodPartnerModel;
