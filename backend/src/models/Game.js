const mongoose = require("mongoose");
const SPORTS = require("../constants/sports");

const gameSchema = new mongoose.Schema(
  {
    sport: { type: String, required: true, enum: SPORTS }, 
    type: {
      type: String,
      required: true,
      enum: ["pickup", "casual", "compe"],
    },
    date: { type: String, required: true }, 

    startTime: { type: String, required: true }, 
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },

    peopleNeeded: { type: Number, required: true, min: 1 },
    locationName: { type: String, required: true },

    locationPlaceId: { type: String, default: null },
    locationLat: { type: Number, default: null },
    locationLng: { type: Number, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);