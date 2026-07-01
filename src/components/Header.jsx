import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import bannerImage from '../assets/banner-image.jpg';
import { useAuth } from '../context/AuthContext.jsx';
import SocialLinks from './SocialLinks.jsx';
import { SHOP_ENABLED } from '../config.js';

function Header({ pages }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const userInitial = (user?.name?.trim()?.[0] || 'U').toUpperCase();

  useEffect(() => {
    if (!isProfileOpen) return undefined;

    const handleOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setIsProfileOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isProfileOpen]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (!isSearchOpen) {
      setIsSearchOpen(true);
      requestAnimationFrame(() => searchInputRef.current?.focus());
      return;
    }

    const query = searchInputRef.current?.value.trim() ?? '';

    if (!query) {
      searchInputRef.current?.focus();
      return;
    }

    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchValue('');
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  };

  const handleMenuClick = (event, linkPath) => {
    if (!linkPath.includes('#')) {
      return;
    }

    const [pathname, hash] = linkPath.split('#');

    event.preventDefault();
    navigate(pathname, {
      state: { gallerySlug: hash },
    });
  };

  return (
    <header className="site-header">
      <div
        className="header-banner"
        style={{ backgroundImage: `url(${bannerImage})` }}
      >
        <div className="container-fluid">
          <div className="header-top row align-items-start">
            <div className="col">
              <SocialLinks className="social-links d-flex" />
            </div>
            <div className="col-auto header-actions">
              <form
                className={`search-form input-group ${
                  isSearchOpen ? 'search-form-open' : ''
                }`}
                onSubmit={handleSearchSubmit}
                onMouseEnter={() => setIsSearchOpen(true)}
                onMouseLeave={() => {
                  setIsSearchOpen(false);
                  searchInputRef.current?.blur();
                }}
              >
                <input
                  aria-label="Search"
                  className="form-control"
                  ref={searchInputRef}
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                />
                <button
                  aria-label="Submit search"
                  className="btn"
                  type="submit"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24">
                    <path d="m20.7 19.3-4.2-4.2a7.8 7.8 0 1 0-1.4 1.4l4.2 4.2 1.4-1.4ZM4.8 10.5a5.7 5.7 0 1 1 11.4 0 5.7 5.7 0 0 1-11.4 0Z" />
                  </svg>
                </button>
              </form>

              {SHOP_ENABLED &&
                (isAuthenticated ? (
                <div className="profile-menu" ref={profileRef}>
                  <button
                    type="button"
                    className="profile-trigger"
                    aria-label="Account menu"
                    aria-expanded={isProfileOpen}
                    onClick={() => setIsProfileOpen((open) => !open)}
                  >
                    <span className="profile-avatar">{userInitial}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="profile-dropdown">
                      <div className="profile-dropdownHead">
                        <span className="profile-avatar profile-avatar-lg">
                          {userInitial}
                        </span>
                        <span className="profile-name">
                          {user?.name || 'Account'}
                        </span>
                      </div>

                      <Link
                        className="profile-item"
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5c0-3-4-5.5-9-5.5Z" />
                        </svg>
                        <span>Edit profile</span>
                      </Link>

                      <Link
                        className="profile-item"
                        to="/orders"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                          <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V5h14v14ZM7 7h10v2H7V7Zm0 4h10v2H7v-2Zm0 4h7v2H7v-2Z" />
                        </svg>
                        <span>My Orders</span>
                      </Link>

                      <button
                        type="button"
                        className="profile-item profile-logout"
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24">
                          <path d="M16 17v-3H9v-4h7V7l5 5-5 5ZM14 2a2 2 0 0 1 2 2v2h-2V4H5v16h9v-2h2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9Z" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  className="auth-login-link"
                  to="/login"
                  state={{ from: `${location.pathname}${location.search}` }}
                >
                  Login
                </Link>
                ))}
            </div>
          </div>
        </div>

        {/* <div className="brand-signature">Eloquent Images by Adrian</div> */}

        <nav className="main-menu navbar navbar-expand">
          <div className="container justify-content-center flex-wrap">
            {pages.filter((page) => !page.hidden).map((page) => {
              const linkPath = page.navPath ?? page.path;
              const isHashLink = linkPath.includes('#');
              const isActive = isHashLink
                ? `${location.pathname}${location.hash}` === linkPath
                : location.pathname === page.path;

              return (
                <NavLink
                  className={`menu-link nav-link${
                    isActive ? ' menu-link-active' : ''
                  }`}
                  key={`${page.name}-${linkPath}`}
                  onClick={(event) => handleMenuClick(event, linkPath)}
                  to={linkPath}
                >
                  {page.name}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
