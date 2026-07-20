import { useEffect, useState } from 'react';
import { fetchAllCategoryImages, fetchGalleryCategories } from '../api/gallery.js';
import ProductPickerModal from '../components/ProductPickerModal.jsx';
import RemoteImage from '../components/RemoteImage.jsx';
import Loader from '../components/Loader.jsx';
import { sortGalleryCategories } from '../data/galleryCategoryOrder.js';

function CreateYourOwn() {
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [pickerImage, setPickerImage] = useState(null);

  // Load categories for the filter and pick a default.
  useEffect(() => {
    let cancelled = false;
    fetchGalleryCategories()
      .then((cats) => {
        if (cancelled || !cats.length) return;
        const orderedCategories = sortGalleryCategories(cats);
        setCategories(orderedCategories);
        setActiveCategoryId(orderedCategories[0].id);
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load every image in the selected category.
  useEffect(() => {
    if (!activeCategoryId) return undefined;
    const controller = new AbortController();
    setStatus('loading');

    fetchAllCategoryImages(activeCategoryId, controller.signal)
      .then((items) => {
        setImages(items);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setStatus('error');
      });

    return () => controller.abort();
  }, [activeCategoryId]);

  return (
    <section className="createOwn">
      <div className="createOwn-hero">
        <div className="container">
          <span className="createOwn-eyebrow">Create Your Own</span>
          <h1>Put any photo on a custom print</h1>
          <p>
            Choose one of Adrian&apos;s images below, pick a product, and we&apos;ll print
            your chosen design on it — ready to ship to your door.
          </p>
        </div>
      </div>

      <div className="container">
        {categories.length > 0 && (
          <div className="createOwn-cats">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`createOwn-cat ${category.id === activeCategoryId ? 'is-active' : ''}`}
                onClick={() => setActiveCategoryId(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {status === 'loading' && <Loader label="Loading images…" />}
        {status === 'error' && (
          <div className="blog-status">Images could not be loaded. Please try again later.</div>
        )}
        {status === 'ready' && images.length === 0 && (
          <div className="blog-status">No images in this category.</div>
        )}

        {status === 'ready' && images.length > 0 && (
          <div className="createOwn-grid">
            {images.map((image) => (
              <button
                key={image.src}
                type="button"
                className="createOwn-card"
                onClick={() => setPickerImage(image)}
              >
                <div className="createOwn-cardMedia">
                  <RemoteImage src={image.src} alt={image.caption} loading="lazy" decoding="async" />
                  <span className="createOwn-cardOverlay">
                    <svg aria-hidden="true" viewBox="0 0 24 24">
                      <path d="M21 7 9 19l-5.5-5.5 1.4-1.4L9 16.2 19.6 5.6 21 7Z" />
                    </svg>
                    Use on a product
                  </span>
                </div>
                <span className="createOwn-cardName">{image.caption}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {pickerImage && (
        <ProductPickerModal image={pickerImage} onClose={() => setPickerImage(null)} />
      )}
    </section>
  );
}

export default CreateYourOwn;
