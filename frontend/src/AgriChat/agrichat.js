import React, { useState, useEffect, useRef } from "react";
import "./Agrichat.css";

const AgriChat = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("agriChatMessages");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  // Persist messages
  useEffect(() => {
    localStorage.setItem("agriChatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError("Request timed out (10s). Try again.");
    }, 10000);

    try {
      const res = await fetch("https://agriconnect-k5uz.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const botMessage = {
        role: "bot",
        content: data.reply || "No reply received.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Could not get response. Check connection or try later.");
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ Sorry, something went wrong. Please try again.",
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear all chat history?")) {
      setMessages([]);
      localStorage.removeItem("agriChatMessages");
    }
  };

  return (
    <div className="AgriChatContainer" role="region" aria-label="AgriChat – AI Farming Assistant">
      <div className="AgriChatHeader">🌾 AgriChat – Smart Farming Assistant</div>

      <div className="AgriChatMessageArea" ref={chatContainerRef}>
        {messages.length === 0 && (
          <div className="EmptyState">
            <p>Ask anything about farming, crops, soil, pests, weather-based advice...</p>
            <small>🌱 Your conversation is saved in the browser</small>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message-wrapper ${msg.role === "user" ? "user" : "bot"}`}
          >
            <div className={`message-bubble ${msg.role}`}>
              <div className="message-content">
                {msg.content.split("\n").map((line, i) => (
                  <p key={i} style={{ margin: "0.35em 0" }}>
                    {line || <br />}
                  </p>
                ))}
              </div>
              <span className="message-timestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="loading-message bot">
            <div className="message-bubble bot">
              <span className="typing">🌱 Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="AgriChatInputBar">
        <input
          type="text"
          placeholder="Ask about crops, soil, fertilizer, monsoon timing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label="Your farming question"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          aria-label="Send message"
        >
          {loading ? "..." : "➤"}
        </button>
        <button
          onClick={clearChat}
          className="clear-btn"
          disabled={loading || messages.length === 0}
          aria-label="Clear conversation"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default AgriChat;
