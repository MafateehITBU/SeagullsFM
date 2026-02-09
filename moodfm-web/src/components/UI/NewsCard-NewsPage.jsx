import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NewsCardNewsPage = ({ news }) => {
    const navigate = useNavigate();
    const [truncateLength, setTruncateLength] = useState(70);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setTruncateLength(20); // Mobile: 20 characters
            } else {
                setTruncateLength(70); // Desktop: 70 characters
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const truncatedDescription = news.description
        ? news.description.substring(0, truncateLength) + (news.description.length > truncateLength ? '.' : '')
        : '';

    return (
        <div className="news-card-page">
            <div className="news-card-page-image-container">
                <img src={news.image?.url} alt={news.title} />
            </div>

            <div className="news-card-page-content flex-column-start">
                <span className="news-card-page-title mb-2">{news.title}</span>
                <p className="news-card-page-description">{truncatedDescription}</p>
                <button className="news-card-page-read-more-btn" onClick={() => navigate('/news-details', { state: { news } })}>Read More</button>
            </div>
        </div>
    );
};

export default NewsCardNewsPage;