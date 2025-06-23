import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Search, MessageCircle, Wheat, Tractor } from 'lucide-react';
import './buyer.css';

// Mock farmer data
const farmers = [
  {
    id: 1,
    name: 'Ramesh Patel',
    crops: [
      { name: 'Wheat', yield: 500, price: 2200 }, // Price per quintal (100 kg)
      { name: 'Rice', yield: 300, price: 2500 },
    ],
    avatar: '/images/farmer1.jpg',
  },
  {
    id: 2,
    name: 'Sita Devi',
    crops: [
      { name: 'Rice', yield: 400, price: 2400 },
      { name: 'Maize', yield: 200, price: 1800 },
    ],
    avatar: '/images/farmer2.jpg',
  },
  {
    id: 3,
    name: 'Vikram Singh',
    crops: [
      { name: 'Wheat', yield: 600, price: 2100 },
      { name: 'Millets', yield: 150, price: 3000 },
    ],
    avatar: '/images/farmer3.jpg',
  },
];

// Mock chat data
const initialChats = {
  1: [
    { sender: 'buyer', text: 'Hi Ramesh, is your wheat organic?', time: '10:00 AM' },
    { sender: 'farmer', text: 'Yes, it’s 100% organic. Interested?', time: '10:05 AM' },
  ],
  2: [],
  3: [],
};

const Buyer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Filter farmers based on search query
  const filteredFarmers = farmers.filter((farmer) =>
    farmer.crops.some((crop) =>
      crop.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <section className="buyer-container">
      <div className="buyer-content">
        <h1 className="title">Connect with Farmers</h1>
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search for crops (e.g., Wheat, Rice)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="farmer-grid">
          {filteredFarmers.length > 0 ? (
            filteredFarmers.map((farmer) => (
              <div
                key={farmer.id}
                className={`farmer-card farmer-card-${farmer.id}`}
              >
                <img
                  src={farmer.avatar}
                  alt={farmer.name}
                  className="farmer-avatar"
                />
                <h3 className="farmer-name">{farmer.name}</h3>
                <div className="crops-list">
                  {farmer.crops
                    .filter((crop) =>
                      crop.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .map((crop, index) => (
                      <p key={index} className="crop-item">
                        <Wheat className="crop-icon" />
                        {crop.name}: {crop.yield} kg, ₹{crop.price}/quintal
                      </p>
                    ))}
                </div>
                <button
                  className="chat-button"
                  onClick={() => navigate(`/chat/${farmer.id}`)}
                >
                  <MessageCircle className="chat-icon" />
                  Chat
                </button>
              </div>
            ))
          ) : (
            <p className="no-results">No farmers found for "{searchQuery}"</p>
          )}
        </div>
      </div>
    </section>
  );
};

// Chat Page Component
const ChatPage = () => {
  const { farmerId } = useParams();
  const farmer = farmers.find((f) => f.id === parseInt(farmerId));
  const [messages, setMessages] = useState(initialChats[farmerId] || []);
  const [newMessage, setNewMessage] = useState('');

  if (!farmer) {
    return <div className="chat-container">Farmer not found</div>;
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: 'buyer',
      text: newMessage,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Simulate farmer reply after 1 second
    setMessages([...messages, message]);
    setNewMessage('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'farmer',
          text: `Hi, thanks for your message! Let me check on that.`,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    }, 1000);
  };

  return (
    <section className="chat-container">
      <div className="chat-content">
        <h1 className="chat-title">
          Chat with {farmer.name} <Tractor className="chat-title-icon" />
        </h1>
        <div className="chat-box">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.sender === 'buyer' ? 'message-buyer' : 'message-farmer'
              }`}
            >
              <p className="message-text">{msg.text}</p>
              <span className="message-time">{msg.time}</span>
            </div>
          ))}
        </div>
        <form className="chat-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="chat-input"
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </form>
        <Link to="/buyer" className="back-button">
          Back to Farmers
        </Link>
      </div>
    </section>
  );
};

export { Buyer, ChatPage };