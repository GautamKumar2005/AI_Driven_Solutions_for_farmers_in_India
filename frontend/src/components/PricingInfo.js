import React, { useEffect, useState } from 'react';
import '../styles/PricingInfo.css';

function PricingInfo() {
  const [pricingInfo, setPricingInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPricingInfo() {
      try {
        const response = await fetch(
          'https://agriconnect-k5uz.onrender.com/pricing-info'
        );

        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();

        // ✅ Clean scraped junk rows
        const cleaned = data.filter(item =>
          item.crop &&
          item.price &&
          item.crop !== 'Crops' &&
          item.price !== '-' &&
          !item.price.includes('Cost')
        );

        setPricingInfo(cleaned);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPricingInfo();
  }, []);

  if (loading) return <p>Loading pricing data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="pricing-info-container">
      <h2 className="pricing-info-title">
        MSP Pricing (₹ per Quintal) – 2025–26
      </h2>

      <table className="pricing-info-table">
        <thead>
          <tr>
            <th>Crop</th>
            <th>Price (₹)</th>
          </tr>
        </thead>
        <tbody>
          {pricingInfo.map((item, index) => (
            <tr key={index}>
              <td>{item.crop}</td>
              <td>{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PricingInfo;
