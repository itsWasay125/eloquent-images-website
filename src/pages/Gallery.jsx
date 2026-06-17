import { useEffect, useMemo, useRef, useState } from 'react';
import { Fancybox, ToolbarColumn } from '@fancyapps/ui';
import { Link, useLocation } from 'react-router-dom';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

const API_BASE = 'https://eloquent.koderspedia.online';

function getImageName(image) {
  return (
    image.originalName ||
    image.fileName ||
    image.filename ||
    image.title ||
    'Original name unavailable'
  );
}

function mapImages(data) {
  return data.map((img) => ({
    src: img.imageUrl,
    caption: getImageName(img),
    type: 'image',
  }));
}

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
          window.scrollTo({
            top: scrollPosition,
            behavior: 'auto',
          });
        });
      },
    },
  });
}

function Gallery() {
  const location = useLocation();
  const galleryRef = useRef(null);
  const initialImagesLoad = useRef(true);
  const [apiCategories, setApiCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [imagesStatus, setImagesStatus] = useState('loading');

  useEffect(() => {
    fetch(`${API_BASE}/api/Categories`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setApiCategories(data.categories);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      })
      .catch(() => setStatus('error'));
  }, []);

  const categorySections = useMemo(() => {
    return apiCategories
      .map((cat) => ({
        title: cat.name,
        slug: cat.slug,
        id: cat.id,
      }))
      .reverse();
  }, [apiCategories]);

  const requestedSlug =
    location.state?.gallerySlug ?? location.hash.replace('#', '');
  const activeSection =
    categorySections.find((s) => s.slug === requestedSlug) ??
    categorySections.find((s) => s.slug === 'gallery') ??
    categorySections[0];

  useEffect(() => {
    if (!activeSection) return undefined;

    const buildUrl = (page) => {
      const params = new URLSearchParams({ page: String(page) });
      if (activeSection.id) params.set('categoryId', activeSection.id);
      return `${API_BASE}/api/images?${params.toString()}`;
    };

    let cancelled = false;
    // Only show the loading message on the very first load. When switching
    // categories, keep the current images visible until the new ones arrive.
    if (initialImagesLoad.current) {
      setImagesStatus('loading');
    }

    async function loadAllImages() {
      try {
        const first = await fetch(buildUrl(1)).then((res) => res.json());

        if (!first.success || !Array.isArray(first.data)) {
          if (!cancelled) {
            setImages([]);
            setImagesStatus('error');
          }
          return;
        }

        let all = first.data;
        const totalPages = first.meta?.totalPages ?? 1;

        if (totalPages > 1) {
          const rest = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, i) =>
              fetch(buildUrl(i + 2)).then((res) => res.json()),
            ),
          );
          rest.forEach((page) => {
            if (page.success && Array.isArray(page.data)) {
              all = all.concat(page.data);
            }
          });
        }

        if (cancelled) return;
        initialImagesLoad.current = false;
        setImages(mapImages(all));
        setImagesStatus('ready');
      } catch {
        if (!cancelled) setImagesStatus('error');
      }
    }

    loadAllImages();

    return () => {
      cancelled = true;
    };
  }, [activeSection?.id]);

  useEffect(() => {
    if (!requestedSlug || !galleryRef.current) return;

    window.requestAnimationFrame(() => {
      galleryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (location.state?.gallerySlug) {
        window.history.replaceState(null, '', `/gallery/#${requestedSlug}`);
      }
    });
  }, [location.state, requestedSlug]);

  return (
    <section className="galleryImages" id="galleryImages" ref={galleryRef}>
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-3" data-aos="fade-up">
            <nav className="galleryImages-nav" aria-label="Gallery categories">
              {categorySections.map((section) => (
                <Link
                  className={
                    section.slug === activeSection?.slug
                      ? 'galleryImages-active'
                      : ''
                  }
                  key={section.slug}
                  to={`/gallery/#${section.slug}`}
                >
                  {section.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="col-lg-9" data-aos="fade-up">
            {status === 'error' && (
              <div className="gallery-empty">
                Gallery could not be loaded. Please try again later.
              </div>
            )}
            {status === 'ready' && categorySections.length === 0 && (
              <div className="gallery-empty">No gallery categories available.</div>
            )}
            {status === 'ready' && categorySections.length > 0 && (
              <>
                {imagesStatus === 'loading' && (
                  <div className="gallery-empty">Loading images...</div>
                )}
                {imagesStatus === 'error' && (
                  <div className="gallery-empty">
                    Images could not be loaded. Please try again later.
                  </div>
                )}
                {imagesStatus === 'ready' && images.length === 0 && (
                  <div className="gallery-empty">No images available in this category.</div>
                )}
                {imagesStatus === 'ready' && images.length > 0 && (
                  <div className="row g-3" id={activeSection?.slug}>
                    {images.map((image, index) => (
                      <div className="col-md-4 col-sm-6" key={image.src}>
                        <button
                          className="galleryImages-card"
                          type="button"
                          onClick={() => openGallery(images, index)}
                        >
                          <img
                            src={image.src}
                            alt={image.caption}
                            loading="lazy"
                            decoding="async"
                          />
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Gallery;
