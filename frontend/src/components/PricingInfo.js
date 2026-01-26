import React, { useEffect, useState } from 'react';
import '../styles/PricingInfo.css';

function PricingInfo() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://agriconnect-k5uz.onrender.com/pricing-info')
      .then(res => res.json())
      .then(data => {
        setRows(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading MSP prices...</p>;

  return (
    <div className="pricing-info-container">
      <h2>MSP Crop Prices (₹ per Quintal)</h2>

      <table className="pricing-info-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Crop</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>{row.category}</td>
              <td>{row.crop}</td>
              <td>{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PricingInfo;
