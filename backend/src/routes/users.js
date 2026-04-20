const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

router.get("/health", (req, res) => {
  res.json({ ok: true, route: "users" });
});

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, bio, sports, avatar, adminCode } = req.body;

    const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: "Username already taken" });
      }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!sports || !Array.isArray(sports) || sports.length < 1) {
      return res.status(400).json({ error: "At least one sport is required" });
    }

    const isAdmin = adminCode === "Iamandadminandyouarenot547";

    const user = await User.create({
      firstName,
      lastName,
      username: username.toLowerCase(),
      email,
      password: hashedPassword,
      avatar: avatar || "user.png",
      bio,
      sports,
      isAdmin,
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = await User.findById(user._id);
    res.status(201).json({
      token,
      user: safeUser
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const safeUser = await User.findById(user._id);
    res.json({ token, user: safeUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.get("/me", auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId)
      .populate("friends", "firstName lastName username level avatar")
      .populate("friendRequests", "firstName lastName username level avatar")

    if (!me) return res.status(404).json({ error: "User not found" });
    res.json(me);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/search", auth, async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    const user = await User.findOne({
      username: username.toLowerCase()
    }).select("_id username firstName lastName level");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/friends/request", auth, async (req, res) => {
  try {
    const { username } = req.body;

    const toUser = await User.findOne({ username: username.toLowerCase() });

    if (!toUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (String(toUser._id) === req.userId) {
      return res.status(400).json({ error: "You cannot add yourself" });
    }

    if (toUser.friendRequests.includes(req.userId)) {
      return res.status(400).json({ error: "Request already sent" });
    }

    toUser.friendRequests.push(req.userId);
    await toUser.save();

    res.json({ message: "Friend request sent" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/friends/requests", auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId)
      .populate("friendRequests", "firstName lastName username level avatar")

    res.json({ requests: me.friendRequests || [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/friends/accept", auth, async (req, res) => {
  try {
    const { fromUserId } = req.body;

    const me = await User.findById(req.userId);
    const other = await User.findById(fromUserId);

    if (!me.friendRequests.includes(fromUserId)) {
      return res.status(400).json({ error: "No request from this user" });
    }

    me.friendRequests = me.friendRequests.filter(
      id => String(id) !== fromUserId
    );

    me.friends.push(fromUserId);
    other.friends.push(req.userId);

    await me.save();
    await other.save();

    res.json({ message: "Friend added" });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/friends/requests", auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId)
      .populate("friendRequests", "_id username firstName lastName level avatar");

    res.json({ requests: me.friendRequests || [] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.get("/friends", auth, async (req, res) => {
  try {
    const me = await User.findById(req.userId).populate(
      "friends",
      "_id username firstName lastName level"
    );

    if (!me) return res.status(404).json({ error: "User not found" });

    res.json(me.friends);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "friends",
      "firstName lastName level"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/me", auth, async (req, res) => {
  try {
    const { bio, sports, avatar } = req.body;

    if (!sports || !Array.isArray(sports) || sports.length < 1) {
      return res.status(400).json({ error: "At least one sport is required" });
    }

    if (sports.length > 3) {
      return res.status(400).json({ error: "Maximum 3 sports allowed" });
    }

    const cleanedSports = sports
      .filter((sport) => sport && sport.name && sport.level)
      .map((sport) => ({
        name: sport.name.trim(),
        level: sport.level,
      }));

    if (cleanedSports.length < 1) {
      return res.status(400).json({ error: "At least one sport is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        bio: bio || "",
        sports: cleanedSports,
        avatar: avatar || "user.png", 
      },
      { new: true, runValidators: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/friends/:friendId", auth, async (req, res) => {
  try {
    const { friendId } = req.params;

    const me = await User.findById(req.userId);
    const other = await User.findById(friendId);

    if (!me || !other) {
      return res.status(404).json({ error: "User not found" });
    }

    me.friends = me.friends.filter((id) => String(id) !== String(friendId));
    other.friends = other.friends.filter((id) => String(id) !== String(req.userId));

    await me.save();
    await other.save();

    res.json({ message: "Friend removed" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;