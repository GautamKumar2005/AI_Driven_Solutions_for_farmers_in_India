import React, { useEffect, useState } from 'react';
import '../styles/PricingInfo.css'; // Import your CSS file for styling

function PricingInfo() {
    const [pricingInfo, setPricingInfo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPricingInfo() {
            try {
                console.log('Fetching pricing info...');
                const response = await fetch('http://localhost:5000/pricing-info');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log('Fetched data:', data);
                setPricingInfo(data);
            } catch (error) {
                console.error('Error fetching pricing info:', error);
                setError(error.toString());
            } finally {
                setLoading(false);
            }
        }
        fetchPricingInfo();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    // Group data by session year
    const groupedData = pricingInfo.reduce((acc, item) => {
        const sessionYear = item.price.match(/\d{4}-\d{2}/);
        const key = sessionYear ? sessionYear[0] : 'Unknown';
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {});

    return (
        <div className="pricing-info-container">
            <h2 className="pricing-info-title">Pricing Information</h2>
            {Object.keys(groupedData).map(sessionYear => (
                <React.Fragment key={sessionYear}>
                    {sessionYear === 'Unknown' ? <h3 className="pricing-info-session-title">2025-26</h3> : <h3 className="pricing-info-session-title">{sessionYear}</h3>}
                    <table className="pricing-info-table table-hover">
                        <thead>
                            <tr>
                                <th>Crop</th>
                                <th>Price (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupedData[sessionYear].map((info, index) => (
                                <tr key={index}>
                                    <td>{info.crop}</td>
                                    <td>{info.price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </React.Fragment>
            ))}
        </div>
    );
}

export default PricingInfo;