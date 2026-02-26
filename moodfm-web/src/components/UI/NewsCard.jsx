import React from 'react';
import { useNavigate } from 'react-router-dom';
import NewsDetails from '../../pages/NewsDetails';

const NewsCard = ({ news, cardClass = '' }) => {
    const navigate = useNavigate();

    const truncatedDescription = news.description
        ? news.description.length > 120
            ? news.description.substring(0, 120).trim() + '...'
            : news.description
        : '';

    const imageUrl = news.images?.[0]?.url ?? news.image?.url;

    return (
        <div className={`news-card ${cardClass}`}>
            <div className="news-card-image-container">
                <img
                    src={imageUrl}
                    alt={news.title}
                    className="news-card-image"
                />
            </div>
            <div className="news-card-content">
                <span className="news-card-title">{news.title}</span>
                <p className="news-card-description">{truncatedDescription}</p>
                <button
                    className="news-card-read-more-btn"
                    onClick={() => navigate('/news-details', { state: { news } })}
                >
                    READ MORE
                </button>
            </div>
        </div>
    );
};

export default NewsCard;

