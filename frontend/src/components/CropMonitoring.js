import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/CropMonitoring.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function CropMonitoring() {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // For image preview
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setResult(null);
        setError(null);
        if (file) {
            setImagePreview(URL.createObjectURL(file)); // Generate preview URL
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!image) {
            setError("Please select an image to analyze.");
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await axios.post('http://localhost:5000/crop-monitoring', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data.result);
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
        if (!result) return null;

        // Map results to numerical ratings (example mapping)
        const ratings = {
            health: result.health === 'good' ? 8 : result.health === 'poor' ? 2 : 5,
            growth_stage: result.growth_stage === 'mature' ? 7 : result.growth_stage === 'early' ? 3 : 5,
            nutrient_deficiency: result.nutrient_deficiency === 'none' ? 9 : result.nutrient_deficiency === 'severe' ? 1 : 4
        };

        return {
            labels: ['Health', 'Growth Stage', 'Nutrient Deficiency'],
            datasets: [{
                label: 'Crop Rating',
                data: [ratings.health, ratings.growth_stage, ratings.nutrient_deficiency],
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

            {result && !error && (
                <div className="result-section">
                    <div className="result-card">
                        <h2>Analysis Results</h2>
                        <div className="result-item">
                            <span className="label">Health:</span>
                            <span className="value">{result.health}</span>
                        </div>
                        <div className="result-item">
                            <span className="label">Growth Stage:</span>
                            <span className="value">{result.growth_stage}</span>
                        </div>
                        <div className="result-item">
                            <span className="label">Nutrient Deficiency:</span>
                            <span className="value">{result.nutrient_deficiency}</span>
                        </div>
                    </div>
                    <div className="chart-container">
                        <Bar data={getChartData()} options={chartOptions} />
                    </div>
                </div>
            )}
        </div>
        
    );
}

export default CropMonitoring;