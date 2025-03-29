import React, { useState } from 'react';
import axios from 'axios';
import '../styles/PestDetection.css';

function PestDetection() {
    const [image, setImage] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
        setResult(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post('http://localhost:5000/pest-detection', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(response.data.result);
        } catch (err) {
            setError('Error detecting pest. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pest-detection-container">
            <h2 className="title">Pest Detection</h2>
            <form onSubmit={handleSubmit} className="form">
                <div className="form-group">
                    <label htmlFor="image-upload" className="file-label">
                        {image ? image.name : 'Choose an Image'}
                    </label>
                    <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} />
                </div>
                <button type="submit" className="btn" disabled={!image || loading}>
                    {loading ? 'Detecting...' : 'Detect'}
                </button>
            </form>

            {error && <div className="error">{error}</div>}

            {result && (
                <div className="result">
                    <h3>Results</h3>
                    <div className="result-item">
                        <strong>Pesticide Detected:</strong> {result.pesticide_detected ? 'Yes' : 'No'}
                    </div>
                    {result.pesticide_detected && (
                        <>
                            <div className="result-item">
                                <strong>Pesticide Name:</strong> {result.pesticide_name}
                            </div>
                            <div className="result-item">
                                <strong>Confidence:</strong> {result.confidence}
                            </div>
                            <div className="result-item">
                                <strong>Solution:</strong> {result.solution.solution}
                            </div>
                            <ol className="steps-list">
                                {result.solution.steps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                            {result.marked_image_url && (
                                <div className="marked-image">
                                    <img src={result.marked_image_url} alt="Marked Area" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default PestDetection;