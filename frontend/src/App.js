import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import CropMonitoring from "./components/CropMonitoring";
import Navbar from "./components/Navigation";  // Ensure this is imported correctly
import Home from "./Home";
import GlobalCropTrends from "./feature/globaltrends";
import GovernmentMSPRates from "./feature/msprates";
import CommunityNetwork from "./feature/community";
import MarketingAnalysis from "./feature/marketing";
import AgriculturalTechnology from "./feature/agritech";
import PestDetection from "./components/PestDetection";
import AgriChat from "./AgriChat/agrichat";
import Login from "./Auth/login";
import Signup from "./Auth/sigup";
import Pricing from "./components/PricingInfo";
import './App.css';
const ChatbotIcon = () => {
  const navigate = useNavigate();
  return (
    <div className="chatbot-icon" onClick={() => navigate("/agri-chat")}>
      <img src="https://img.freepik.com/free-vector/chatbot-conversation-vectorart_78370-4107.jpg" alt="Chatbot Icon" />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crop-monitoring" element={<CropMonitoring />} />
        <Route path="/agri-tech" element={<AgriculturalTechnology/>}/>      
        <Route path="/crop-trends" element={<GlobalCropTrends/>}/>
        <Route path="/community" element={<CommunityNetwork/>}/>
        <Route path="/msp-rates" element={<GovernmentMSPRates/>}/>
        <Route path="/marketing" element={<MarketingAnalysis/>}/>
        <Route path="/pest-detection" element={<PestDetection/>}/>
        <Route path="/agri-chat" element={<AgriChat/>}/>
        <Route path="/login" element={<Login/>}/>         
        <Route path="/signup" element={<Signup/>}/>      
        <Route path="/pricing-info" element={<Pricing/>}/>
      </Routes>
      <ChatbotIcon />
    </Router>
  );
}

export default App;