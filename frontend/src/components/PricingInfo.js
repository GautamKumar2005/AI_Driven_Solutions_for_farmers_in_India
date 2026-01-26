import React from 'react';
import '../styles/PricingInfo.css';

const pricingData = [
  { category: 'Cereals', crop: 'Paddy (Common)', price: 2369 },
  { category: 'Cereals', crop: 'Paddy (Grade A)', price: 2389 },
  { category: 'Cereals', crop: 'Jowar (Hybrid)', price: 3699 },
  { category: 'Cereals', crop: 'Jowar (Maldandi)', price: 3749 },
  { category: 'Cereals', crop: 'Bajra', price: 2775 },
  { category: 'Cereals', crop: 'Ragi', price: 4886 },
  { category: 'Cereals', crop: 'Maize', price: 2400 },
  { category: 'Pulses', crop: 'Tur / Arhar', price: 8000 },
  { category: 'Pulses', crop: 'Moong', price: 8768 },
  { category: 'Pulses', crop: 'Urad', price: 7800 },
  { category: 'Oilseeds', crop: 'Groundnut', price: 7263 },
  { category: 'Oilseeds', crop: 'Sunflower Seed', price: 7721 },
  { category: 'Oilseeds', crop: 'Soybean (Yellow)', price: 5328 },
  { category: 'Oilseeds', crop: 'Sesamum', price: 9846 },
  { category: 'Oilseeds', crop: 'Nigerseed', price: 9537 },
  { category: 'Commercial', crop: 'Cotton (Medium Staple)', price: 7710 },
  { category: 'Commercial', crop: 'Cotton (Long Staple)', price: 8110 },
];

function PricingInfo() {
  return (
    <div className="pricing-container">
      {/* Top announcement header */}
      <div className="announcement-header">
        Cabinet approves Minimum Support Prices (MSP) for Kharif Crops for Marketing Season 2025-26
      </div>

      <h1>MSP Crop Prices (₹ per Quintal)</h1>

      <table className="pricing-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Crop</th>
            <th>MSP 2025-26 (₹)</th>
          </tr>
        </thead>
        <tbody>
          {pricingData.map((row, index) => (
            <tr key={index}>
              <td>{row.category}</td>
              <td>{row.crop}</td>
              <td>{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="disclaimer">
        *MSP refers to Minimum Support Price fixed by the Government. Margins may vary based on crop and cost of production.
      </p>
    </div>
  );
}

export default PricingInfo;
