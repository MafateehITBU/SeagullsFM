import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';

import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import NewsCardNewsPage from '../components/UI/NewsCard-NewsPage';

import newsHeroImg from "../assets/imgs/News/news-hero.png";
const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage, setCardsPerPage] = useState(9);

    const totalPages = Math.ceil(news.length / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const currentNews = news.slice(startIndex, endIndex);

    useEffect(() => {
        fetchNews();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 480) {
                setCardsPerPage(2); // Mobile: 2 cards
            } else if (window.innerWidth <= 768) {
                setCardsPerPage(2); // Tablet: 2 cards
            } else if (window.innerWidth <= 1024) {
                setCardsPerPage(3); // Small desktop: 3 cards
            } else {
                setCardsPerPage(9); // Desktop: 9 cards (3 rows x 3 columns)
            }
            // Reset to page 1 when screen size changes
            setCurrentPage(1);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchNews = async () => {
        try {
            const response = await axiosInstance.get('/news');
            const filteredNews = response.data.data.filter(
                (news) => news.channelId?.name === "MoodFM"
            )
            setNews(filteredNews);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReadMoreNews = () => {
        const newsCardsSection = document.querySelector('.news-cards-section');
        newsCardsSection.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <Header />
            {/* Hero Section */}
            <section className="news-hero-section">
                <div className="news-hero-container container flex-between">
                    <div className="news-hero-left-side flex-column-start">
                        <h1 className="news-hero-title mb-3">News <span className="ampersand-fallback">&</span> Updates</h1>
                        <p className="news-hero-description">
                            Music news, artist stories, and what’s happening at <br/> Mood FM.
                        </p>

                        <div className="about-hero-divider"></div>

                        <button className="news-hero-btn" onClick={handleReadMoreNews}>
                            Read More News
                        </button>
                    </div>
                    <div className="news-hero-right-side">
                        <img src={newsHeroImg} alt="News Hero" />
                    </div>
                </div>
            </section>

            {/* News Cards Section */}
            <section className="news-cards-section">
                <div className="news-cards-container container flex-column-center">
                    <h2 className="news-cards-title mb-5">Latest News <span className="ampersand-fallback">&</span> Updates</h2>
                   
                    <div className="news-cards-wrapper mt-3 mb-3">
                        {loading ? (
                            <p>Loading...</p>
                        ) : currentNews && currentNews.length > 0 ? (
                            currentNews.map((newsItem) => (
                                <NewsCardNewsPage key={newsItem._id} news={newsItem} />
                            ))
                        ) : (
                            <p>No news available</p>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && news.length > 0 && totalPages > 1 && (
                        <div className="news-pagination mb-3">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    className={`news-pagination-btn ${currentPage === page ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </>
    );
};

export default News;