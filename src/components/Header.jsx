import { useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import bannerImage from '../assets/banner-image.jpg';
import SocialLinks from './SocialLinks.jsx';

function Header({ pages }) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

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

    navigate(`/whats-new?search=${encodeURIComponent(query)}`);
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
