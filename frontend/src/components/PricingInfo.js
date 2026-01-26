import React, { useEffect, useState } from 'react';
import '../styles/PricingInfo.css';

function PricingInfo() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('https://agriconnect-k5uz.onrender.com/pricing-info');

        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const json = await res.json();
        setRows(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p className="pricing-loading">Loading MSP prices...</p>;

  if (error) return <p className="pricing-error">Failed: {error}</p>;

  return (
    <div className="pricing-info-container">
      <h2>MSP Crop Prices (₹ per Quintal)</h2>

      <table className="pricing-info-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Crop</th>
            <th>Price (₹)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className="category-cell">{row.category}</td>
              <td>{row.crop}</td>
              <td>{row.price}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && <p>No pricing data found.</p>}
    </div>
  );
}

export default PricingInfo;
