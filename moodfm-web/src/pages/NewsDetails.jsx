import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const NewsDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const news = location.state?.news;

    // If no news data in state, redirect back to news page
    if (!news) {
        navigate('/news');
        return null;
    }

    return (
        <>
            <Header />

            <section className="news-details-section">
                <div className="hero-img-container">
                    <img src={news.image?.url} alt={news.title} />
                </div>

                <div className="news-details-content container">
                    <h1 className="news-details-title">{news.title}</h1>
                    <p className="news-details-description">{news.description}</p>
                    <p className="news-details-published-at"><span style={{ fontWeight: '700' }}>Published:</span> {new Date(news.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    <p className="news-details-content" dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, '<br />') }}></p>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default NewsDetails;