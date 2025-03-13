import React, { useEffect, useState } from 'react';
import { getPricingInfo } from '../services/api';
import '../styles/PricingInfo.css';

function PricingInfo() {
    const [pricingInfo, setPricingInfo] = useState([]);

    useEffect(() => {
        async function fetchPricingInfo() {
            const response = await getPricingInfo();
            setPricingInfo(response.data);
        }
        fetchPricingInfo();
    }, []);

    return (
        <div>
            <h2>Pricing Information</h2>
            {pricingInfo.map((info, index) => (
                <div key={index} className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">{info.crop}</h5>
                        <p className="card-text">Price: ${info.price}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default PricingInfo;