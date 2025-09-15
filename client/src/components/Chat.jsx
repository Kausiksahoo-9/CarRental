// client/src/components/Chat.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { socket } from "../socket";

export default function Chat({ bookingId, userName }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesRef = useRef(null);

  useEffect(() => {
    if (!bookingId) return;

    // join booking room
    socket.emit("joinRoom", bookingId);

    // fetch history
    const fetch = async () => {
      try {
        const { data } = await axios.get(`/api/chats/${bookingId}`);
        if (data.success) setMessages(data.chats);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();

    // receive real-time messages
    const handler = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socket.on("receiveMessage", handler);

    return () => {
      socket.off("receiveMessage", handler);
      // optionally leave room: socket.emit("leaveRoom", bookingId);
    };
  }, [bookingId]);

  useEffect(() => {
    // autoscroll
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    const payload = { bookingId, sender: userName, message: text };
    socket.emit("sendMessage", payload);
    setText("");
  };

  return (
    <div className="border p-4 rounded w-full max-w-md">
      <div ref={messagesRef} style={{ height: 300, overflowY: "auto" }} className="mb-3">
        {messages.map((m) => (
          <div key={m._id || Math.random()} className={`p-2 my-1 rounded ${m.sender === userName ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
            <strong>{m.sender}: </strong>
            <span>{m.message}</span>
            <div className="text-xs text-gray-400">{new Date(m.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 border rounded px-2 py-1" placeholder="Type message..." />
        <button onClick={sendMessage} className="bg-green-500 text-white px-3 rounded">Send</button>
      </div>
    </div>
  );
}
