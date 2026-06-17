import { Link } from 'react-router-dom';
import SocialLinks from './SocialLinks.jsx';

const quickLinks = [
  [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about-us' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Contact Us', path: '/contact-us' },
  ],
  [
    { name: 'Birds', path: '/gallery/#birds' },
    { name: 'Mammals', path: '/gallery/#mammals' },
    { name: 'Insects & Spiders', path: '/gallery/#insects-spiders' },
    { name: 'Reptiles & Amphibians', path: '/gallery/#reptiles-amphibians' },
  ],
];

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row gy-5">
          <div className="col-md-5" data-aos="fade-up">
            <h2 className="footer-title">ABOUT US</h2>
            <p className="footer-about">
              Eloquent visuals by Adrian is a perfect one for the people who
              love to see the wonders of nature, and have a passion for covering
              natural scenes. By using the latest technologies, and equipment,
              eloquent portraits by Adrian are full of life, colors, and
              innovation. You can always have a look at the portfolio and images
              we have covered since I stepped into this business, and see our
              perfection of covering each angle with a different lens.
            </p>
          </div>

          <div className="col-md-4" data-aos="fade-up">
            <h2 className="footer-title">QUICK LINKS</h2>
            <div className="row">
              {quickLinks.map((group) => (
                <div className="col-md-6" key={group[0].name}>
                  <ul className="footer-links">
                    {group.map((link) => (
                      <li key={link.name}>
                        <Link to={link.path}>{link.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-3" data-aos="fade-up">
            <h2 className="footer-title">CONTACT US</h2>
            <p className="footer-email">
              Email:
              <a href="mailto:adrian.elliott55@gmail.com">
                adrian.elliott55@gmail.com
              </a>
            </p>
            <SocialLinks className="footer-social d-flex align-items-center" />
          </div>
        </div>

        <p className="footer-copy">
          All rights Reserved &copy; 2026 <Link to="/">Eloquent Image</Link>,
          Designed &amp; Developed by{' '}
          <a href="https://koderspedia.com/" rel="noreferrer" target="_blank">
            Koderspedia
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;
