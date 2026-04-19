const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    membersKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

conversationSchema.pre("validate", function (next) {
  if (!Array.isArray(this.members) || this.members.length !== 2) {
    return next(new Error("Conversation must have exactly 2 members"));
  }

  const [a, b] = this.members.map(String).sort();

  this.members = [a, b];
  this.membersKey = `${a}:${b}`;

  next();
});

module.exports = mongoose.model("Conversation", conversationSchema);