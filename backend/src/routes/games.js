const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const auth = require("../middleware/auth");
const SPORTS = require("../constants/sports");
const fetch = require("node-fetch");

async function getCoordsFromLocation(location) {
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}` +
    `&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    return null;
  }

  return data.results[0].geometry.location;
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.get("/", async (req, res) => {
  try {
    const { location, lat, lng, radius = 10 } = req.query;

    const games = await Game.find().sort({ createdAt: -1 }).limit(50);

    if (!location && (!lat || !lng)) {
      return res.json(games);
    }

    let searchLat;
    let searchLng;

    if (lat && lng) {
      searchLat = Number(lat);
      searchLng = Number(lng);

      if (Number.isNaN(searchLat) || Number.isNaN(searchLng)) {
        return res.status(400).json({ error: "Invalid coordinates" });
      }
    }
    else if (location) {
      const coords = await getCoordsFromLocation(location);

      if (!coords) {
        return res.json([]);
      }

      searchLat = coords.lat;
      searchLng = coords.lng;
    }

    const maxRadius = Number(radius) || 10;

    const filteredGames = games.filter((game) => {
      if (game.locationLat == null || game.locationLng == null) return false;

      const distance = getDistanceKm(
        searchLat,
        searchLng,
        Number(game.locationLat),
        Number(game.locationLng)
      );

      return distance <= maxRadius;
    });

    res.json(filteredGames);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/sports", (req, res) => {
  res.json(SPORTS);
});

router.get("/my", auth, async (req, res) => {
  try {
    const games = await Game.find({
      players: req.userId
    });

    const sorted = games.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB - dateA;
    });

    res.json(sorted.slice(0, 5));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const {
      sport,
      type,
      date,
      startTime,
      level,
      peopleNeeded,
      locationName,
      locationPlaceId,
      locationLat,
      locationLng
    } = req.body;

    const game = await Game.create({
      sport,
      type,
      date,
      startTime,
      level,
      peopleNeeded,
      locationName,
      locationPlaceId: locationPlaceId || null,
      locationLat:
        typeof locationLat === "number"
          ? locationLat
          : locationLat
            ? Number(locationLat)
            : null,
      locationLng:
        typeof locationLng === "number"
          ? locationLng
          : locationLng
            ? Number(locationLng)
            : null,
      createdBy: req.userId,
    });

    res.status(201).json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/:id/join", auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });

    if (!Array.isArray(game.players)) game.players = [];

    const already = game.players.some((p) => p.toString() === req.userId);
    if (already) return res.status(400).json({ error: "Already joined" });

    game.players.push(req.userId);
    await game.save();

    res.json({ message: "Joined successfully", game });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;