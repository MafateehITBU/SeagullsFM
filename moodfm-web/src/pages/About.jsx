import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { useStaticInfo } from '../context/StaticInfoContext';
import RichTextContent from '../components/RichTextContent';
import { Icon } from '@iconify/react';
import aboutImg from '../assets/imgs/About/hero-img.png';
import about2 from '../assets/imgs/About/about2.png';


// CountUp component for animating numbers
const CountUp = ({ end, suffix = '', duration = 3500, useKFormat = false }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const countRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated) {
                        setHasAnimated(true);
                        animateCount();
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (countRef.current) {
            observer.observe(countRef.current);
        }

        return () => {
            if (countRef.current) {
                observer.unobserve(countRef.current);
            }
        };
    }, [hasAnimated]);
// test
    const animateCount = () => {
        const startTime = Date.now();
        const startValue = 0;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smoother easing function (easeOutCubic) for more gradual animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(startValue + (end - startValue) * easeOutCubic);

            setCount(currentValue);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };

        requestAnimationFrame(animate);
    };

    // Format number with K suffix if needed
    const formatNumber = (num) => {
        if (useKFormat && num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    };

    return (
        <h2 className="about-hero-number" ref={countRef}>
            {formatNumber(count)}{suffix}
        </h2>
    );
};

const formatTextWithSpecialChars = (text) => {
    if (!text) return '';
    const parts = [];
    let currentPart = '';
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '&' || char === '-' || char === "'" || char === '’' || char === '‘' || char === '”' || char === '“' || char === '4') {
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

const About = () => {
    const { staticInfo } = useStaticInfo();
    return (
        <>
            <Header />
            {/* Hero Section */}
            <section className="about-hero-section ">
                <div className="about-hero-container">
                    <div className="flex-between">

                        {/* Left Side */}
                        <div className="about-hero-left-side flex-column-start">
                            <h1 className="about-hero-title mb-3">About Us</h1>
                            <p className="about-hero-description">
                                Mood fm is Jordans leading adult
                                contemporary radio station, delivering
                                timeless music and unforgettable
                                listening experiences
                            </p>

                            <div className="flex-between about-numbers">
                                <div className="flex-column-center">
                                    <CountUp end={20} suffix="+" />
                                    <p className="about-hero-number-description">years of music <br /> and culture</p>
                                </div>

                                <div className="d-flex flex-column justify-content-center align-items-center">
                                    <CountUp end={250} suffix="k+" />
                                    <p className="about-hero-number-description">Monthly <br /> listeners</p>
                                </div>

                                <div className="d-flex flex-column justify-content-center align-items-center">
                                    <CountUp end={100} suffix="+" />
                                    <p className="about-hero-number-description">Shows and DJs</p>
                                </div>
                            </div>

                        </div>

                        {/* Right Side */}
                        <div className="about-hero-img-container">
                            <img src={aboutImg} alt="Hero" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Who we Are Section */}
            <section className="who-we-are-section flex-column-start">
                <h1 className="who-we-are-title mb-3">Who we Are</h1>

                <RichTextContent
                    html={staticInfo.aboutUs}
                    className="who-we-are-description"
                    as="div"
                />

                {/* Mood Profile – opens PDF in new tab for viewing */}
                <a
                    href={`${process.env.PUBLIC_URL || ''}/MediaKit.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="events-btn-link about-media-kit-btn-link"
                >
                    <button type="button" className="events-btn about-media-kit-btn">
                        <span>View Mood Profile</span>
                    </button>
                </a>

            </section>

            <section className="about2-image-section d-flex justify-content-end align-items-center">
                <img src={about2} alt="About2" />
            </section>

            <Footer />
        </>
    );
};

// test
export default About;