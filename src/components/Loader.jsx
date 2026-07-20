// Themed spinner used across the site while images/products/pages load.
function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div className={`loader ${className}`.trim()} role="status" aria-live="polite">
      <span className="loader-spinner" />
      {label && <span className="loader-label">{label}</span>}
    </div>
  );
}

export default Loader;
