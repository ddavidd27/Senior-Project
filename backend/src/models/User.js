const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: [/^[a-z0-9_]+$/, "Username can only contain letters, numbers, underscore"],
    },

    friendRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

    password: {
      type: String,
      required: true,
      select: false,
    },

    sports: [ {
      name: {
        type: String,
        trim: true,
      },
      level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
      },
    },
  ],

    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        default: [0, 0],
      },
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);