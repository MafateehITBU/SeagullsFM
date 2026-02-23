import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosConfig";
import { Icon } from "@iconify/react";
import { useStaticInfo } from "../context/StaticInfoContext";
import { useLiveStream } from "../context/LiveStreamContext";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import hero1 from "../assets/imgs/Home/hero1.png";
import circle from "../assets/imgs/Home/circle.png";
import stream from "../assets/imgs/Home/stream.png";
import apple from "../assets/imgs/Home/apple.png";
import android from "../assets/imgs/Home/android.png";
import app from "../assets/imgs/Home/mobile.png";
import eventsImg from "../assets/imgs/Home/events.png";
import NewsCard from "../components/UI/NewsCard";
import NoData from "../components/UI/NoData";

const Home = () => {
    const { staticInfo } = useStaticInfo();
    const [programs, setPrograms] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [activeArrow, setActiveArrow] = useState(null); // 'left' | 'right' | null
    const [newsCurrentIndex, setNewsCurrentIndex] = useState(0);
    const [activeNewsArrow, setActiveNewsArrow] = useState(null);
    const { isPlaying, togglePlay } = useLiveStream();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPrograms();
        fetchNews();
    }, []);

    const fetchPrograms = async () => {
        try {
            const response = await axiosInstance.get("/program");
            const filteredPrograms = response.data.data.filter(
                (program) => program.channelId.name === "MoodFM"
            );
            setPrograms(filteredPrograms);
            setCurrentIndex(0);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching programs:", error);
        }
    };

    const fetchNews = async () => {
        try {
            const response = await axiosInstance.get("/news");
            const filteredNews = response.data.data.filter(
                (news) => news.channelId.name === "MoodFM"
            );
            setNews(filteredNews);
            setCurrentIndex(0);
            setLoading(false);
        }
        catch (error) {
            console.error("Error fetching news:", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handlePrevProgram = () => {
        if (!programs.length) return;
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? programs.length - 1 : prevIndex - 1
        );
        setActiveArrow("left");
    };

    const handleNextProgram = () => {
        if (!programs.length) return;
        setCurrentIndex((prevIndex) =>
            prevIndex === programs.length - 1 ? 0 : prevIndex + 1
        );
        setActiveArrow("right");
    };

    const handleDotClick = (index) => {
        setCurrentIndex(index);
    };

    // Auto-advance carousel every 20 seconds
    useEffect(() => {
        if (programs.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === programs.length - 1 ? 0 : prevIndex + 1
            );
            setActiveArrow("right");
        }, 20000); // 20 seconds

        return () => clearInterval(interval);
    }, [programs.length]);

    const currentProgram =
        programs.length > 0 ? programs[currentIndex] : null;

    const [slidesToShow, setSlidesToShow] = useState(3);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setSlidesToShow(1);
            } else if (window.innerWidth <= 1024) {
                setSlidesToShow(2);
            } else {
                setSlidesToShow(3);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePrevNews = () => {
        if (!news.length) return;
        if (news.length === slidesToShow) {
            // Allow cycling when news.length equals slidesToShow
            setNewsCurrentIndex((prevIndex) =>
                prevIndex === 0 ? news.length - 1 : prevIndex - 1
            );
        } else {
            const maxIndex = Math.max(0, news.length - slidesToShow);
            setNewsCurrentIndex((prevIndex) =>
                prevIndex === 0 ? maxIndex : Math.max(0, prevIndex - 1)
            );
        }
        setActiveNewsArrow("left");
        setTimeout(() => setActiveNewsArrow(null), 300);
    };

    const handleNextNews = () => {
        if (!news.length) return;
        if (news.length === slidesToShow) {
            // Allow cycling when news.length equals slidesToShow
            setNewsCurrentIndex((prevIndex) =>
                prevIndex === news.length - 1 ? 0 : prevIndex + 1
            );
        } else {
            const maxIndex = Math.max(0, news.length - slidesToShow);
            setNewsCurrentIndex((prevIndex) =>
                prevIndex >= maxIndex ? 0 : Math.min(maxIndex, prevIndex + 1)
            );
        }
        setActiveNewsArrow("right");
        setTimeout(() => setActiveNewsArrow(null), 300);
    };

    // Auto-advance news carousel every 20 seconds
    useEffect(() => {
        if (!news.length) return;

        const interval = setInterval(() => {
            setNewsCurrentIndex((prevIndex) => {
                if (news.length === slidesToShow) {
                    // Cycle when news.length equals slidesToShow
                    return prevIndex === news.length - 1 ? 0 : prevIndex + 1;
                } else {
                    const maxIndex = Math.max(0, news.length - slidesToShow);
                    return prevIndex >= maxIndex ? 0 : Math.min(maxIndex, prevIndex + 1);
                }
            });
        }, 20000); // 20 seconds

        return () => clearInterval(interval);
    }, [news.length, slidesToShow]);

    // Calculate visible news with wrapping support when news.length === slidesToShow
    const getVisibleNews = () => {
        if (news.length === slidesToShow) {
            // When length equals slidesToShow, create a wrapped array for cycling
            const wrapped = [];
            for (let i = 0; i < slidesToShow; i++) {
                const index = (newsCurrentIndex + i) % news.length;
                wrapped.push(news[index]);
            }
            return wrapped;
        }
        return news.slice(newsCurrentIndex, newsCurrentIndex + slidesToShow);
    };

    const visibleNews = getVisibleNews();

    return (
        <>
            <Header />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="flex-between">
                        <div className="live-stream-container">
                            <h1 className="mb-4">WHERE MUSIC <br />
                                LIVES FOREVER</h1>

                            {/* Listen Live Button */}
                            <button
                                className="listen-live-button flex-between mb-4"
                                onClick={togglePlay}
                            >
                                <div className="listen">
                                    {isPlaying ? 'Pause' : 'Listen'}
                                </div>
                                <div className="live">
                                    Live
                                </div>
                                <img src={circle} alt="Circle" className="circle-top-right" />
                            </button>

                            <img src={stream} alt="Stream" className="stream-img" />

                        </div>
                        <div className="hero-img-container">
                            <img src={hero1} alt="Hero" />
                        </div>
                    </div>
                </div>
            </section>


            {/* Programs Section */}
            <section className="programs-section container ">
                {/* Desktop Layout */}
                <div className="programs-container programs-desktop flex-between">
                    {/* Left Side */}
                    <div className="left-side flex-column-start">
                        <h1 className="programs-title">Our Latest Programs</h1>
                        <p className="programs-description">
                            Fresh programs, timeless music
                            and the vibes you love
                        </p>
                        {currentProgram ? (
                            <div
                                className="programs-dynamic-wrapper"
                                key={currentProgram._id}
                            >
                                <p className="programs-description-small">
                                    {currentProgram.title.includes("Moe")
                                        ? (
                                            <>
                                                Start your morning with good music, fresh <br />
                                                energy and great vibes
                                            </>
                                        )
                                        : (
                                            <>
                                                Your daily throwback to the golden era of music, <br />
                                                stories and vibes
                                            </>
                                        )}
                                </p>
                                <button
                                    className="programs-btn"
                                    style={{
                                        backgroundColor:
                                            currentProgram.title.includes("Moe")
                                                ? "var(--color-red)"
                                                : "var(--color-cyan)",
                                    }}
                                    onClick={() => navigate('/program-details', { state: { programId: currentProgram._id } })}
                                >
                                    View Details
                                </button>
                            </div>
                        ) : !loading && programs.length === 0 && (
                            <NoData message="No programs available" icon="material-symbols:radio-outline" />
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="right-side programs-carousel">
                        {programs.length > 0 ? (
                            <>
                                <button
                                    type="button"
                                    className={`programs-arrow programs-arrow-left ${activeArrow === "left" ? "programs-arrow-active" : ""}`}
                                    onClick={handlePrevProgram}
                                >
                                    <Icon icon="material-symbols:play-circle" width="40" height="40" style={{ transform: 'rotate(180deg)' }} />
                                </button>

                                <div className="program-card-wrapper" key={currentProgram?._id}>
                                    <img src={currentProgram.image.url} alt={currentProgram.title} className="program-img" />
                                </div>

                                <button
                                    type="button"
                                    className={`programs-arrow programs-arrow-right ${activeArrow === "right" ? "programs-arrow-active" : ""}`}
                                    onClick={handleNextProgram}
                                >
                                    <Icon icon="material-symbols:play-circle" width="40" height="40" />
                                </button>
                            </>
                        ) : !loading && (
                            <NoData message="No programs available at the moment" icon="material-symbols:radio-outline" />
                        )}
                    </div>
                </div>

                {/* Mobile Layout - card: image left, data + button right */}
                <div className="programs-container programs-mobile flex-column-center">
                    <h2 className="programs-title">Our Latest Program</h2>
                    <p className="programs-mobile-subtitle">DISCOVER OUR AMAZING RADIO PROGRAMS</p>

                    <div className="programs-mobile-card-row">
                        <div className="programs-mobile-card-image">
                            {programs.length > 0 ? (
                                <div className="program-card-wrapper" key={currentProgram?._id}>
                                    <img src={currentProgram.image.url} alt={currentProgram.title} className="program-img" />
                                </div>
                            ) : !loading && (
                                <NoData message="No programs available at the moment" icon="material-symbols:radio-outline" />
                            )}
                        </div>
                        <div className="programs-mobile-card-content">
                            {currentProgram && (
                                <h4
                                    className="programs-mobile-title"
                                    style={{
                                        color:
                                            currentProgram.title.includes("Moe")
                                                ? "var(--color-red)"
                                                : "var(--color-cyan)",
                                    }}
                                >
                                    {currentProgram.title}
                                </h4>
                            )}
                            {currentProgram ? (
                                <div
                                    className="programs-dynamic-wrapper"
                                    key={currentProgram._id}
                                >
                                    <p className="programs-description-small">
                                        {currentProgram.title.includes("Moe")
                                            ? (
                                                <>
                                                    Start your morning with good music, fresh <br />
                                                    energy and great vibes
                                                </>
                                            )
                                            : (
                                                <>
                                                    Your daily throwback to the golden era of music, <br />
                                                    stories and vibes
                                                </>
                                            )}
                                    </p>
                                    <button
                                        className="programs-btn programs-btn-mobile"
                                        style={{
                                            backgroundColor:
                                                currentProgram.title.includes("Moe")
                                                    ? "var(--color-red)"
                                                    : "var(--color-cyan)",
                                        }}
                                        onClick={() => navigate('/program-details', { state: { programId: currentProgram._id } })}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ) : !loading && programs.length === 0 && (
                                <NoData message="No programs available" icon="material-symbols:radio-outline" />
                            )}
                        </div>
                    </div>

                    {/* Dots Indicator */}
                    {programs.length > 0 && (
                        <div className="programs-dots-container">
                            {programs.map((_, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`programs-dot ${index === currentIndex ? 'programs-dot-active' : ''}`}
                                    onClick={() => handleDotClick(index)}
                                    aria-label={`Go to program ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* App Section */}
            <section className="app-section mt-3 pt-4 pb-4">
                <div className="app-container flex-between">
                    <div className="left-side flex-column-start">
                        <h1 className="app-title">TAKE YOUR MOOD <br />
                            EVERYWHERE</h1>
                        <p className="app-description">
                            Listen to music that matches your <br />
                            vibe, anytime and anywhere
                        </p>
                        <p className="download">
                            Download the App
                        </p>

                        {/* Download Buttons */}
                        <div className="flex-between gap-3">
                            <button className="app-btn d-flex justify-content-center align-items-center gap-3" onClick={() => window.open(staticInfo.appStore, '_blank')}>
                                <img src={apple} alt="Apple" style={{ width: "26px", height: "32px" }} />
                                <div className="flex-column-start">
                                    <span className="app-text-small">
                                        Download on the
                                    </span>
                                    <span className="app-text-big">
                                        App Store
                                    </span>
                                </div>
                            </button>
                            <button className="app-btn d-flex justify-content-center align-items-center gap-3" onClick={() => window.open(staticInfo.googlePlay, '_blank')}>
                                <img src={android} alt="Android" style={{ width: "29px", height: "33px" }} />
                                <div className="flex-column-start">
                                    <span className="app-text-small">
                                        GET IT ON
                                    </span>
                                    <span className="app-text-big">
                                        Google Play
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="right-side">

                        <img src={app} alt="App" className="app-img" />
                    </div>
                </div>
            </section>

            {/* News Section */}
            <section className="news-section mt-3 pt-4 pb-4">
                <div className="news-container flex-column-start">
                    <div className="news-title-container">
                        <h1 className="text-left">NEWS</h1>
                        <p className="news-description text-left">
                            Latest updates, Stories and highlights from the <br /> world of music
                        </p>
                    </div>

                    {/* News Cards Carousel */}
                    <div className="news-carousel-container">
                        {!loading && news.length === 0 ? (
                            <NoData message="No news available at the moment" icon="material-symbols:newspaper-outline" />
                        ) : (
                            <>
                                <div className={`news-cards-wrapper news-cards-count-${visibleNews.length}`}>
                                    {visibleNews.map((newsItem, index) => {
                                        let cardClass = '';
                                        if (visibleNews.length === 1 || visibleNews.length === 2) {
                                            cardClass = 'news-card-active';
                                        } else if (slidesToShow === 3 && visibleNews.length === 3) {
                                            if (index === 0) cardClass = 'news-card-left';
                                            else if (index === 1) cardClass = 'news-card-active';
                                            else if (index === 2) cardClass = 'news-card-right';
                                        } else if (slidesToShow === 2 && visibleNews.length === 2) {
                                            if (index === 0) cardClass = 'news-card-left';
                                            else if (index === 1) cardClass = 'news-card-active';
                                        } else {
                                            cardClass = 'news-card-active';
                                        }
                                        return (
                                            <NewsCard
                                                key={newsItem._id}
                                                news={newsItem}
                                                cardClass={cardClass}
                                            />
                                        );
                                    })}
                                </div>
                                {news.length >= slidesToShow && (
                                    <div className="news-carousel-arrows">
                                        <button
                                            type="button"
                                            className={`news-arrow news-arrow-left ${activeNewsArrow === "left" ? "news-arrow-active" : ""}`}
                                            onClick={handlePrevNews}
                                        >
                                            <Icon icon="ic:round-arrow-back" width="45" height="45" />
                                        </button>
                                        <button
                                            type="button"
                                            className={`news-arrow news-arrow-right ${activeNewsArrow === "right" ? "news-arrow-active" : ""}`}
                                            onClick={handleNextNews}
                                        >
                                            <Icon icon="ic:baseline-arrow-forward" width="45" height="45" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>


            {/* Events Section */}
            <section className="events-section mt-3 pt-4 pb-4">
                <div className="app-container flex-between">
                    <div className="left-side flex-column-start">
                        <h1 className="app-title">ON AIR <span className="ampersand-fallback">&</span> ON GROUND <br />
                            OUR SIGNATARE EVENTS</h1>
                        <p className="app-description">
                            Music. Energy. Real Moments experience mood fm <br />
                            Live from Sets and concertto special pop up <br />
                            events that connect the music with the crowd.
                        </p>

                        {/* This btn takes to the events page */}
                        <Link to="/events" className="events-btn-link">
                            <button className="events-btn flex-row gap-3">
                                <span>Discover More</span>
                                <Icon icon="material-symbols:play-arrow-outline" width="28" />
                            </button>
                        </Link>
                    </div>

                    <div className="right-side">

                        <img src={eventsImg} alt="Events" className="events-img" />
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default Home;