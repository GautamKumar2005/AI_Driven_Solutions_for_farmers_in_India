import React, { useEffect, useState } from 'react';
import './GlobalCropTrends.css'; // Import the CSS file

const GlobalCropTrends = () => {
  const [article, setArticle] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch('https://agriconnect-k5uz.onrender.com/scrape');
        const data = await res.json();
        setArticle(data.article);
      } catch (error) {
        setError('Failed to fetch article content');
      }
    };

    fetchArticle();
  }, []);

  return (
    <div className="article-container">
      <h1>Global Crop Trends</h1>
      {error ? <p>{error}</p> : <div dangerouslySetInnerHTML={{ __html: article }} />}
    </div>
  );
};

export default GlobalCropTrends;
