import React, { useState } from 'react';
import { detectPest } from '../services/api';
import '../styles/PestDetection.css';

function PestDetection() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', image);
        const response = await detectPest(formData);
        setResult(response.data);
    };

    return (
        <div>
            <h2>Pest Detection</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type="file" className="form-control" onChange={handleImageChange} />
                </div>
                <button type="submit" className="btn btn-primary">Detect</button>
            </form>
            {result && <div className="mt-4">
                <h3>Results</h3>
                {result.map((pest, index) => (
                    <p key={index}><strong>Pest {index + 1}:</strong> {pest.class_id} - {pest.confidence}</p>
                ))}
            </div>}
        </div>
    );
}

export default PestDetection;