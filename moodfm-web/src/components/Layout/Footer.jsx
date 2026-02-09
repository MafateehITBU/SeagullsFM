import React from 'react';
import { Icon } from '@iconify/react';
import { useStaticInfo } from '../../context/StaticInfoContext';
import { Link } from 'react-router-dom';

const Footer = () => {
    const { staticInfo, loading } = useStaticInfo();

    if (loading || !staticInfo) {
        return null;
    }

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-main-content flex-between">
                    {/* Left Section - Brand Identity and Social Media */}
                    <div className="footer-left-section">
                        <div className="footer-frequency-logo">
                            {staticInfo?.frequencyimg && (
                                <img src={staticInfo?.frequencyimg} alt="Frequency" className="frequency-img" />
                            )}
                        </div>
                        <p className="footer-description">
                            MOOD.FM IS WHERE MUSIC MEETS EMOTION, BRINGING YOU THE PERFECT SOUNDTRACK FOR EVERY MOMENT AND EVERY MOOD.
                        </p>
                        {staticInfo?.socialMediaLinks && (
                            <div className="social-media-links">
                                {staticInfo?.socialMediaLinks?.facebook && (
                                    <a href={staticInfo?.socialMediaLinks?.facebook} target="_blank" rel="noopener noreferrer">
                                        <Icon icon="entypo-social:facebook" width="24" height="24" />
                                    </a>
                                )}
                                {staticInfo?.socialMediaLinks?.instagram && (
                                    <a href={staticInfo?.socialMediaLinks?.instagram} target="_blank" rel="noopener noreferrer">
                                        <Icon icon="fa6-brands:square-instagram" width="24" height="24" />
                                    </a>
                                )}
                                {staticInfo?.socialMediaLinks?.twitter && (
                                    <a href={staticInfo?.socialMediaLinks?.twitter} target="_blank" rel="noopener noreferrer">
                                        <Icon icon="fa6-brands:square-twitter" width="24" height="24" />
                                    </a>
                                )}
                                {staticInfo?.socialMediaLinks?.linkedin && (
                                    <a href={staticInfo?.socialMediaLinks?.linkedin} target="_blank" rel="noopener noreferrer">
                                        <Icon icon="fa6-brands:linkedin" width="24" height="24" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="footer-right-section-container">
                        <div className="footer-right-section">
                            <div className="footer-subsection">
                                <h4 className="footer-title">Links</h4>
                                <Link to="/" className="footer-link">
                                    HOME
                                    <Icon icon="material-symbols:music-note-rounded" className="footer-link-icon" />
                                </Link>
                                <Link to="/about" className="footer-link">
                                    ABOUT US
                                    <Icon icon="material-symbols:music-note-rounded" className="footer-link-icon" />
                                </Link>
                                <Link to="/news" className="footer-link">
                                    NEWS
                                    <Icon icon="material-symbols:music-note-rounded" className="footer-link-icon" />
                                </Link>
                                <Link to="/events" className="footer-link">
                                    EVENTS
                                    <Icon icon="material-symbols:music-note-rounded" className="footer-link-icon" />
                                </Link>
                                <Link to="/presenters" className="footer-link">
                                    PRESENTERS
                                    <Icon icon="material-symbols:music-note-rounded" className="footer-link-icon" />
                                </Link>
                            </div>
                            <div className="footer-subsection">
                                <h4 className="footer-title">Get Involved</h4>
                                <Link to="/get-discovered" className="footer-link">GET DISCOVERED
                                    <Icon icon="material-symbols:music-note-rounded" className="footer-link-icon" />
                                </Link>
                                <Link to="/show-your-talent" className="footer-link">SHOW YOUR TALENT
                                    <Icon icon="material-symbols:music-note-rounded" className="footer-link-icon" />
                                </Link>
                            </div>
                            <div className="footer-subsection">
                                <h4 className="footer-title">Get In Touch</h4>
                                {staticInfo?.phoneNumber && (
                                    <p className="footer-contact">{staticInfo?.phoneNumber}</p>
                                )}
                                {staticInfo?.email && (
                                    <p className="footer-contact">{staticInfo?.email.toUpperCase()}</p>
                                )}
                                {staticInfo?.address && (
                                    <p className="footer-contact">{staticInfo?.address.toUpperCase()}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="footer-bottom">
                    <div className="footer-divider"></div>
                    <p className="footer-copyright">
                        Mood FM © All Rights Reserved | Project by : <a href="https://www.mafateehgroup.com/" target="_blank" rel="noopener noreferrer" className="footer-mafateeh">Mafateeh Group</a>
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;