import React, { useState, useEffect } from 'react'
import axiosInstance from '../axiosConfig'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import { Icon } from '@iconify/react'

import presentersHeroImg from "../assets/imgs/Presenters/presenters-hero.png"

const Presenters = () => {
    const [presenters, setPresenters] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [activeArrow, setActiveArrow] = useState(null)

    useEffect(() => {
        fetchPresenters()
    }, [])

    const fetchPresenters = async () => {
        try {
            const response = await axiosInstance.get('/broadcaster')
            const filteredPresenters = response.data.data.filter(presenter => presenter.channelId.name === 'MoodFM');
            setPresenters(filteredPresenters)
        } catch (error) {
            console.error('Error fetching presenters:', error)
        }
    }

    const handlePrevPresenter = () => {
        if (!presenters.length) return;
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? presenters.length - 1 : prevIndex - 1
        );
        setActiveArrow("left");
        setTimeout(() => setActiveArrow(null), 300);
    };

    const handleNextPresenter = () => {
        if (!presenters.length) return;
        setCurrentIndex((prevIndex) =>
            prevIndex === presenters.length - 1 ? 0 : prevIndex + 1
        );
        setActiveArrow("right");
        setTimeout(() => setActiveArrow(null), 300);
    };

    const currentPresenter = presenters.length > 0 ? presenters[currentIndex] : null;
    const isMoe = currentPresenter?.name?.toUpperCase().includes('MOE');

    // Helper function to wrap special characters with fallback font class
    const formatTextWithSpecialChars = (text) => {
        if (!text) return '';
        const parts = [];
        let currentPart = '';
        let keyIndex = 0;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '&' || char === '-') {
                if (currentPart) {
                    parts.push(currentPart);
                    currentPart = '';
                }
                parts.push(
                    <span key={`special-${keyIndex++}`} className="ampersand-fallback">
                        {char}
                    </span>
                );
            } else {
                currentPart += char;
            }
        }
        
        if (currentPart) {
            parts.push(currentPart);
        }
        
        return parts.length > 0 ? parts : text;
    };

    return (
        <>
            <Header />

            {/* Hero Section */}
            <section className="events-hero-section">
                <div className="events-hero-container flex-between">
                    <div className="events-hero-left-side flex-column-start">
                        <h1 className="events-hero-title mb-3">Presenters</h1>
                        <p className="events-hero-description">
                            Discover the hosts and DJs who bring music, stories, and energy to <br /> mood.fm every day.
                        </p>

                        <div className="about-hero-divider"></div>

                        <div className="events-points mb-3 flex-column-start gap-3">
                            <div className="event-point flex-start gap-2">
                                <Icon icon="material-symbols:check-rounded" width="20" height="20" className='check-icon-presenters' />
                                <span className="event-point-text">Daily live shows & curated playlists</span>
                            </div>
                            <div className="event-point d-flex justify-content-start align-items-start gap-2">
                                <Icon icon="material-symbols:check-rounded" width="20" height="20" className='check-icon-presenters' />
                                <span className="event-point-text">Local & international hosts</span>
                            </div>
                            <div className="event-point d-flex justify-content-start align-items-start gap-2">
                                <Icon icon="material-symbols:check-rounded" width="20" height="20" className='check-icon-presenters' />
                                <span className="event-point-text">Mood-based programs for every vibe</span>
                            </div>
                        </div>
                    </div>
                    <div className="presenters-hero-right-side">
                        <img src={presentersHeroImg} alt="Presenters" className="presenters-hero-img" />
                    </div>
                </div>
            </section>

            {/* Presenters Section */}
            <section className="presenters-section section-padding-left">
                <div className="presenters-container flex-between">
                    {/* Left Side - Content */}
                    <div className="left-side flex-column-start">
                        <h2 className="presenters-title">MEET OUR PRESENTERS</h2>
                        <p className="presenters-description">
                            Get to know the hosts who bring music,<br />
                            stories, <span className="ampersand-fallback">&</span> energy on air.
                        </p>
                        {currentPresenter && (
                            <div
                                className="presenters-dynamic-wrapper"
                                key={currentPresenter._id}
                            >
                                <h3 
                                    className="presenter-name"
                                    style={{
                                        color: isMoe ? 'var(--color-yellow)' : 'var(--color-cyan)'
                                    }}
                                >
                                    {formatTextWithSpecialChars(currentPresenter.name)}
                                </h3>
                                <p 
                                    className="presenter-description"
                                    style={{
                                        color: isMoe ? 'var(--color-yellow)' : 'var(--color-cyan)'
                                    }}
                                >
                                    {formatTextWithSpecialChars(currentPresenter.description)}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Carousel */}
                    <div className="right-side presenters-carousel">
                        {presenters.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    className={`presenters-arrow presenters-arrow-left ${activeArrow === "left" ? "presenters-arrow-active" : ""}`}
                                    onClick={handlePrevPresenter}
                                >
                                    <Icon icon="material-symbols:play-circle" width="40" height="40" style={{ transform: 'rotate(180deg)' }} />
                                </button>

                                <div className="presenter-card-wrapper" key={currentPresenter?._id}>
                                    {currentPresenter?.image?.url && (
                                        <img 
                                            src={currentPresenter.image.url} 
                                            alt={currentPresenter.name} 
                                            className="presenter-img" 
                                        />
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className={`presenters-arrow presenters-arrow-right ${activeArrow === "right" ? "presenters-arrow-active" : ""}`}
                                    onClick={handleNextPresenter}
                                >
                                    <Icon icon="material-symbols:play-circle" width="40" height="40" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}

export default Presenters