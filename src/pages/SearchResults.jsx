import { useEffect, useState } from 'react';
import { Fancybox, ToolbarColumn } from '@fancyapps/ui';
import { Link, useSearchParams } from 'react-router-dom';
import { searchImages } from '../api/gallery.js';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

function openGallery(slides, startIndex) {
  const scrollPosition = window.scrollY;

  Fancybox.show(slides, {
    startIndex,
    theme: 'dark',
    placeFocusBack: false,
    Carousel: {
      infinite: true,
      Toolbar: {
        absolute: true,
        display: {
          [ToolbarColumn.Left]: ['counter'],
          [ToolbarColumn.middle]: [
            'zoomIn',
            'zoomOut',
            'toggle1to1',
            'rotateCCW',
            'rotateCW',
            'flipX',
            'flipY',
          ],
          [ToolbarColumn.right]: ['autoplay', 'fullscreen', 'close'],
        },
      },
    },
    on: {
      destroy: () => {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: scrollPosition, behavior: 'auto' });
        });
      },
    },
  });
}

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();

  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!query) {
      setImages([]);
      setStatus('empty');
      return undefined;
    }

    const controller = new AbortController();
    setStatus('loading');

    searchImages(query, controller.signal)
      .then((results) => {
        setImages(results);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Search failed:', error);
          setStatus('error');
        }
      });

    return () => controller.abort();
  }, [query]);

  return (
    <section className="galleryImages searchResults" id="galleryImages">
      <div className="container">
        <div className="row">
          <div className="col-12" data-aos="fade-up">
            <h2 className="searchResults-title">
              {query ? (
                <>
                  Results for <span>“{query}”</span>
                </>
              ) : (
                'Search'
              )}
            </h2>
          </div>
        </div>

        <div className="row g-3">
          {status === 'empty' && (
            <div className="col-12">
              <div className="gallery-empty">Type something to search the gallery.</div>
            </div>
          )}
          {status === 'loading' && (
            <div className="col-12">
              <div className="gallery-empty">Searching...</div>
            </div>
          )}
          {status === 'error' && (
            <div className="col-12">
              <div className="gallery-empty">
                Search could not be completed. Please try again later.
              </div>
            </div>
          )}
          {status === 'ready' && images.length === 0 && (
            <div className="col-12">
              <div className="gallery-empty">
                No images found for “{query}”.{' '}
                <Link className="cart-emptyLink" to="/gallery">
                  Browse the gallery
                </Link>
              </div>
            </div>
          )}
          {status === 'ready' &&
            images.map((image, index) => (
              <div className="col-md-4 col-sm-6" key={image.src}>
                <button
                  className="galleryImages-card"
                  type="button"
                  onClick={() => openGallery(images, index)}
                >
                  <div className="galleryImages-imageSlot">
                    <img
                      src={image.src}
                      alt={image.caption}
                      loading={index < 6 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={index < 6 ? 'high' : 'auto'}
                    />
                  </div>
                  <span>
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="m20.7 19.3-4.2-4.2a7.8 7.8 0 1 0-1.4 1.4l4.2 4.2 1.4-1.4ZM4.8 10.5a5.7 5.7 0 1 1 11.4 0 5.7 5.7 0 0 1-11.4 0Z" />
                    </svg>
                    {image.caption}
                  </span>
                </button>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

export default SearchResults;
