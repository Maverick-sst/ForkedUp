const mongoose = require("mongoose");
const locationModel = require("./location.model");

const userSchema = new mongoose.Schema(
  {
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
    },
    addresses: [
      {
        label: {
          type: String,
          enum: ["home", "work", "other"],
          default: "other",
        },
        location: locationModel,
      },
    ],

    defaultAddress: { type: Number, default: 0 }, // index in addresses array
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
