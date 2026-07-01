import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPrintfulCheckout } from '../api/printful/checkout.js';
import { buildCheckoutOptions } from '../api/printful/catalog.js';
import { useAuth } from '../context/AuthContext.jsx';
import RemoteImage from '../components/RemoteImage.jsx';

const EMPTY_ADDRESS = {
  name: '',
  email: '',
  address1: '',
  address2: '',
  city: '',
  state_code: '',
  zip: '',
  country_code: 'US',
  phone: '',
};

// We currently ship to the United States only.
const COUNTRIES = [{ code: 'US', name: 'United States' }];

// Printful requires a state/province code for these countries.
const STATE_REQUIRED = ['US', 'CA', 'AU'];

// A single shipping-form input with an inline validation message.
function Field({ name, address, errors, onChange, type = 'text', placeholder, inputMode }) {
  return (
    <div className="productDetail-field">
      <input
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        value={address[name]}
        className={errors[name] ? 'is-invalid' : ''}
        onChange={(e) => onChange(name, e.target.value)}
      />
      {errors[name] && <span className="productDetail-fieldError">{errors[name]}</span>}
    </div>
  );
}

function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [fieldErrors, setFieldErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill name + email from the logged-in user (without clobbering edits).
  useEffect(() => {
    if (!user) return;
    setAddress((prev) => ({
      ...prev,
      name: prev.name || user.name || '',
      email: prev.email || user.email || '',
    }));
  }, [user]);

  // Nothing to check out (e.g. opened directly or after a refresh).
  if (!state?.product || !state?.variant || !state?.design) {
    return (
      <section className="checkout">
        <div className="container">
          <div className="blog-status">
            There is nothing to check out.{' '}
            <Link className="cart-emptyLink" to="/products">
              Browse products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="checkout">
        <div className="container">
          <div className="blog-status">
            Please{' '}
            <Link className="cart-emptyLink" to="/login">
              log in
            </Link>{' '}
            to complete your order.
          </div>
        </div>
      </section>
    );
  }

  const { product, variant, design } = state;

  function updateField(key, value) {
    let next = value;
    // ZIP: digits only. Phone: digits and phone punctuation (+, -, spaces, ()).
    if (key === 'zip') next = value.replace(/[^0-9]/g, '');
    if (key === 'phone') next = value.replace(/[^0-9+\-\s()]/g, '');
    setAddress((current) => ({ ...current, [key]: next }));
    setFieldErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }

  function validateAddress(addr) {
    const errors = {};
    if (!addr.name.trim()) errors.name = 'Full name is required';
    if (!addr.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr.email)) errors.email = 'Enter a valid email';
    if (!addr.address1.trim()) errors.address1 = 'Address is required';
    if (!addr.city.trim()) errors.city = 'City is required';
    if (!addr.zip.trim()) errors.zip = 'ZIP / postal code is required';
    if (STATE_REQUIRED.includes(addr.country_code) && !addr.state_code.trim()) {
      errors.state_code = 'State code is required for this country';
    }
    return errors;
  }

  async function handleCheckout(event) {
    event.preventDefault();

    const errors = validateAddress(address);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPlacing(true);
    setErrorMessage('');
    try {
      const result = await createPrintfulCheckout({
        recipient: {
          ...address,
          country_code: address.country_code.toUpperCase(),
          state_code: address.state_code.toUpperCase(),
        },
        items: [
          {
            variant_id: String(variant.variantId),
            quantity: 1,
            // Backend expects the price in DOLLARS and multiplies by 100 itself
            // for Stripe. Sending cents here would overcharge 100x.
            retail_price: Number((variant.price || 0).toFixed(2)),
            files: [{ type: product.printFileType, url: design.src }],
            // Required product options (e.g. stitch_color) with sensible defaults.
            options: buildCheckoutOptions(product.options),
          },
        ],
      });

      const url = result.checkoutUrl || result.url;
      if (url) {
        window.location.href = url; // off to Stripe
        return;
      }
      setErrorMessage(result.message || 'No checkout URL was returned.');
    } catch (error) {
      console.error('Checkout failed:', error);
      setErrorMessage(error.message || 'Could not start checkout.');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <section className="checkout">
      <div className="container">
        <h2 className="checkout-title">Checkout</h2>

        <div className="checkout-layout">
          {/* Order summary */}
          <aside className="checkout-summary">
            <h3>Your order</h3>
            <div className="checkout-summaryItem">
              <div className="checkout-summaryImg">
                <RemoteImage src={product.image} alt={product.name} loading="lazy" />
                <span className="checkout-summaryDesign">
                  <img src={design.src} alt={design.caption} />
                </span>
              </div>
              <div className="checkout-summaryInfo">
                <strong>{product.name}</strong>
                <span>
                  {[variant.color, variant.size].filter(Boolean).join(' · ')}
                </span>
                <span className="checkout-summaryDesignName">Design: {design.caption}</span>
              </div>
              <span className="checkout-summaryPrice">{variant.priceLabel}</span>
            </div>

            <div className="checkout-summaryNote">
              Shipping &amp; tax are calculated at the next step (Stripe).
            </div>
          </aside>

          {/* Shipping form */}
          <form className="checkout-form" onSubmit={handleCheckout}>
            <h3>Shipping details</h3>
            <div className="productDetail-formGrid">
              <Field name="name" placeholder="Full name" address={address}
                errors={fieldErrors} onChange={updateField} />
              <Field name="email" type="email" placeholder="Email" address={address}
                errors={fieldErrors} onChange={updateField} />
              <Field name="address1" placeholder="Address line 1" address={address}
                errors={fieldErrors} onChange={updateField} />
              <Field name="address2" placeholder="Address line 2 (optional)" address={address}
                errors={fieldErrors} onChange={updateField} />
              <Field name="city" placeholder="City" address={address}
                errors={fieldErrors} onChange={updateField} />
              <div className="productDetail-field">
                <select
                  className="productDetail-select"
                  value={address.country_code}
                  onChange={(e) => updateField('country_code', e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Field
                name="state_code"
                placeholder={
                  STATE_REQUIRED.includes(address.country_code)
                    ? 'State code (e.g. CA)'
                    : 'State / province code (optional)'
                }
                address={address}
                errors={fieldErrors}
                onChange={updateField}
              />
              <Field name="zip" placeholder="ZIP / postal code" inputMode="numeric"
                address={address} errors={fieldErrors} onChange={updateField} />
              <Field name="phone" type="tel" placeholder="Phone (optional)" inputMode="tel"
                address={address} errors={fieldErrors} onChange={updateField} />
            </div>

            <div className="checkout-actions">
              <button type="submit" className="product-addBtn" disabled={placing}>
                {placing ? 'Starting checkout…' : 'Proceed to Payment'}
              </button>
              <button
                type="button"
                className="productDetail-cancelBtn"
                onClick={() => navigate(-1)}
                disabled={placing}
              >
                Back
              </button>
            </div>

            {errorMessage && (
              <div className="auth-error productDetail-checkoutError">
                {errorMessage
                  .split(';')
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
