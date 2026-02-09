import React, { useEffect, useState } from 'react'
import axiosInstance from '../axiosConfig'
import { Icon } from '@iconify/react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import card1 from "../assets/imgs/Events/card1.png";
import card2 from "../assets/imgs/Events/card2.png";
import card3 from "../assets/imgs/Events/card3.png";
import card4 from "../assets/imgs/Events/card4.png";

import eventsHeroImg from "../assets/imgs/Events/events-hero.png";

const Events = () => {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchEvents()
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

    const formatDate = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0')
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = monthNames[date.getMonth()]
        const year = date.getFullYear()
        return `${day} ${month}, ${year}`
    }

    // Array of card images to cycle through
    const cardImages = [card1, card2, card3, card4]
    
    const getCardImage = (index) => {
        return cardImages[index % cardImages.length]
    }

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
                        Discover live concerts, DJ nights, and curated events powered by <br/> mood.fm.
                    </p>
                    <div className="events-cards-wrapper">
                        {loading ? (
                            <div className="d-flex align-items-center justify-content-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center">
                                <p>Error loading events. Please try again later.</p>
                            </div>
                        ) : events.length === 0 ? (
                            <div className="text-center">
                                <p>No upcoming events at the moment.</p>
                            </div>
                        ) : (
                            <div className="events-cards-grid">
                                {events.map((event, index) => (
                                    <div key={event._id} className="event-card">
                                        <div className="event-card-image-wrapper">
                                            <img 
                                                src={getCardImage(index)} 
                                                alt={event.title}
                                                className="event-card-image"
                                            />
                                        </div>
                                        <div className="event-card-content">
                                            <div className="event-card-top">
                                                <h4 className="event-card-title">{event.title}</h4>
                                                <p className="event-card-description">{event.description}</p>
                                            </div>
                                            <div className="event-card-bottom">
                                                <p className="event-card-dates">
                                                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                                                </p>
                                                <p className="event-card-address">
                                                    <Icon icon="material-symbols:location-on-outline" />
                                                    {event.address}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
};

export default Events;