const express = require("express");
const cors = require("cors");
const path = require("path");

const usersRouter = require("./routes/users");
const gamesRouter = require("./routes/games");
const placesRoutes = require("./routes/places");
const chatRoutes = require("./routes/chat");
const sportsRouter = require("./routes/sports");
const ratingsRouter = require("./routes/ratings");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", usersRouter);
app.use("/api/games", gamesRouter);
app.use("/api/places", placesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/sports", sportsRouter);
app.use("/api/ratings", ratingsRouter);

const FRONTEND_DIR = path.join(__dirname, "../../frontend");

app.use(express.static(FRONTEND_DIR));

app.get("/", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "login.html")));
app.get("/chat", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "chat.html")));
app.get("/profile", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "profile.html")));
app.get("/about", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "about.html")));
app.get("/games", (req, res) => res.sendFile(path.join(FRONTEND_DIR, "games.html")));

module.exports = app;