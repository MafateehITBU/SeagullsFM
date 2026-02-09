import React, { useEffect, useState } from 'react'
import axiosInstance from '../axiosConfig'
import { Icon } from '@iconify/react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import NoData from '../components/UI/NoData'
import eventsHeroImg from "../assets/imgs/Events/events-hero.png";

const Events = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [currentEventIndex, setCurrentEventIndex] = useState(0)
    const [activeArrow, setActiveArrow] = useState(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    useEffect(() => {
        fetchEvents()
    }, [])

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const fetchEvents = async () => {
        try {
            const response = await axiosInstance.get('/event')
            const filteredEvents = response.data.data.filter(
                (event) => event.channelId?.name === "MoodFM"
            )
            setEvents(filteredEvents)
            setLoading(false)
        } catch (error) {
            setError(error)
            setLoading(false)
        }
    }

    const handleReadMoreNews = () => {
        const eventsCardsContainer = document.querySelector('.events-cards-section');
        if (eventsCardsContainer) {
            eventsCardsContainer.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setCurrentImageIndex(0);
    };

    const handleCloseModal = () => {
        setSelectedEvent(null);
        setCurrentImageIndex(0);
    };

    const handlePrevImage = () => {
        if (selectedEvent && selectedEvent.images && selectedEvent.images.length > 0) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? selectedEvent.images.length - 1 : prev - 1
            );
        }
    };

    const handleNextImage = () => {
        if (selectedEvent && selectedEvent.images && selectedEvent.images.length > 0) {
            setCurrentImageIndex((prev) => 
                prev === selectedEvent.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const handlePrevEvent = () => {
        if (events.length === 0) return
        setCurrentEventIndex((prevIndex) =>
            prevIndex === 0 ? events.length - 1 : prevIndex - 1
        )
        setActiveArrow("left")
        setTimeout(() => setActiveArrow(null), 300)
    }

    const handleNextEvent = () => {
        if (events.length === 0) return
        setCurrentEventIndex((prevIndex) =>
            prevIndex === events.length - 1 ? 0 : prevIndex + 1
        )
        setActiveArrow("right")
        setTimeout(() => setActiveArrow(null), 300)
    }

    // Get visible events based on view
    const getVisibleEvents = () => {
        if (isMobile && events.length > 0) {
            return [events[currentEventIndex]]
        }
        return events
    }

    const formatEventDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        return `${month} ${day}`;
    };

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
            <section className="events-hero-section mb-5">
                <div className="events-hero-container flex-between">
                    <div className="events-hero-left-side flex-column-start">
                        <h1 className="events-hero-title mb-3">Events</h1>
                        <p className="events-hero-description">
                            Live music, DJ nights, and unforgettable experiences by Mood <br /> FM.
                        </p>

                        <div className="about-hero-divider"></div>

                        <div className="events-points mb-3 flex-column-start gap-3">
                            <div className="event-point flex-start gap-2">
                                <Icon icon="material-symbols:check-rounded" width="20" height="20" className='check-icon' />
                                <span className="event-point-text">Live concerts & DJ nights</span>
                            </div>
                            <div className="event-point d-flex justify-content-start align-items-start gap-2">
                                <Icon icon="material-symbols:check-rounded" width="20" height="20" className='check-icon' />
                                <span className="event-point-text">Local and international artists</span>
                            </div>
                            <div className="event-point d-flex justify-content-start align-items-start gap-2">
                                <Icon icon="material-symbols:check-rounded" width="20" height="20" className='check-icon' />
                                <span className="event-point-text">Weekly & special events</span>
                            </div>
                        </div>

                        <button className="events-hero-btn" onClick={handleReadMoreNews}>
                            View Upcoming Events
                        </button>
                    </div>
                    <div className="news-hero-right-side">
                        <img src={eventsHeroImg} alt="Events Hero" />
                    </div>
                </div>
            </section>


            {/* Events Cards Section */}
            <section className="events-cards-section">
                <div className="events-cards-container container flex-column-center">
                    <h3 className="events-cards-title mb-3">Upcoming Events</h3>
                    <p className="events-cards-description text-center">
                        Discover live concerts, DJ nights, and curated events powered by  mood.fm.
                    </p>
                    <div className="events-cards-wrapper">
                        {loading ? (
                            <div className="d-flex align-items-center justify-content-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <NoData message="Error loading events. Please try again later." icon="material-symbols:error-outline" />
                        ) : events.length === 0 ? (
                            <NoData message="No upcoming events at the moment" icon="material-symbols:event-outline" />
                        ) : (
                            <>
                                <div className="events-cards-grid">
                                    {getVisibleEvents().map((event) => (
                                        <div 
                                            key={event._id} 
                                            className="event-card"
                                            onClick={() => handleEventClick(event)}
                                        >
                                            <div className="event-card-image-wrapper">
                                                <img 
                                                    src={event?.coverImage?.url || '/placeholder.jpg'} 
                                                    alt={event?.title}
                                                    className="event-card-image"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Arrow Navigation - Mobile */}
                                {isMobile && events.length > 1 && (
                                    <div className="events-pagination-arrows mt-3">
                                        <button
                                            type="button"
                                            className={`events-pagination-arrow events-pagination-arrow-left ${activeArrow === "left" ? "events-pagination-arrow-active" : ""}`}
                                            onClick={handlePrevEvent}
                                        >
                                            <Icon icon="ic:round-arrow-back" width="30" height="30" />
                                        </button>
                                        <button
                                            type="button"
                                            className={`events-pagination-arrow events-pagination-arrow-right ${activeArrow === "right" ? "events-pagination-arrow-active" : ""}`}
                                            onClick={handleNextEvent}
                                        >
                                            <Icon icon="ic:baseline-arrow-forward" width="30" height="30" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="event-modal-overlay" onClick={handleCloseModal}>
                    <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="event-modal-close" onClick={handleCloseModal}>
                            <Icon icon="material-symbols:close" />
                        </button>

                        {/* Images Carousel */}
                        {selectedEvent.images && selectedEvent.images.length > 0 ? (
                            <div className="event-modal-carousel">
                                <img 
                                    src={selectedEvent.images[currentImageIndex]?.url} 
                                    alt={`Event image ${currentImageIndex + 1}`}
                                    className="event-modal-carousel-image"
                                />
                                {selectedEvent.images.length > 1 && (
                                    <>
                                        <button 
                                            className="event-modal-carousel-prev"
                                            onClick={handlePrevImage}
                                        >
                                            <Icon icon="material-symbols:chevron-left" />
                                        </button>
                                        <button 
                                            className="event-modal-carousel-next"
                                            onClick={handleNextImage}
                                        >
                                            <Icon icon="material-symbols:chevron-right" />
                                        </button>
                                        <div className="event-modal-carousel-indicators">
                                            {selectedEvent.images.map((_, index) => (
                                                <span
                                                    key={index}
                                                    className={`event-modal-indicator ${index === currentImageIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            selectedEvent.coverImage && (
                                <div className="event-modal-carousel">
                                    <img 
                                        src={selectedEvent.coverImage.url} 
                                        alt={selectedEvent.title}
                                        className="event-modal-carousel-image"
                                    />
                                </div>
                            )
                        )}

                        {/* Event Details */}
                        <div className="event-modal-details">
                            <h2 className="event-modal-title">{formatTextWithSpecialChars(selectedEvent.title)}</h2>
                            <p className="event-modal-description">{formatTextWithSpecialChars(selectedEvent.description)}</p>
                            
                            <div className="event-modal-info">
                                <div className="event-modal-info-item">
                                    <Icon icon="material-symbols:location-on-outline" className="event-modal-icon" />
                                    <span>{formatTextWithSpecialChars(selectedEvent.address)}</span>
                                </div>
                                <div className="event-modal-info-item">
                                    <Icon icon="material-symbols:schedule-outline" className="event-modal-icon" />
                                    <span>
                                        {formatTextWithSpecialChars(formatEventDate(selectedEvent.startDate))} <span className="ampersand-fallback">-</span> {formatTextWithSpecialChars(formatEventDate(selectedEvent.endDate))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    )
};

export default Events;