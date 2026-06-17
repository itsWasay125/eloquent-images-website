import { useEffect, useState } from 'react';

function RemoteImage({ alt, className = '', fallbackText, src, ...props }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <span className={`${className} remote-image-fallback`} role="img" aria-label={alt}>
        {fallbackText || 'Image is temporarily unavailable'}
      </span>
    );
  }

  return (
    <img
      {...props}
      alt={alt}
      className={className}
      src={src}
      onError={() => setHasError(true)}
    />
  );
}

export default RemoteImage;
