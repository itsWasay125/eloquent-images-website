import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import RemoteImage from '../components/RemoteImage.jsx';

function formatMoney(value, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

const EMPTY_ADDRESS = {
  name: '',
  address1: '',
  city: '',
  state_code: '',
  country_code: '',
  zip: '',
};

function Cart() {
  const { cart, isUpdating, setQuantity, removeItem, emptyCart, checkout } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutDone, setCheckoutDone] = useState('');
  const [placing, setPlacing] = useState(false);

  const hasItems = cart.items.length > 0;

  const handleAddressChange = (event) => {
    setAddress((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setCheckoutError('');
    setCheckoutDone('');
    setPlacing(true);

    try {
      const result = await checkout(address);
      // If checkout returned a redirect URL, the context redirects to Fourthwall.
      const redirecting = result?.checkout_url || result?.order?.checkout_url;
      setCheckoutDone(
        redirecting
          ? 'Redirecting to secure checkout...'
          : result?.message || 'Order placed successfully!',
      );
    } catch (error) {
      setCheckoutError(error.message || 'Checkout failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <section className="cart">
      <div className="container">
        <div className="row">
          <div className="col-12" data-aos="fade-up">
            <h2>Your Cart</h2>
          </div>
        </div>

        {!hasItems ? (
          <div className="row">
            <div className="col-12">
              <div className="blog-status">
                Your cart is empty.{' '}
                <Link className="cart-emptyLink" to="/products">
                  Browse products
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="cart-items">
                {cart.items.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <RemoteImage
                      src={item.image}
                      alt={item.name}
                      className="cart-itemImg"
                      loading="lazy"
                    />

                    <div className="cart-itemInfo">
                      <h3>{item.name}</h3>
                      {item.size && <span className="cart-itemSize">Size: {item.size}</span>}
                      {item.price !== null && (
                        <span className="cart-itemPrice">
                          {formatMoney(item.price, item.currency)}
                        </span>
                      )}
                    </div>

                    <div className="cart-itemQty">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={isUpdating || item.quantity <= 1}
                        onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={isUpdating}
                        onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-itemRemove"
                      disabled={isUpdating}
                      onClick={() => removeItem(item.variantId)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="cart-clear"
                disabled={isUpdating}
                onClick={emptyCart}
              >
                Clear cart
              </button>
            </div>

            <div className="col-lg-4">
              <div className="cart-summary">
                <h3>Order Summary</h3>
                <div className="cart-summaryRow">
                  <span>Items</span>
                  <span>{cart.count}</span>
                </div>
                <div className="cart-summaryRow cart-summaryTotal">
                  <span>Subtotal</span>
                  <span>{formatMoney(cart.subtotal, cart.currency)}</span>
                </div>

                {!showCheckout && (
                  <button
                    type="button"
                    className="cart-checkout"
                    disabled={isUpdating}
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                  </button>
                )}

                {showCheckout && (
                  <form className="checkout-form" onSubmit={handlePlaceOrder}>
                    <h4>Shipping Address</h4>

                    <input
                      name="name"
                      placeholder="Full name"
                      value={address.name}
                      onChange={handleAddressChange}
                      required
                    />
                    <input
                      name="address1"
                      placeholder="Street address"
                      value={address.address1}
                      onChange={handleAddressChange}
                      required
                    />
                    <input
                      name="city"
                      placeholder="City"
                      value={address.city}
                      onChange={handleAddressChange}
                      required
                    />
                    <div className="checkout-formRow">
                      <input
                        name="state_code"
                        placeholder="State (e.g. CA)"
                        value={address.state_code}
                        onChange={handleAddressChange}
                        required
                      />
                      <input
                        name="zip"
                        placeholder="ZIP"
                        value={address.zip}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <input
                      name="country_code"
                      placeholder="Country (e.g. US)"
                      value={address.country_code}
                      onChange={handleAddressChange}
                      required
                    />

                    {checkoutError && <p className="auth-error">{checkoutError}</p>}
                    {checkoutDone && <p className="checkout-success">{checkoutDone}</p>}

                    <button type="submit" className="cart-checkout" disabled={placing}>
                      {placing ? 'Placing order...' : 'Place Order'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;
