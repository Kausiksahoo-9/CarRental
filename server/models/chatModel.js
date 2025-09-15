// server/models/chatModel.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  bookingId: { type: String, required: true },
  sender: { type: String, required: true }, // or { uid, name } if you prefer object
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
