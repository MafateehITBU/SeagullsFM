import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const NewsDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const news = location.state?.news;

    const images = (news?.images?.length ? news.images : (news?.image ? [news.image] : []))
        .map((img) => (typeof img === 'string' ? { url: img } : img))
        .filter((img) => img?.url);

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setCurrentIndex(0);
    }, [news?._id]);

    // Auto-swipe: advance to next image every 4 seconds when multiple images
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));
        }, 4000);
        return () => clearInterval(interval);
    }, [images.length]);

    // If no news data in state, redirect back to news page
    if (!news) {
        navigate('/news');
        return null;
    }

    const currentImage = images[currentIndex];

    return (
        <>
            <Header />

            <section className="news-details-section">
                <div className="news-details-carousel">
                    {images.length > 0 ? (
                        <>
                            <div className="news-details-carousel-inner">
                                <img
                                    src={currentImage.url}
                                    alt={`${news.title} – ${currentIndex + 1}`}
                                    className="news-details-carousel-img"
                                />
                            </div>
                            {images.length > 1 && (
                                <div className="news-details-carousel-dots">
                                    {images.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            className={`news-details-carousel-dot ${i === currentIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentIndex(i)}
                                            aria-label={`Go to image ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                <div className="news-details-content container">
                    <h1 className="news-details-title">{news.title}</h1>
                    <p className="news-details-description">{news.description}</p>
                    <p className="news-details-published-at"><span style={{ fontWeight: '700' }}>Published:</span> {new Date(news.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    <p className="news-details-body" dangerouslySetInnerHTML={{ __html: news.content.replace(/\n/g, '<br />') }}></p>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default NewsDetails;