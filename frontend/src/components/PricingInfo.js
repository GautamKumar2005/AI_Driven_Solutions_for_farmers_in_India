import React, { useEffect, useState } from 'react';
import '../styles/PricingInfo.css';

function PricingInfo() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const response = await fetch('https://agriconnect-k5uz.onrender.com/pricing-info');
        
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }

        const json = await response.json();

        // Safety check + basic validation
        if (!Array.isArray(json)) {
          throw new Error('Invalid data format from server');
        }

        // Optional: filter out clearly invalid rows
        const cleanedData = json.filter(item => 
          item.crop && 
          item.crop.trim() !== '' &&
          item.price && 
          item.price.trim() !== '' &&
          !item.crop.toLowerCase().includes('cost') &&
          !item.crop.toLowerCase().includes('kms') &&
          item.category !== item.crop  // avoid duplicate header rows
        );

        setData(cleanedData);
      } catch (err) {
        console.error('Error fetching MSP prices:', err);
        setError(err.message || 'Failed to load pricing information');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, []);

  if (loading) {
    return (
      <div className="pricing-loading">
        <div className="spinner"></div>
        <p>Loading Minimum Support Prices (MSP) 2025-26...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pricing-error">
        <h3>Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="pricing-info-page">
      <header className="pricing-header">
        <h1>Minimum Support Prices (MSP) – Kharif Marketing Season 2025-26</h1>
        <p className="source-info">
          Source: Government of India (PIB) – Prices in ₹ per Quintal
        </p>
      </header>

      <div className="table-container">
        <table className="msp-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Crop</th>
              <th>MSP (₹/Quintal)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={row.price === '-' || row.price === '' ? 'strikethrough-row' : ''}>
                <td className="category-cell">{row.category}</td>
                <td className="crop-cell">{row.crop}</td>
                <td className="price-cell">
                  {row.price === '-' || row.price === '' ? '—' : row.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <p className="no-data">No pricing data available at the moment.</p>
      )}
    </div>
  );
}

export default PricingInfo;
