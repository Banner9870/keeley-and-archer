import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import StarIcon from '../shared/StarIcon';
import fallbackTabular from '../../data/neighborhoods-fallback.json';
import styles from './Header.module.css';

// Build a sorted neighborhood list from the bundled static JSON.
// Available immediately — no API call, no loading state.
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

const NEIGHBORHOOD_NAV_LIST = fallbackTabular
  .map(row => ({
    name: toTitleCase(row.community),
    slug: row.community.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function Header() {
  const { state } = useAppContext();
  const { currentUser } = state;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [neighDropdownOpen, setNeighDropdownOpen] = useState(false);

  const accountDropdownRef = useRef(null);
  const neighDropdownRef = useRef(null);

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close neighborhoods dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (neighDropdownRef.current && !neighDropdownRef.current.contains(e.target)) {
        setNeighDropdownOpen(false);
      }
    }
    if (neighDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [neighDropdownOpen]);

  // Escape dismisses both dropdowns
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setNeighDropdownOpen(false);
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinkClass = ({ isActive }) =>
    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>

        {/* Wordmark */}
        <Link to="/feed" className={styles.wordmark} aria-label="chicago.com home">
          <StarIcon size={18} color="var(--red)" className={styles.wordmarkStar} />
          chicago.com
        </Link>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Primary navigation">
          <NavLink to="/feed" className={navLinkClass}>Feed</NavLink>
          <NavLink to="/explore" className={navLinkClass}>Explore</NavLink>

          {/* Neighborhoods dropdown */}
          <div className={styles.neighWrapper} ref={neighDropdownRef}>
            <button
              className={`${styles.navLink} ${styles.neighToggle} ${neighDropdownOpen ? styles.navLinkActive : ''}`}
              onClick={() => setNeighDropdownOpen(v => !v)}
              aria-haspopup="true"
              aria-expanded={neighDropdownOpen}
              aria-label="Browse neighborhoods"
            >
              Neighborhoods
              <span className={styles.chevronSmall} aria-hidden="true">▾</span>
            </button>

            {neighDropdownOpen && (
              <div className={styles.neighDropdown} role="menu" aria-label="Neighborhoods">
                {NEIGHBORHOOD_NAV_LIST.map(area => (
                  <Link
                    key={area.slug}
                    to={`/neighborhood/${area.slug}`}
                    className={styles.neighItem}
                    role="menuitem"
                    onClick={() => setNeighDropdownOpen(false)}
                  >
                    {area.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className={styles.right}>
          <Link to="/guide/new" className={styles.createBtn}>
            + Create Guide
          </Link>

          {/* Account dropdown */}
          <div className={styles.accountWrapper} ref={accountDropdownRef}>
            <button
              className={styles.accountBtn}
              onClick={() => setAccountDropdownOpen(v => !v)}
              aria-haspopup="true"
              aria-expanded={accountDropdownOpen}
              aria-label="Account menu"
            >
              <span className={styles.avatar} aria-hidden="true">
                {currentUser.displayName[0]}
              </span>
              <span className={styles.accountName}>{currentUser.displayName}</span>
              <span className={styles.accountHandle}>
                @{currentUser.handle}
              </span>
              <span className={styles.chevron} aria-hidden="true">▾</span>
            </button>

            {accountDropdownOpen && (
              <div className={styles.dropdown} role="menu">
                <Link
                  to={`/profile/${currentUser.handle}`}
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  to={`/profile/${currentUser.handle}?tab=guides`}
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => setAccountDropdownOpen(false)}
                >
                  Your Guides
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className={styles.mobileMenu} aria-label="Mobile navigation">
          <NavLink
            to="/feed"
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Feed
          </NavLink>
          <NavLink
            to="/explore"
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore
          </NavLink>

          {/* Neighborhoods — full inline list on mobile */}
          <div className={styles.mobileNeighSection}>
            <span className={styles.mobileNeighLabel}>Neighborhoods</span>
            <div className={styles.mobileNeighList}>
              {NEIGHBORHOOD_NAV_LIST.map(area => (
                <Link
                  key={area.slug}
                  to={`/neighborhood/${area.slug}`}
                  className={styles.mobileNeighItem}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {area.name}
                </Link>
              ))}
            </div>
          </div>

          <Link
            to="/guide/new"
            className={styles.mobileCreateBtn}
            onClick={() => setMobileMenuOpen(false)}
          >
            + Create Guide
          </Link>
          <Link
            to={`/profile/${currentUser.handle}`}
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Your Profile
          </Link>
        </nav>
      )}
    </header>
  );
}
