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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navbarToggleRef = useRef(null);
  const navbarCollapseRef = useRef(null);

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

  // Close mobile menu
  const handleCloseMenu = () => {
    // Trigger the navbar toggle to close the menu
    if (navbarToggleRef.current) {
      navbarToggleRef.current.click();
    }
    setIsMenuOpen(false);
  };

  // Watch for menu open/close state
  useEffect(() => {
    const handleMenuToggle = () => {
      if (navbarCollapseRef.current) {
        const isOpen = navbarCollapseRef.current.classList.contains('show');
        setIsMenuOpen(isOpen);
      }
    };

    // Check initial state
    handleMenuToggle();

    // Watch for changes using MutationObserver
    if (navbarCollapseRef.current) {
      const observer = new MutationObserver(handleMenuToggle);
      observer.observe(navbarCollapseRef.current, {
        attributes: true,
        attributeFilter: ['class']
      });

      // Also listen for Bootstrap's shown/hidden events
      const collapseElement = navbarCollapseRef.current;
      collapseElement.addEventListener('shown.bs.collapse', () => setIsMenuOpen(true));
      collapseElement.addEventListener('hidden.bs.collapse', () => setIsMenuOpen(false));

      return () => {
        observer.disconnect();
        collapseElement.removeEventListener('shown.bs.collapse', () => setIsMenuOpen(true));
        collapseElement.removeEventListener('hidden.bs.collapse', () => setIsMenuOpen(false));
      };
    }
  }, []);

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
      {/* Backdrop overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="navbar-backdrop-mobile"
          onClick={handleCloseMenu}
        />
      )}
      
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
              src={staticInfo?.frequencyimg}
              alt="Frequency"
              className="navbar-frequency"
            />
          </Navbar.Brand>
          <Navbar.Toggle 
            ref={navbarToggleRef}
            aria-controls="basic-navbar-nav" 
            className="navbar-toggle-custom" 
          />
        </div>

        <Navbar.Collapse 
          ref={navbarCollapseRef}
          id="basic-navbar-nav" 
          className="navbar-collapse-mobile"
        >
          {/* Close Button - Mobile Only */}
          <button 
            className="navbar-close-btn-mobile"
            onClick={handleCloseMenu}
            aria-label="Close menu"
          >
            <Icon icon="mdi:close" width="28" height="28" />
          </button>

          {/* Center: Navigation Links */}
          <Nav className="mx-auto navbar-nav-custom navbar-nav-mobile">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`navbar-nav-link ${isActive("/") ? "active-navbar-nav-link" : ""}`}
              onClick={handleCloseMenu}
            >
              Home
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/about" 
              className={`navbar-nav-link ${isActive("/about") ? "active-navbar-nav-link" : ""}`}
              onClick={handleCloseMenu}
            >
              About Us
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/news" 
              className={`navbar-nav-link ${isActive("/news") ? "active-navbar-nav-link" : ""}`}
              onClick={handleCloseMenu}
            >
              News
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/events" 
              className={`navbar-nav-link ${isActive("/events") ? "active-navbar-nav-link" : ""}`}
              onClick={handleCloseMenu}
            >
              Events
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/presenters" 
              className={`navbar-nav-link ${isActive("/presenters") ? "active-navbar-nav-link" : ""}`}
              onClick={handleCloseMenu}
            >
              Presenters
            </Nav.Link>
            {!isLoggedIn() ? (
              <Nav.Link 
                as={Link} 
                to="/login" 
                className={`navbar-nav-link ${isActive("/login") ? "active-navbar-nav-link" : ""}`} 
                onClick={() => {
                  navigate("/login");
                  handleCloseMenu();
                }}
              >
                Login
              </Nav.Link>
            ) : (
              <div className="position-relative navbar-user-menu navbar-user-menu-mobile" ref={dropdownRef}>
                <Nav.Link 
                  className="navbar-nav-link navbar-user-link navbar-user-link-mobile"
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
                    <Icon icon="mdi:account-circle-outline" style={{ fontSize: '28px', color: 'var(--navbar-text)' }} />
                  )}
                </Nav.Link>
                {showDropdown && (
                  <div className="navbar-dropdown navbar-dropdown-mobile">
                    <Link
                      to="/profile"
                      className="navbar-dropdown-item navbar-dropdown-item-mobile"
                      onClick={() => {
                        setShowDropdown(false);
                        handleCloseMenu();
                      }}
                    >
                      Profile
                    </Link>
                    <div
                      className="navbar-dropdown-item navbar-dropdown-item-mobile navbar-dropdown-item-divider"
                      onClick={() => {
                        handleLogout();
                        handleCloseMenu();
                      }}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            )}
          </Nav>

          {/* Right: Ad With Us Button */}
          <Button 
            className="ms-auto navbar-ad-button" 
            as={Link} 
            to="/ad-with-us"
            onClick={handleCloseMenu}
          >
            Ad With Us
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;

