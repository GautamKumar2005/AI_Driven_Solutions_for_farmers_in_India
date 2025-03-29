import React, { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './MarketingAnalysis.css';
import { FaTractor, FaChartBar, FaCalculator } from 'react-icons/fa';

const data = [
  { commodity: 'PADDY', variety: 'Common', msp: [1940, 2040, 2183] },
  { commodity: 'PADDY', variety: 'Grade \'A\'', msp: [1960, 2060, 2203] },
  { commodity: 'JOWAR', variety: 'Hybrid', msp: [2738, 2970, 3180] },
  { commodity: 'JOWAR', variety: 'Maldandi', msp: [2758, 2990, 3225] },
  { commodity: 'BAJRA', variety: '', msp: [2250, 2350, 2500] },
  { commodity: 'RAGI', variety: '', msp: [3377, 3578, 3846] },
  { commodity: 'MAIZE', variety: '', msp: [1870, 1962, 2090] },
  { commodity: 'TUR (ARHAR)', variety: '', msp: [6300, 6600, 7000] },
  { commodity: 'MOONG', variety: '', msp: [7275, 7755, 8558] },
  { commodity: 'URAD', variety: '', msp: [6300, 6600, 6950] },
  { commodity: 'GROUNDNUT', variety: '', msp: [5550, 5850, 6377] },
  { commodity: 'SUNFLOWER SEED', variety: '', msp: [6015, 6400, 6760] },
  { commodity: 'SOYABEEN (yellow)', variety: '', msp: [3950, 4300, 4600] },
  { commodity: 'SESAMUM', variety: '', msp: [7307, 7830, 8635] },
  { commodity: 'NIGERSEED', variety: '', msp: [6930, 7287, 7734] },
  { commodity: 'COTTON', variety: 'Medium Staple', msp: [5726, 6080, 6620] },
  { commodity: 'COTTON', variety: 'Long Staple', msp: [6025, 6380, 7020] },
  { commodity: 'WHEAT', variety: '', msp: [2015, 2125, 2275] },
  { commodity: 'BARLEY', variety: '', msp: [1635, 1735, 1850] },
  { commodity: 'GRAM', variety: '', msp: [5230, 5335, 5440] },
  { commodity: 'MASUR (LENTIL)', variety: '', msp: [5500, 6000, 6425] },
  { commodity: 'RAPESEED & MUSTARD', variety: '', msp: [5050, 5450, 5650] },
  { commodity: 'SAFFLOWER', variety: '', msp: [5441, 5650, 5800] },
  { commodity: 'COPRA', variety: 'Milling', msp: [10335, 10590, 10860] },
  { commodity: 'COPRA', variety: 'Ball', msp: [10600, 11000, 11750] },
  { commodity: 'JUTE', variety: '', msp: [4500, 4750, 5050] },
];

const MarketingAnalysis = () => {
  const [selectedCommodity, setSelectedCommodity] = useState(data[0]);

  const handleCommodityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = data.find(item => item.commodity === event.target.value);
    if (selected) {
      setSelectedCommodity(selected);
    }
  };

  const barChartData = {
    labels: ['2021-22', '2022-23', '2023-24'],
    datasets: [
      {
        label: selectedCommodity.commodity,
        data: selectedCommodity.msp,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const lineChartData = {
    labels: ['2021-22', '2022-23', '2023-24'],
    datasets: [
      {
        label: 'Growth Rate',
        data: [
          0,
          selectedCommodity.msp[1] - selectedCommodity.msp[0],
          selectedCommodity.msp[2] - selectedCommodity.msp[1],
        ],
        borderColor: 'rgba(255, 99, 132, 0.6)',
        fill: false,
      },
    ],
  };

  const calculateProfit = (quantity: number, yearIndex: number) => {
    return quantity * selectedCommodity.msp[yearIndex];
  };

  return (
    <div className="container">
      <h1 className="header">
        <FaTractor className="header-icon" />
        Marketing Analysis
      </h1>
      <p>Welcome to the Marketing Analysis section.</p>

      <div>
        <h2>
          <FaChartBar className="icon" />
          Select Commodity
        </h2>
        <select onChange={handleCommodityChange}>
          {data.map((item, index) => (
            <option key={index} value={item.commodity}>
              {item.commodity} {item.variety && `(${item.variety})`}
            </option>
          ))}
        </select>
      </div>

      <div className="chart-container">
        <div className="chart">
          <h2>
            <FaChartBar className="icon" />
            Minimum Support Prices (MSP)
          </h2>
          <Bar data={barChartData} />
        </div>
        <div className="chart">
          <h2>
            <FaChartBar className="icon" />
            Growth Rate
          </h2>
          <Line data={lineChartData} />
        </div>
      </div>

      <div>
        <h2>
          <FaCalculator className="icon" />
          MSP Calculator
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>MSP (Rs. per quintal)</th>
                <th>Quantity (quintal)</th>
                <th>Total (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {barChartData.labels.map((label, index) => (
                <tr key={index}>
                  <td>{label}</td>
                  <td>{selectedCommodity.msp[index]}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      onChange={(e) => {
                        const quantity = parseFloat(e.target.value);
                        if (!isNaN(quantity)) {
                          const total = calculateProfit(quantity, index);
                          const totalElement = document.getElementById(`total-${index}`);
                          if (totalElement) {
                            totalElement.innerText = total.toString();
                          }
                        }
                      }}
                    />
                  </td>
                  <td id={`total-${index}`}>0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketingAnalysis;