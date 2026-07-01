import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchMyOrders } from '../api/printful/checkout.js';

function formatMoney(amount, currency = 'USD') {
  const value = Number(amount);
  if (Number.isNaN(value)) return null;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

function CheckoutSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);

  // Pull the just-paid order from the user's order list to show a summary.
  useEffect(() => {
    if (!orderId) return undefined;
    const controller = new AbortController();

    fetchMyOrders(controller.signal)
      .then((orders) => {
        const match = orders.find((o) => o.id === orderId);
        if (match) setOrder(match);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [orderId]);

  const total = order && formatMoney(order.amount, order.currency);

  return (
    <section className="checkoutSuccess">
      <div className="container">
        <div className="checkoutSuccess-card" data-aos="fade-up">
          <div className="checkoutSuccess-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
            </svg>
          </div>

          <h1>Payment successful</h1>
          <p className="checkoutSuccess-lead">
            Thank you for your order! Your payment has been received and your custom
            product is being sent to production.
          </p>

          <div className="checkoutSuccess-details">
            {orderId && (
              <div className="checkoutSuccess-row">
                <span>Order ID</span>
                <strong>{orderId}</strong>
              </div>
            )}
            {order?.printfulOrderId && (
              <div className="checkoutSuccess-row">
                <span>Printful Order</span>
                <strong>#{order.printfulOrderId}</strong>
              </div>
            )}
            {total && (
              <div className="checkoutSuccess-row">
                <span>Total paid</span>
                <strong>{total}</strong>
              </div>
            )}
            <div className="checkoutSuccess-row">
              <span>Status</span>
              <strong>{order?.status || 'Processing'}</strong>
            </div>
          </div>

          <p className="checkoutSuccess-note">
            A confirmation will appear in your orders once payment is fully verified.
          </p>

          <div className="checkoutSuccess-actions">
            <Link className="product-addBtn" to="/orders">
              View my orders
            </Link>
            <Link className="productDetail-cancelBtn" to="/products">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CheckoutSuccess;
