const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const connectDB = require("./config/db");
const app = require("./app");

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Missing token"));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId;
    return next();
  } catch (e) {
    return next(new Error("Invalid token"));
  }
});

function roomForUser(userId) {
  return `user:${userId}`;
}

io.on("connection", (socket) => {
  const userId = socket.userId;

  socket.join(roomForUser(userId));

  socket.broadcast.emit("presence:online", { userId });
  socket.on("disconnect", () => socket.broadcast.emit("presence:offline", { userId }));

  socket.on("dm:send", async ({ to, text }, ack) => {
    try {
      if (!to || !text) {
        if (ack) ack({ ok: false, error: "Missing to/text" });
        return;
      }

      const members = [String(userId), String(to)].sort();
      const membersKey = `${members[0]}:${members[1]}`;

      const convo = await Conversation.findOneAndUpdate(
        { membersKey },
        { $setOnInsert: { members, membersKey } },
        { returnDocument: "after", upsert: true }
      );

      const msg = await Message.create({
        conversationId: convo._id,
        sender: userId,
        text,
      });

      const out = {
        _id: msg._id,
        conversationId: convo._id,
        from: userId,
        to,
        text,
        createdAt: msg.createdAt,
      };

      io.to(roomForUser(to)).emit("dm:receive", out);
      io.to(roomForUser(userId)).emit("dm:receive", out);

      if (ack) ack({ ok: true, data: out });
    } catch (err) {
      console.error(err);
      if (ack) ack({ ok: false, error: "Server error" });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));