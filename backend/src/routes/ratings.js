const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");
const Game = require("../models/Game");
const auth = require("../middleware/auth");

function getGameDateTime(game) {
  return new Date(`${game.date}T${game.startTime}`);
}

router.get("/pending", auth, async (req, res) => {
  try {
    const now = new Date();

    const myFinishedGames = await Game.find({
    players: req.userId,
    }).populate("players", "firstName lastName username");

    const finishedGames = myFinishedGames.filter((game) => {
      return getGameDateTime(game) < now;
    });

    const result = [];

    for (const game of finishedGames) {
      const alreadyRated = await Rating.find({
        gameId: game._id,
        fromUser: req.userId,
      });

        const ratedUserIds = new Set(alreadyRated.map((r) => String(r.toUser)));

        const playersToRate = (game.players || [])
        .filter((player) => String(player._id) !== String(req.userId))
        .filter((player) => !ratedUserIds.has(String(player._id)))
        .map((player) => ({
            _id: player._id,
            firstName: player.firstName,
            lastName: player.lastName,
            username: player.username,
        }));

      if (playersToRate.length > 0) {
        result.push({
          _id: game._id,
          sport: game.sport,
          date: game.date,
          startTime: game.startTime,
          playersToRate,
        });
      }
    }

    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { gameId, ratings } = req.body;

    if (!gameId || !Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ error: "gameId and ratings are required" });
    }

    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    const isParticipant = (game.players || []).some(
      (id) => String(id) === String(req.userId)
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "You did not participate in this game" });
    }

    const now = new Date();
    if (getGameDateTime(game) >= now) {
      return res.status(400).json({ error: "You can only rate finished games" });
    }

    for (const item of ratings) {
      if (!item.toUser || !item.score || !item.levelAccuracy) {
        return res.status(400).json({ error: "Each rating must include toUser, score and levelAccuracy" });
      }

      if (String(item.toUser) === String(req.userId)) {
        return res.status(400).json({ error: "You cannot rate yourself" });
      }

      const isPlayerInGame = (game.players || []).some(
        (id) => String(id) === String(item.toUser)
      );

      if (!isPlayerInGame) {
        return res.status(400).json({ error: "Invalid player for this game" });
      }
    }

    const created = [];

    for (const item of ratings) {
      const rating = await Rating.findOneAndUpdate(
        {
          gameId,
          fromUser: req.userId,
          toUser: item.toUser,
        },
        {
          gameId,
          fromUser: req.userId,
          toUser: item.toUser,
          score: item.score,
          levelAccuracy: item.levelAccuracy,
          comment: item.comment || "",
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      created.push(rating);
    }

    res.status(201).json({ message: "Ratings submitted", ratings: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;