import { useEffect, useRef, useState } from 'react';
import { Fancybox, ToolbarColumn } from '@fancyapps/ui';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  fetchCategoryImagesPage,
  fetchGalleryCategories,
} from '../api/gallery.js';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import 'swiper/css';
import 'swiper/css/navigation';

// Show only the newest images per category on What's New (the API returns
// newest-first, so the first pages already hold the latest uploads).
const LATEST_PER_CATEGORY = 12;
const SLIDE_AUTOPLAY_MS = 3500;
const SLIDE_AUTOPLAY_STAGGER_MS = 350;
const SLIDE_TRANSITION_MS = 850;

const preloadedImages = new Set();

function preloadImage(src) {
  if (!src || preloadedImages.has(src)) return;
  preloadedImages.add(src);
  const image = new Image();
  image.decoding = 'async';
  image.src = src;
}

function useOnceInView(rootMargin = '500px') {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, isInView];
}

function openFancybox(slides, startIndex, onIndexChange) {
  Fancybox.show(slides, {
    startIndex,
    theme: 'dark',
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
      'Carousel.change': (fancybox) => {
        const index = fancybox.getCarousel()?.getPageIndex() ?? startIndex;
        onIndexChange(index);
      },
    },
  });
}

function GallerySlider({ images, sectionIndex, title }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState(() => new Set());
  const swiperRef = useRef(null);
  const [sliderRef, isInView] = useOnceInView();
  const hasImages = images.length > 0;
  const hasLoop = images.length > 1;
  const previousControlClass = `gallery-control-prev-${sectionIndex}`;
  const nextControlClass = `gallery-control-next-${sectionIndex}`;

  useEffect(() => {
    setActiveIndex(0);
    setFailedImages(new Set());
    swiperRef.current?.slideToLoop?.(0, 0);
  }, [images]);

  useEffect(() => {
    if (!hasImages || !isInView) return;

    const previousIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    const nextIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;

    preloadImage(images[activeIndex].src);
    preloadImage(images[previousIndex].src);
    preloadImage(images[nextIndex].src);
  }, [activeIndex, hasImages, images, isInView]);

  const jumpToImage = (index) => {
    setActiveIndex(index);
    swiperRef.current?.slideToLoop?.(index, 0);
  };

  return (
    <div className="whats-new-gallery" ref={sliderRef}>
      <div className="row">
        <div className="col-12">
          <h2>{title}</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {hasImages ? (
            <div className="gallery-frame">
              {hasLoop && (
                <button
                  aria-label={`Previous ${title} image`}
                  className={`gallery-control gallery-control-prev ${previousControlClass}`}
                  type="button"
                >
                  &lsaquo;
                </button>
              )}

              <Swiper
                autoplay={
                  hasLoop
                    ? {
                        delay:
                          SLIDE_AUTOPLAY_MS +
                          sectionIndex * SLIDE_AUTOPLAY_STAGGER_MS,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                      }
                    : false
                }
                className="gallery-swiper"
                lazyPreloadPrevNext={2}
                loop={hasLoop}
                modules={[Autoplay, Navigation]}
                navigation={
                  hasLoop
                    ? {
                        prevEl: `.${previousControlClass}`,
                        nextEl: `.${nextControlClass}`,
                      }
                    : false
                }
                slidesPerView={1}
                speed={SLIDE_TRANSITION_MS}
                watchSlidesProgress
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                onSwiper={(swiper) => { swiperRef.current = swiper; }}
              >
                {images.map((image, index) => (
                  <SwiperSlide key={image.src}>
                    <button
                      className="gallery-slide"
                      disabled={failedImages.has(image.src)}
                      type="button"
                      onClick={() => openFancybox(images, index, jumpToImage)}
                    >
                      {failedImages.has(image.src) ? (
                        <span className="gallery-image-error">
                          Image is temporarily unavailable
                        </span>
                      ) : (
                        <img
                          src={image.src}
                          alt={image.caption}
                          loading={
                            isInView && index === activeIndex ? 'eager' : 'lazy'
                          }
                          decoding="async"
                          fetchPriority={
                            isInView && index === activeIndex ? 'high' : 'auto'
                          }
                          onError={() => {
                            setFailedImages((current) => {
                              const next = new Set(current);
                              next.add(image.src);
                              return next;
                            });
                          }}
                        />
                      )}
                    </button>
                  </SwiperSlide>
                ))}
              </Swiper>

              {hasLoop && (
                <button
                  aria-label={`Next ${title} image`}
                  className={`gallery-control gallery-control-next ${nextControlClass}`}
                  type="button"
                >
                  &rsaquo;
                </button>
              )}
            </div>
          ) : (
            <div className="gallery-empty">No images available</div>
          )}
        </div>
      </div>
    </div>
  );
}

function WhatsNew() {
  const [gallerySections, setGallerySections] = useState([]);
  const [imagesByCategory, setImagesByCategory] = useState({});
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const { signal } = controller;

    async function loadGalleries() {
      try {
        setStatus('loading');
        const categories = await fetchGalleryCategories();
        if (cancelled) return;

        const sections = [...categories].reverse().map((category) => ({
          title: category.name,
          slug: category.slug,
          id: category.id,
        }));
        setGallerySections(sections);
        // Show the structure immediately; each section's latest images then
        // fill in independently.
        setStatus('ready');

        await Promise.all(
          sections.map(async (section) => {
            try {
              // Show the newest page immediately (10 images)...
              const first = await fetchCategoryImagesPage(section.id, 1, signal);
              if (cancelled) return;
              setImagesByCategory((prev) => ({
                ...prev,
                [section.id]: first.images.slice(0, LATEST_PER_CATEGORY),
              }));

              // ...then top up to 12 from the next page if needed.
              if (
                first.images.length < LATEST_PER_CATEGORY &&
                (first.meta?.totalPages ?? 1) > 1
              ) {
                const second = await fetchCategoryImagesPage(
                  section.id,
                  2,
                  signal,
                ).catch(() => null);
                if (cancelled || !second) return;
                setImagesByCategory((prev) => ({
                  ...prev,
                  [section.id]: first.images
                    .concat(second.images)
                    .slice(0, LATEST_PER_CATEGORY),
                }));
              }
            } catch (error) {
              if (!cancelled && error.name !== 'AbortError') {
                setImagesByCategory((prev) => ({ ...prev, [section.id]: [] }));
              }
            }
          }),
        );
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          console.error('Unable to load What\'s New galleries:', error);
          setStatus('error');
        }
      }
    }

    loadGalleries();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <section className="whats-new-page">
      <div className="container">
        {status === 'loading' && (
          <div className="whats-new-status">Loading galleries...</div>
        )}
        {status === 'error' && (
          <div className="whats-new-status whats-new-status-error">
            Galleries could not be loaded. Please try again later.
          </div>
        )}
        {status === 'ready' && gallerySections.length === 0 && (
          <div className="whats-new-status">No galleries available right now.</div>
        )}
        {gallerySections.map((section, index) => {
          const sectionImages = imagesByCategory[section.id];

          if (sectionImages === undefined) {
            return (
              <div className="whats-new-gallery" key={section.id}>
                <div className="row">
                  <div className="col-12">
                    <h2>{section.title}</h2>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <div className="gallery-frame gallery-frame-loading" />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <GallerySlider
              images={sectionImages}
              key={section.id}
              sectionIndex={index}
              title={section.title}
            />
          );
        })}
      </div>
    </section>
  );
}

export default WhatsNew;
