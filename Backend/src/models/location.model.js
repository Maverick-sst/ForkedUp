const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
    address: {
      formatted:{type:String},
      street: { type: String },
      block: { type: String },
      building: { type: String },
      floor: { type: String },
      landmark: { type: String },
    },
  },
  { _id: false }
);

locationSchema.index({ coordinates: "2dsphere" });
module.exports = locationSchema;
