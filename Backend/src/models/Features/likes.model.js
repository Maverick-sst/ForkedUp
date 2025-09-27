const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "foodModel",
      required: true,
    },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, video: 1 }, { unique: true });
likeSchema.index({ user: 1, createdAt: -1 });

const Like = mongoose.model("likeModel", likeSchema);
module.exports = Like;
