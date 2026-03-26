import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../hooks/useAppContext';
import StarIcon from '../shared/StarIcon';
import styles from './Header.module.css';

export default function Header() {
  const { state } = useAppContext();
  const { currentUser } = state;
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
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
          <NavLink to="/neighborhood/lincoln-square" className={navLinkClass}>
            Neighborhoods
          </NavLink>
        </nav>

        {/* Right side */}
        <div className={styles.right}>
          <Link to="/guide/new" className={styles.createBtn}>
            + Create Guide
          </Link>

          {/* Account dropdown */}
          <div className={styles.accountWrapper} ref={dropdownRef}>
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
                  to={`/profile/${currentUser.handle}`}
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
          <NavLink
            to="/neighborhood/lincoln-square"
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Neighborhoods
          </NavLink>
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
