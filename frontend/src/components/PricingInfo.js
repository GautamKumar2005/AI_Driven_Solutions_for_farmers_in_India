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

        if (!res.ok) throw new Error('Failed to fetch data');

        const data = await res.json();

        const cleaned = [];
        let currentCategory = '';

        data.forEach(({ crop = '', price = '' }) => {
          crop = crop.trim();
          price = price.trim();

          // skip empty junk rows
          if (!crop && !price) return;

          // detect section titles
          if (
            price === '' ||
            price === '-' ||
            price.toLowerCase().includes('kms')
          ) {
            currentCategory = crop;
            return;
          }

          // real data row
          cleaned.push({
            category: currentCategory || 'General',
            crop,
            price
          });
        });

        setRows(cleaned);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>Loading pricing info...</p>;
  if (error) return <p>Error: {error}</p>;

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
