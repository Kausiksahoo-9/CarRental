// server/server.js
import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import Chat from "./models/chatModel.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

await connectDB();

// REST routes
app.get("/", (req, res) => res.send("Server is running"));
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);

// Add this REST endpoint for chat history
app.get("/api/chats/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const chats = await Chat.find({ bookingId }).sort({ timestamp: 1 });
    res.json({ success: true, chats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// create HTTP server + socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: [ "http://localhost:5173", "https://car-rental-phi-gilt.vercel.app" ], methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (bookingId) => {
    socket.join(bookingId);
    console.log(`${socket.id} joined room ${bookingId}`);
  });

  socket.on("sendMessage", async (data) => {
    try {
      // data: { bookingId, sender, message }
      const chat = new Chat({
        bookingId: data.bookingId,
        sender: data.sender,
        message: data.message,
        timestamp: new Date(),
      });
      await chat.save();

      // send the full chat object to everyone in the booking room
      io.to(data.bookingId).emit("receiveMessage", chat);

      // lightweight notification for owners (global for now)
      io.emit("newMessageNotification", {
        bookingId: data.bookingId,
        sender: data.sender,
        preview: data.message.slice(0, 50),
      });
    } catch (err) {
      console.error("Error saving chat:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
