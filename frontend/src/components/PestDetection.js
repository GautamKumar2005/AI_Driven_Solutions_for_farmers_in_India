import React, { useState } from 'react';
import axios from 'axios';
import '../styles/PestDetection.css';

function PestDetection() {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setResult(null);
        setError(null);
        
        // Create preview URL for selected image
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            setError("Please select an image to analyze.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await axios.post('http://localhost:5000/pest-detection', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            // The backend returns the result directly, not wrapped in a 'result' property
            setResult(response.data);
            console.log('Pest Detection Result:', response.data);
        } catch (err) {
            const errorData = err.response?.data;
            const errorMessage = errorData?.error || err.message;
            const errorDetails = errorData?.details || '';
            setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
            console.error('Error detecting pest:', errorData || err.message);
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
                        <input 
                            type="file" 
                            id="image-upload" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="file-input"
                        />
                    </label>
                </div>
                <button type="submit" className="btn" disabled={!image || loading}>
                    {loading ? 'Detecting...' : 'Detect Pesticides'}
                </button>
            </form>

            {imagePreview && (
                <div className="image-preview">
                    <img src={imagePreview} alt="Selected crop" />
                </div>
            )}

            {loading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Analyzing image for pesticides...</p>
                </div>
            )}

            {error && <div className="error-card">
                <h3>Error</h3>
                <p>{error}</p>
            </div>}

            {result && (
                <div className="result-section">
                    <h3>Detection Results</h3>
                    <div className="result-card">
                        <div className="result-item">
                            <span className="label">Pesticide Detected:</span>
                            <span className={`value ${result.pesticide_detected ? 'status-poor' : 'status-good'}`}>
                                {result.pesticide_detected ? 'Yes' : 'No'}
                            </span>
                        </div>
                        
                        {result.pesticide_detected && (
                            <>
                                <div className="result-item">
                                    <span className="label">Pesticide Name:</span>
                                    <span className="value">{result.pesticide_name}</span>
                                </div>
                                <div className="result-item">
                                    <span className="label">Confidence:</span>
                                    <span className="value">{(result.confidence * 100).toFixed(1)}%</span>
                                </div>
                                
                                <div className="solution-section">
                                    <h4>Recommended Solution</h4>
                                    <p className="solution-description">{result.solution.solution}</p>
                                    
                                    <h4>Steps to Follow:</h4>
                                    <ol className="steps-list">
                                        {result.solution.steps.map((step, index) => (
                                            <li key={index}>{step}</li>
                                        ))}
                                    </ol>
                                    
                                    <h4>Prevention:</h4>
                                    <p className="prevention-tip">{result.solution.prevention}</p>
                                </div>
                                
                                {result.marked_image_url && (
                                    <div className="marked-image-container">
                                        <h4>Affected Area</h4>
                                        <div className="marked-image">
                                            <img src={result.marked_image_url} alt="Pesticide affected area" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default PestDetection;
