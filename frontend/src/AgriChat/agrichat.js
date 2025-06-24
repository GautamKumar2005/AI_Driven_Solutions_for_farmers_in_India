
import React, { useState, useEffect, useRef } from "react";
import "./Agrichat.css";

const AgriChat = () => {
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on mount
    const savedMessages = localStorage.getItem("agriChatMessages");
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
  }, [messages]);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem("agriChatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    // Timeout for loading state
    const timeout = setTimeout(() => {
      setLoading(false);
      setError("Request timed out. Please try again.");
    }, 10000);

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const botMessage = {
        role: "bot",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setError("Something went wrong. Please try again!");
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Something went wrong. Please try again!", timestamp: new Date().toLocaleTimeString("en-US", { hour12: true }) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      sendMessage();
    }
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("agriChatMessages");
  };

  return (
    <div className="AgriChatContainer" role="region" aria-label="AgriChat Interface">
      <div className="AgriChatHeader">🌿 AgriChat - AI Farming Assistant</div>
      <div className="AgriChatMessageArea" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === "user" ? "MessageBubbleUser" : "MessageBubbleBot"}`}
            role="article"
            aria-label={msg.role === "user" ? "User message" : "Bot response"}
          >
            <pre>{msg.content}</pre>
            <span className="MessageTimestamp">{msg.timestamp}</span>
          </div>
        ))}
        {loading && <p className="LoadingSpinnerTractor" aria-live="polite">Thinking...</p>}
        {error && <p className="ErrorMessage" aria-live="assertive">{error}</p>}
      </div>
      <div className="AgriChatInputBar">
        <input
          type="text"
          placeholder="Ask about farming..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          aria-label="Type your farming question"
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading} aria-label="Send message">
          {loading ? "Loading..." : "Send"}
        </button>
        <button
          onClick={clearChat}
          className="ClearChatButton"
          aria-label="Clear chat history"
          disabled={loading || messages.length === 0}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default AgriChat;
