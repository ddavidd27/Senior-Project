const express = require("express");
const auth = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const router = express.Router();

function sortTwoIds(a, b) {
  return [String(a), String(b)].sort();
}

router.post("/with/:otherUserId", auth, async (req, res) => {
  try {
    const me = req.userId;
    const other = req.params.otherUserId;

    const members = sortTwoIds(me, other);
    const membersKey = `${members[0]}:${members[1]}`;

    const convo = await Conversation.findOneAndUpdate(
      { membersKey },
      { $setOnInsert: { members, membersKey } },
      { returnDocument: "after", upsert: true }
    );

    res.json(convo);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/messages/:otherUserId", auth, async (req, res) => {
  try {
    const me = req.userId;
    const other = req.params.otherUserId;

    const members = sortTwoIds(me, other);
    const membersKey = `${members[0]}:${members[1]}`;

    const convo = await Conversation.findOne({ membersKey });

    if (!convo) {
      return res.json([]);
    }

    const messages = await Message.find({
      conversationId: convo._id
    })
    .sort({ createdAt: 1 })
    .limit(200);

    res.json(messages);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;