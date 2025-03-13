import React, { useEffect, useState } from 'react';
import { getLegalInfo } from '../services/api';
import '../styles/LegalInfo.css';

function LegalInfo() {
    const [legalInfo, setLegalInfo] = useState([]);

    useEffect(() => {
        async function fetchLegalInfo() {
            const response = await getLegalInfo();
            setLegalInfo(response.data);
        }
        fetchLegalInfo();
    }, []);

    return (
        <div>
            <h2>Legal Information</h2>
            {legalInfo.map((info, index) => (
                <div key={index} className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">{info.regulation}</h5>
                        <p className="card-text">{info.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default LegalInfo;