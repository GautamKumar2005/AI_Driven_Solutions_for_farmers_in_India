import React, { useState } from 'react';
import { retrieveOfflineData } from '../services/api';
import '../styles/OfflineData.css';

function OfflineData() {
    const [dataType, setDataType] = useState('');
    const [result, setResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await retrieveOfflineData({ dataType });
        setResult(response.data);
    };

    return (
        <div>
            <h2>Offline Data Retrieval</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        value={dataType}
                        onChange={(e) => setDataType(e.target.value)}
                        placeholder="Enter data type"
                    />
                </div>
                <button type="submit" className="btn btn-primary">Retrieve</button>
            </form>
            {result && <div className="mt-4">
                <h3>Results</h3>
                <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>}
        </div>
    );
}

export default OfflineData;