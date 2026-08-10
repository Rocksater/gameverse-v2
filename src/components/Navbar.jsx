import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoGameControllerOutline, IoMenu, IoClose } from 'react-icons/io5';
import { FaCompass, FaFire, FaGamepad, FaUser, FaGear, FaRightFromBracket, FaTableCells } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="gv-navbar">
      <div className="gv-navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="gv-nav-brand" onClick={closeMobileMenu}>
          <IoGameControllerOutline className="gv-brand-icon" />
          <span className="gv-brand-text">GAMEVERSE</span>
          <span className="gv-brand-badge">v2</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="gv-desktop-nav">
          <ul className="gv-nav-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `gv-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <FaGamepad /> Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/explore"
                className={({ isActive }) =>
                  `gv-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <FaCompass /> Explore
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/trending"
                className={({ isActive }) =>
                  `gv-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <FaFire /> Trending
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Desktop Actions */}
        <div className="gv-nav-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="gv-nav-link">
                <FaTableCells /> Dashboard
              </Link>
              <Link to="/profile" className="gv-nav-link">
                <FaUser /> Profile
              </Link>
              <Link to="/settings" className="gv-nav-link">
                <FaGear /> Settings
              </Link>
              <button onClick={signOut} className="gv-btn-login">
                <FaRightFromBracket /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="gv-btn-login">
                Sign In
              </Link>
              <Link to="/register" className="gv-btn-register">
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="gv-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <IoClose /> : <IoMenu />}
        </button>
      </div>

      {/* Mobile Animated Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="gv-mobile-menu"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
          >
            <NavLink
              to="/"
              className={({ isActive }) =>
                `gv-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMobileMenu}
            >
              <FaGamepad /> Home
            </NavLink>
            <NavLink
              to="/explore"
              className={({ isActive }) =>
                `gv-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMobileMenu}
            >
              <FaCompass /> Explore
            </NavLink>
            <NavLink
              to="/trending"
              className={({ isActive }) =>
                `gv-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeMobileMenu}
            >
              <FaFire /> Trending
            </NavLink>

            <div className="gv-mobile-actions">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="gv-nav-link"
                    onClick={closeMobileMenu}
                  >
                    <FaTableCells /> Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="gv-nav-link"
                    onClick={closeMobileMenu}
                  >
                    <FaUser /> Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="gv-nav-link"
                    onClick={closeMobileMenu}
                  >
                    <FaGear /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      closeMobileMenu();
                    }}
                    className="gv-btn-login"
                  >
                    <FaRightFromBracket /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="gv-btn-login"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="gv-btn-register"
                    onClick={closeMobileMenu}
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;