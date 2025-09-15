import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const socket = io(import.meta.env.VITE_BASE_URL); // ✅ Connect to your backend

export default function OwnerChat() {
  const { bookingId } = useParams();
  const { user, showNotification } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  // Join the chat room when mounted
  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRoom", bookingId);

    // Receive messages
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // If the owner is in a different booking chat, show a notification
      if (msg.bookingId !== bookingId) {
        showNotification(`New message: ${msg.message}`);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [bookingId]);

  const sendMessage = () => {
    if (!newMsg.trim()) return;

    const msgData = {
      bookingId,
      sender: user?.name || "Owner",
      message: newMsg,
      createdAt: new Date(),
    };

    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setNewMsg("");
  };

  return (
    <div className="p-4 max-w-xl mx-auto border rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Owner Chat</h2>
      <div className="h-64 overflow-y-auto border p-2 mb-3 bg-gray-50 rounded">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-1 ${
              msg.sender === user?.name ? "text-right" : "text-left"
            }`}
          >
            <span className="text-sm font-bold">{msg.sender}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
