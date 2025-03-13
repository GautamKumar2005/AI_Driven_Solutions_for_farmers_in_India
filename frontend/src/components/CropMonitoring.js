import React, { useState } from 'react';
import { analyzeCrop } from '../services/api';
import '../styles/CropMonitoring.css';

function CropMonitoring() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', image);
        const response = await analyzeCrop(formData);
        setResult(response.data);
    };

    return (
        <div>
            <h2>Crop Monitoring</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input type="file" className="form-control" onChange={handleImageChange} />
                </div>
                <button type="submit" className="btn btn-primary">Analyze</button>
            </form>
            {result && <div className="mt-4">
                <h3>Results</h3>
                <p><strong>Health:</strong> {result.health}</p>
                <p><strong>Growth Stage:</strong> {result.growth_stage}</p>
                <p><strong>Nutrient Deficiency:</strong> {result.nutrient_deficiency}</p>
            </div>}
        </div>
    );
}

export default CropMonitoring;