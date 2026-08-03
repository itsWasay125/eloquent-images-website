import { useEffect, useMemo, useRef, useState } from 'react';
import { Fancybox, ToolbarColumn } from '@fancyapps/ui';
import { Link, useLocation } from 'react-router-dom';
import {
  fetchCategoryImagesPage,
  fetchGalleryCategories,
} from '../api/gallery.js';
import ProductPickerModal from '../components/ProductPickerModal.jsx';
import Loader from '../components/Loader.jsx';
import { sortGalleryCategories } from '../data/galleryCategoryOrder.js';
import { waitForIdle } from '../utils/loadScheduling.js';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

const BACKGROUND_PAGE_BATCH_SIZE = 6;
// Only the first row or two are above the fold; the browser's native lazy
// loading handles the rest, fetching images as they approach the viewport.
const EAGER_GALLERY_IMAGES = 6;

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

function GalleryCardImage({ image, index }) {
  const isEager = index < EAGER_GALLERY_IMAGES;

  return (
    <div className="galleryImages-imageSlot">
      <img
        src={image.src}
        alt={image.caption}
        loading={isEager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={isEager ? 'high' : 'auto'}
      />
    </div>
  );
}

function Gallery({ withProductFlow = false }) {
  const location = useLocation();
  const galleryRef = useRef(null);
  const [apiCategories, setApiCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [imagesStatus, setImagesStatus] = useState('loading');
  // The gallery image the user wants to turn into a product (opens the picker).
  const [pickerImage, setPickerImage] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchGalleryCategories()
      .then((categories) => {
        if (cancelled) return;
        setApiCategories(categories);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categorySections = useMemo(() => {
    return sortGalleryCategories(apiCategories)
      .map((cat) => ({
        title: cat.name,
        slug: cat.slug,
        id: cat.id,
      }));
  }, [apiCategories]);

  const requestedSlug =
    (location.state?.gallerySlug ?? location.hash.replace('#', '')) || 'gallery';
  const activeSection =
    categorySections.find((s) => s.slug === requestedSlug) ??
    categorySections.find((s) => s.slug === 'gallery') ??
    categorySections[0];

  useEffect(() => {
    if (!activeSection) return undefined;

    let cancelled = false;
    const controller = new AbortController();
    const { signal } = controller;
    setImages([]);
    setImagesStatus('loading');

    async function loadImages() {
      try {
        const first = await fetchCategoryImagesPage(activeSection.id, 1, signal);
        if (cancelled) return;
        setImages(first.images);
        setImagesStatus('ready');

        const totalPages = first.meta?.totalPages ?? 1;
        const remainingPages = Array.from(
          { length: totalPages - 1 },
          (_, index) => index + 2,
        );

        for (let index = 0; index < remainingPages.length; index += BACKGROUND_PAGE_BATCH_SIZE) {
          if (index > 0) {
            await waitForIdle(120);
          }
          if (cancelled) return;

          const batch = remainingPages.slice(index, index + BACKGROUND_PAGE_BATCH_SIZE);
          const pages = await Promise.all(
            batch.map((page) =>
              fetchCategoryImagesPage(activeSection.id, page, signal).catch(() => null),
            ),
          );
          if (cancelled) return;

          const moreImages = pages.flatMap((page) => page?.images ?? []);
          if (moreImages.length) {
            setImages((current) => {
              const seen = new Set(current.map((image) => image.src));
              return current.concat(
                moreImages.filter((image) => !seen.has(image.src)),
              );
            });
          }
        }
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') setImagesStatus('error');
      }
    }

    loadImages();

    return () => {
      cancelled = true;
      controller.abort();
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
                {imagesStatus === 'loading' && <Loader label="Loading images…" />}
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
                        <div className="galleryImages-item">
                          <button
                            className="galleryImages-card"
                            type="button"
                            onClick={() => openGallery(images, index)}
                          >
                            <GalleryCardImage image={image} index={index} />
                            <span>
                              <svg aria-hidden="true" viewBox="0 0 24 24">
                                <path d="m20.7 19.3-4.2-4.2a7.8 7.8 0 1 0-1.4 1.4l4.2 4.2 1.4-1.4ZM4.8 10.5a5.7 5.7 0 1 1 11.4 0 5.7 5.7 0 0 1-11.4 0Z" />
                              </svg>
                              {image.caption}
                            </span>
                          </button>
                          {withProductFlow && (
                            <button
                              className="galleryImages-useBtn"
                              type="button"
                              onClick={() => setPickerImage(image)}
                            >
                              <svg aria-hidden="true" viewBox="0 0 24 24">
                                <path d="M21 7 9 19l-5.5-5.5 1.4-1.4L9 16.2 19.6 5.6 21 7Z" />
                              </svg>
                              Use on a product
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {withProductFlow && pickerImage && (
        <ProductPickerModal image={pickerImage} onClose={() => setPickerImage(null)} />
      )}
    </section>
  );
}

export default Gallery;
