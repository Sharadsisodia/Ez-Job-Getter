// =============================
// src/components/Navbar.js
// =============================
import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './NavBar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoggedIn } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [notifCount] = useState(2);

  const mobileRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 6);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  const toggleProfile = () => setProfileOpen(v => !v);

  const username = user?.name || user?.username || 'User';

  return (
    <header className={`nav ${isScrolled ? 'nav--scrolled' : ''}`} role="navigation">
      <div className="nav__inner">
        <div className="nav__left">
          <div className="logo" onClick={() => navigate('/')} role="button" tabIndex={0}>
            <span className="logo__mark">AI</span>
            <span className="logo__text">Job Match</span>
          </div>
        </div>

        <nav ref={mobileRef} className="nav__links">
          <form className="nav__search" onSubmit={handleSearch} role="search">
            <input
              type="search"
              placeholder="Search jobs, skills, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search"
            />
          </form>

          <NavLink to="/" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>Home</NavLink>

          {!isLoggedIn && (
            <>
              <NavLink to="/signup" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>Signup</NavLink>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>Login</NavLink>
            </>
          )}

          {isLoggedIn && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>Dashboard</NavLink>
              <NavLink to="/resume" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>Resume</NavLink>
              <NavLink to="/jobs" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>Jobs</NavLink>

              <button className="nav__icon" title="Notifications" aria-label="Notifications" type="button">
                <svg className="nav__icon-svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zM18 16v-5c0-3.1-1.64-5.64-4.5-6.32V4a1.5 1.5 0 10-3 0v.68C7.64 5.36 6 7.9 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/>
                </svg>
                {notifCount > 0 && <span className="nav__badge" aria-hidden="true">{notifCount}</span>}
              </button>

              <div className="nav__profile" ref={profileRef}>
                {/* Avatar button: image if available, otherwise initials */}
                <button
                  type="button"
                  className={`avatar ${user?.avatar ? 'avatar--img' : 'avatar--initials'}`}
                  onClick={toggleProfile}
                  aria-expanded={profileOpen}
                  aria-controls="profile-menu"
                  aria-label={`Open profile menu for ${username}`}
                >
                  {/* gradient ring — implemented by CSS + inner element */}
                  <span className="avatar__ring" aria-hidden="true" />

                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${username} avatar`}
                      className="avatar__img"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="avatar__initials">
                      {(() => {
                        // initials compute (up to 2 letters)
                        const name = (user?.name || user?.username || 'User').trim();
                        const parts = name.split(/\s+/);
                        return (parts.length === 1 ? parts[0].slice(0,2) : (parts[0][0] + parts[1][0])).toUpperCase();
                      })()}
                    </span>
                  )}

                  {/* online status (adjust color / class per actual user.status) */}
                  <span className={`avatar__status ${user?.status === 'online' ? 'is-online' : 'is-offline'}`} aria-hidden="true" />
                </button>

                <div id="profile-menu" className={`profile__menu ${profileOpen ? 'open' : ''}`} role="menu">
                  <NavLink to="/profile" onClick={() => setProfileOpen(false)} className="profile__link">Profile</NavLink>
                  <NavLink to="/settings" onClick={() => setProfileOpen(false)} className="profile__link">Settings</NavLink>
                  <button type="button" onClick={handleLogout} className="profile__link profile__link--danger" role="menuitem">Logout</button>
                </div>
              </div>
            </>
          )}
        </nav>

        {/* Removed nav__hamburger and kept nav__right to allow future placement */}
        <div className="nav__right" />
      </div>
    </header>
  );
}

export default Navbar;