import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { Icon } from '@iconify/react';

import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import NewsCardNewsPage from '../components/UI/NewsCard-NewsPage';
import NoData from '../components/UI/NoData';

import newsHeroImg from "../assets/imgs/News/news-hero.png";
const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [cardsPerPage, setCardsPerPage] = useState(9);
    const [activeArrow, setActiveArrow] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const totalPages = Math.ceil(news.length / cardsPerPage);
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;
    const currentNews = news.slice(startIndex, endIndex);

    useEffect(() => {
        fetchNews();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            
            if (width <= 480) {
                setCardsPerPage(1); // Mobile: 1 card
            } else if (width <= 768) {
                setCardsPerPage(1); // Tablet: 1 card
            } else if (width <= 1024) {
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

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => 
            prevPage === 1 ? totalPages : prevPage - 1
        );
        setActiveArrow("left");
        setTimeout(() => setActiveArrow(null), 300);
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => 
            prevPage === totalPages ? 1 : prevPage + 1
        );
        setActiveArrow("right");
        setTimeout(() => setActiveArrow(null), 300);
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
                            <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '200px' }}>
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : currentNews && currentNews.length > 0 ? (
                            currentNews.map((newsItem) => (
                                <NewsCardNewsPage key={newsItem._id} news={newsItem} />
                            ))
                        ) : (
                            <NoData message="No news available at the moment" icon="material-symbols:newspaper-outline" />
                        )}
                    </div>

                    {/* Pagination - Desktop */}
                    {!loading && news.length > 0 && totalPages > 1 && !isMobile && (
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

                    {/* Arrow Navigation - Mobile */}
                    {!loading && news.length > 0 && totalPages > 1 && (
                        <div className="news-pagination-arrows mb-3">
                            <button
                                type="button"
                                className={`news-pagination-arrow news-pagination-arrow-left ${activeArrow === "left" ? "news-pagination-arrow-active" : ""}`}
                                onClick={handlePrevPage}
                            >
                                <Icon icon="ic:round-arrow-back" width="45" height="45" />
                            </button>
                            <button
                                type="button"
                                className={`news-pagination-arrow news-pagination-arrow-right ${activeArrow === "right" ? "news-pagination-arrow-active" : ""}`}
                                onClick={handleNextPage}
                            >
                                <Icon icon="ic:baseline-arrow-forward" width="45" height="45" />
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </>
    );
};

export default News;