import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import CropMonitoring from './components/CropMonitoring';
import PestDetection from './components/PestDetection';
import LegalInfo from './components/LegalInfo';
import PricingInfo from './components/PricingInfo';
import OfflineData from './components/OfflineData';

function App() {
    return (
        <Router>
            <Navigation />
            <div className="container mt-4">
                <Routes>
                    <Route path="/crop-monitoring" element={<CropMonitoring />} />
                    <Route path="/pest-detection" element={<PestDetection />} />
                    <Route path="/legal-info" element={<LegalInfo />} />
                    <Route path="/pricing-info" element={<PricingInfo />} />
                    <Route path="/offline-data" element={<OfflineData />} />
                    <Route path="/" element={<h2>Welcome to the Farming App</h2>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;