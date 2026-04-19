const express = require("express");
const router = express.Router();

const SPORTS = require("../constants/sports");

router.get("/", (req, res) => {
  res.json(SPORTS);
});

module.exports = router;