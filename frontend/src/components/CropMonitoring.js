import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/CropMonitoring.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function CropMonitoring() {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [textDescription, setTextDescription] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setResult(null);
        setError(null);
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    };

    const handleTextChange = (e) => {
        setTextDescription(e.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!image) {
            setError("Please select an image to analyze.");
            return;
        }

        const formData = new FormData();
        formData.append('image', image);
        
        // Add text description if provided
        if (textDescription.trim()) {
            formData.append('description', textDescription.trim());
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('http://localhost:5000/crop-monitoring', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Store the entire response data
            setResult(response.data);
            console.log('Crop Analysis Result:', response.data);
        } catch (error) {
            const errorData = error.response?.data;
            const errorMessage = errorData?.error || error.message;
            const errorDetails = errorData?.details || '';
            setError(`${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}`);
            console.error('Error analyzing crop:', errorData || error.message);
        } finally {
            setLoading(false);
        }
    };

    // Convert result to chart data (ratings out of 10)
    const getChartData = () => {
        if (!result || !result.plant_health) return null;

        // Map health status to numerical ratings
        const getHealthRating = (status) => {
            switch(status) {
                case 'good': return 9;
                case 'moderate': return 5;
                case 'not healthy': return 2;
                default: return 5;
            }
        };

        // Map growth stage to numerical ratings
        const getGrowthRating = (stage) => {
            switch(stage) {
                case 'normal': return 8;
                case 'medium': return 5;
                case 'need help': return 3;
                default: return 5;
            }
        };

        // Map nutrient deficiency to numerical ratings
        const getNutrientRating = (deficiency) => {
            switch(deficiency) {
                case 'none': return 9;
                case 'no need': return 7;
                case 'yes need': return 2;
                default: return 5;
            }
        };

        const plantHealth = result.plant_health;
        
        return {
            labels: ['Health', 'Growth Stage', 'Nutrient Deficiency'],
            datasets: [{
                label: 'Crop Rating',
                data: [
                    getHealthRating(plantHealth.health),
                    getGrowthRating(plantHealth.growth_stage),
                    getNutrientRating(plantHealth.nutrient_deficiency)
                ],
                backgroundColor: ['#00796b', '#004d40', '#26a69a'],
                borderColor: ['#004d40', '#00332b', '#1b746e'],
                borderWidth: 1,
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Crop Analysis Ratings', color: '#00796b', font: { size: 18 } }
        },
        scales: {
            y: { beginAtZero: true, max: 10, title: { display: true, text: 'Rating (0-10)' } }
        }
    };

    // Helper function to get color class based on status
    const getStatusColorClass = (status, type) => {
        if (type === 'health') {
            switch(status) {
                case 'good': return 'status-good';
                case 'moderate': return 'status-moderate';
                case 'not healthy': return 'status-poor';
                default: return '';
            }
        } else if (type === 'growth') {
            switch(status) {
                case 'normal': return 'status-good';
                case 'medium': return 'status-moderate';
                case 'need help': return 'status-poor';
                default: return '';
            }
        } else if (type === 'nutrient') {
            switch(status) {
                case 'none': return 'status-good';
                case 'no need': return 'status-moderate';
                case 'yes need': return 'status-poor';
                default: return '';
            }
        }
        return '';
    };

    return (
        <div className="crop-monitoring-container">
            <h1 className="title">Crop Monitoring Dashboard</h1>
            <div className="upload-section">
                <form onSubmit={handleSubmit} className="upload-form">
                    <label htmlFor="image-upload" className="file-label">
                        <span>{image ? image.name : 'Choose an Image'}</span>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="file-input"
                        />
                    </label>
                    <div className="text-input-container">
                        <textarea
                            placeholder="Optional: Describe your plant's condition"
                            value={textDescription}
                            onChange={handleTextChange}
                            className="text-description"
                        />
                    </div>
                    <button type="submit" className="analyze-btn" disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze Crop'}
                    </button>
                </form>
            </div>

            {imagePreview && (
                <div className="image-preview">
                    <img src={imagePreview} alt="Uploaded Crop" />
                </div>
            )}

            {loading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Processing your image...</p>
                </div>
            )}

            {error && (
                <div className="error-card">
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {result && result.plant_health && !error && (
                <div className="result-section">
                    <div className="result-card">
                        <h2>Analysis Results</h2>
                        <div className="result-item">
                            <span className="label">Health:</span>
                            <span className={`value ${getStatusColorClass(result.plant_health.health, 'health')}`}>
                                {result.plant_health.health}
                            </span>
                        </div>
                        <div className="result-item">
                            <span className="label">Growth Stage:</span>
                            <span className={`value ${getStatusColorClass(result.plant_health.growth_stage, 'growth')}`}>
                                {result.plant_health.growth_stage}
                            </span>
                        </div>
                        <div className="result-item">
                            <span className="label">Nutrient Deficiency:</span>
                            <span className={`value ${getStatusColorClass(result.plant_health.nutrient_deficiency, 'nutrient')}`}>
                                {result.plant_health.nutrient_deficiency}
                            </span>
                        </div>
                    </div>
                    <div className="chart-container">
                        <Bar data={getChartData()} options={chartOptions} />
                    </div>
                </div>
            )}

            {result && result.recommendations && (
                <div className="recommendations-section">
                    <h3>Recommendations</h3>
                    <ul className="recommendations-list">
                        {result.recommendations.map((recommendation, index) => (
                            <li key={index} className="recommendation-item">{recommendation}</li>
                        ))}
                    </ul>
                </div>
            )}

            {result && result.plant_health_options && (
                <div className="options-section">
                    <h3>Available Plant Health Categories</h3>
                    <div className="options-grid">
                        <div className="option-card">
                            <h4>Health Options</h4>
                            <ul>
                                {result.plant_health_options.health.map((option, index) => (
                                    <li key={index} className={getStatusColorClass(option, 'health')}>
                                        {option}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="option-card">
                            <h4>Growth Stage Options</h4>
                            <ul>
                                {result.plant_health_options.growth_stage.map((option, index) => (
                                    <li key={index} className={getStatusColorClass(option, 'growth')}>
                                        {option}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="option-card">
                            <h4>Nutrient Deficiency Options</h4>
                            <ul>
                                {result.plant_health_options.nutrient_deficiency.map((option, index) => (
                                    <li key={index} className={getStatusColorClass(option, 'nutrient')}>
                                        {option}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CropMonitoring;
