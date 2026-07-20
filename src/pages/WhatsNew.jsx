import { useEffect, useRef, useState } from 'react';
import { Fancybox, ToolbarColumn } from '@fancyapps/ui';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { fetchLatestImages } from '../api/gallery.js';
import Loader from '../components/Loader.jsx';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import 'swiper/css';
import 'swiper/css/navigation';

const SLIDE_AUTOPLAY_MS = 3500;
const SLIDE_TRANSITION_MS = 850;

function openFancybox(slides, startIndex) {
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
  });
}

function WhatsNew() {
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('loading');
  const swiperRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      try {
        setStatus('loading');
        const latestImages = await fetchLatestImages(100, controller.signal);
        if (cancelled) return;

        setImages(latestImages);
        setStatus('ready');
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          console.error("Unable to load What's New feed:", error);
          setStatus('error');
        }
      }
    }

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const hasLoop = images.length > 1;

  return (
    <section className="whats-new-page">
      <div className="container">
        <div className="row">
          <div className="col-12" data-aos="fade-up">
            <h2 className="whats-new-heading">What&apos;s New</h2>
          </div>
        </div>

        {status === 'loading' && <Loader label="Loading the latest images…" />}
        {status === 'error' && (
          <div className="whats-new-status whats-new-status-error">
            The feed could not be loaded. Please try again later.
          </div>
        )}
        {status === 'ready' && images.length === 0 && (
          <div className="whats-new-status">No images available right now.</div>
        )}

        {status === 'ready' && images.length > 0 && (
          <div className="row">
            <div className="col-12">
              <div className="gallery-frame">
                {hasLoop && (
                  <button
                    aria-label="Previous image"
                    className="gallery-control gallery-control-prev whats-new-prev"
                    type="button"
                  >
                    &lsaquo;
                  </button>
                )}

                <Swiper
                  autoplay={
                    hasLoop
                      ? { delay: SLIDE_AUTOPLAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true }
                      : false
                  }
                  className="gallery-swiper"
                  lazyPreloadPrevNext={2}
                  loop={hasLoop}
                  modules={[Autoplay, Navigation]}
                  navigation={hasLoop ? { prevEl: '.whats-new-prev', nextEl: '.whats-new-next' } : false}
                  slidesPerView={1}
                  speed={SLIDE_TRANSITION_MS}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                >
                  {images.map((image, index) => (
                    <SwiperSlide key={`${image.src}-${index}`}>
                      <button
                        className="gallery-slide"
                        type="button"
                        onClick={() => openFancybox(images, index)}
                      >
                        <img
                          src={image.src}
                          alt={image.caption}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {hasLoop && (
                  <button
                    aria-label="Next image"
                    className="gallery-control gallery-control-next whats-new-next"
                    type="button"
                  >
                    &rsaquo;
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default WhatsNew;
