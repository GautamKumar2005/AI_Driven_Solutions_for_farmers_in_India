import React, { useState, useEffect, useRef } from "react";
import "./Agrichat.css";

const AgriChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "bot", content: data.reply }]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { role: "bot", content: "Something went wrong. Please try again!" }]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">🌿 AgriChat - AI Farming Assistant</div>
      <div className="chat-box" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <pre>{msg.content}</pre> {/* ✅ Preserve formatting */}
          </div>
        ))}
        {loading && <p className="loading-text">Thinking...</p>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask about farming..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "Loading..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default AgriChat;
