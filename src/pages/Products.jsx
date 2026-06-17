import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api/products.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import RemoteImage from '../components/RemoteImage.jsx';

function ProductCard({ product }) {
  const { addItem, isUpdating } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [variantId, setVariantId] = useState(product.variants[0]?.id || '');
  const [added, setAdded] = useState(false);

  const selectedVariant =
    product.variants.find((variant) => variant.id === variantId) || product.variants[0];
  const priceLabel = selectedVariant?.priceLabel || product.price;

  async function handleAdd() {
    if (!selectedVariant) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/products' } });
      return;
    }

    try {
      await addItem({ product, variant: selectedVariant, quantity: 1 });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } catch (error) {
      console.error('Unable to add product to cart:', error);
    }
  }

  return (
    <div className="product-card">
      <div className="product-cardMedia">
        <RemoteImage
          src={product.image}
          alt={product.name}
          className="product-cardImg"
          loading="lazy"
          decoding="async"
        />
      </div>

      <h3>{product.name}</h3>
      {priceLabel && <p className="product-price">{priceLabel}</p>}

      {product.variants.length > 0 && (
        <div className="product-sizes">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              className={`product-size ${variant.id === variantId ? 'is-active' : ''}`}
              onClick={() => setVariantId(variant.id)}
            >
              {variant.size}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        className="product-addBtn"
        onClick={handleAdd}
        disabled={!selectedVariant || isUpdating}
      >
        {added ? 'Added ✓' : 'Add to Cart'}
      </button>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const controller = new AbortController();

    fetchProducts(controller.signal)
      .then((items) => {
        setProducts(items);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Unable to load products:', error);
          setStatus('error');
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="products">
      <div className="container">
        <div className="row">
          <div className="col-12" data-aos="fade-up">
            <h2>Products</h2>
          </div>
        </div>

        <div className="row g-4">
          {status === 'loading' && (
            <div className="col-12">
              <div className="blog-status">Loading products...</div>
            </div>
          )}
          {status === 'error' && (
            <div className="col-12">
              <div className="blog-status">
                Products could not be loaded. Please try again later.
              </div>
            </div>
          )}
          {status === 'ready' && products.length === 0 && (
            <div className="col-12">
              <div className="blog-status">No products available.</div>
            </div>
          )}
          {products.map((product) => (
            <div className="col-md-4 col-sm-6" key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Products;
