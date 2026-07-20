function FacebookIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M14.4 8H16V5.2c-.8-.1-1.6-.2-2.4-.2-2.4 0-4 1.5-4 4.2V11H7v3.1h2.6V22h3.2v-7.9h2.7L16 11h-3.2V9.5c0-.9.3-1.5 1.6-1.5Z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M21.5 6.1c-.7.3-1.4.5-2.2.6.8-.5 1.4-1.2 1.7-2.1-.7.4-1.6.8-2.4.9A3.8 3.8 0 0 0 12 8.1c0 .3 0 .6.1.9a10.8 10.8 0 0 1-7.9-4 3.8 3.8 0 0 0 1.2 5.1c-.6 0-1.2-.2-1.7-.5v.1c0 1.8 1.3 3.3 3 3.7-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.5 1.9 2.6 3.6 2.6A7.7 7.7 0 0 1 3 17.6 10.8 10.8 0 0 0 8.9 19c7.1 0 11-5.9 11-11v-.5c.6-.4 1.2-.9 1.6-1.4Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M11 10.2v3h4.9c-.2 1.2-1.5 3.4-4.9 3.4-2.9 0-5.3-2.4-5.3-5.4S8.1 5.8 11 5.8c1.7 0 2.8.7 3.4 1.3l2.3-2.2A8.4 8.4 0 0 0 11 2.7a8.5 8.5 0 1 0 0 17c4.9 0 8.1-3.4 8.1-8.2 0-.5-.1-.9-.1-1.3h-8Zm11 0h-2.4V7.8h-2.1v2.4h-2.4v2.1h2.4v2.4h2.1v-2.4H22v-2.1Z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.9 8.8H3.7V20h3.2V8.8ZM5.3 3.2a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Zm15 10.5c0-3-1.6-5.2-4.5-5.2a3.9 3.9 0 0 0-3.5 1.9V8.8H9.2V20h3.2v-5.6c0-1.5.3-3 2.2-3 1.8 0 1.8 1.7 1.8 3.1V20h3.2v-6.3h.7Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4s-3.8 0-6.7.2c-.4.1-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.4.2 6.4.2s3.8 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6ZM10.1 14.5V8.3l5.9 3.1-5.9 3.1Z" />
    </svg>
  );
}

const socialLinks = [
  { label: 'Facebook', path: 'https://www.facebook.com/adrian.elliott.120110', icon: FacebookIcon },
  { label: 'Twitter', path: '#', icon: TwitterIcon },
  { label: 'Google Plus', path: '#', icon: GoogleIcon },
  { label: 'LinkedIn', path: '#', icon: LinkedinIcon },
  { label: 'YouTube', path: '#', icon: YoutubeIcon },
];

function SocialLinks({ className = '' }) {
  return (
    <div className={className}>
      {socialLinks.map(({ icon: Icon, label, path }) => (
        <a
          aria-label={label}
          className="social-icon"
          href={path}
          key={label}
          target={path === '#' ? undefined : '_blank'}
          rel={path === '#' ? undefined : 'noopener noreferrer'}
          onClick={(event) => {
            if (path === '#') event.preventDefault();
          }}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
