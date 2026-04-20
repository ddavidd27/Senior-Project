const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    levelAccuracy: {
      type: String,
      required: true,
      enum: ["lower", "expected", "higher"],
    },
    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

ratingSchema.index({ gameId: 1, fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);