import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Cookie from 'js-cookie';
import { useAuth } from '../../context/AuthContext';
import { useStaticInfo } from '../../context/StaticInfoContext';
import logoDark from '../../assets/imgs/logo-dark.png';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();
  const { staticInfo } = useStaticInfo();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;
  
  // Check if user is logged in
  const isLoggedIn = () => {
    const token = Cookie.get('token');
    return token && user?.id;
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <Navbar expand="lg" className="custom-navbar">
      <Container fluid className="navbar-container-custom">
        {/* Left: Logo, Frequency, and Burger Menu */}
        <div className="navbar-left-section">
          <Navbar.Brand className="navbar-brand-custom">
            <img
              src={logoDark}
              alt="MoodFM Logo"
              className="navbar-logo"
            />
            <img
              src={staticInfo.frequencyimg}
              alt="Frequency"
              className="navbar-frequency"
            />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggle-custom" />
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          {/* Center: Navigation Links */}
          <Nav className="mx-auto navbar-nav-custom">
            <Nav.Link as={Link} to="/" className={`navbar-nav-link ${isActive("/") ? "active-navbar-nav-link" : ""}`}>
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/about" className={`navbar-nav-link ${isActive("/about") ? "active-navbar-nav-link" : ""}`}>
              About Us
            </Nav.Link>
            <Nav.Link as={Link} to="/news" className={`navbar-nav-link ${isActive("/news") ? "active-navbar-nav-link" : ""}`}>
              News
            </Nav.Link>
            <Nav.Link as={Link} to="/events" className={`navbar-nav-link ${isActive("/events") ? "active-navbar-nav-link" : ""}`}>
              Events
            </Nav.Link>
            <Nav.Link as={Link} to="/presenters" className={`navbar-nav-link ${isActive("/presenters") ? "active-navbar-nav-link" : ""}`}>
              Presenters
            </Nav.Link>
            {!isLoggedIn() ? (
              <Nav.Link as={Link} to="/login" className={`navbar-nav-link ${isActive("/login") ? "active-navbar-nav-link" : ""}`} onClick={() => navigate("/login")}>
                Login
              </Nav.Link>
            ) : (
              <div className="position-relative" ref={dropdownRef}>
                <Nav.Link 
                  className="navbar-nav-link"
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ cursor: 'pointer', padding: '0.25rem' }}
                >
                  {user?.image ? (
                    <img 
                      src={user.image} 
                      alt="User Avatar" 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        objectFit: 'cover'
                      }} 
                    />
                  ) : (
                    <Icon icon="mdi:account-circle-outline" style={{ fontSize: '28px', color: 'var(--text-primary)' }} />
                  )}
                </Nav.Link>
                {showDropdown && (
                  <div 
                    className="position-absolute"
                    style={{
                      top: '100%',
                      right: 0,
                      marginTop: '0.5rem',
                      backgroundColor: 'var(--background-color)',
                      border: '1px solid var(--lines-color)',
                      borderRadius: '6px',
                      minWidth: '150px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000
                    }}
                  >
                    <Link
                      to="/profile"
                      className="d-block px-3 py-2 text-decoration-none"
                      style={{ 
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </Link>
                    <div
                      className="px-3 py-2"
                      style={{ 
                        borderTop: '1px solid var(--lines-color)',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      onClick={handleLogout}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            )}
          </Nav>

          {/* Right: Ad With Us Button */}
          <Button className="ms-auto navbar-ad-button" as={Link} to="/ad-with-us">
            Ad With Us
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;

