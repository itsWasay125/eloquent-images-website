import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../api/printful/checkout.js';
import { useAuth } from '../context/AuthContext.jsx';

function formatMoney(amount, currency = 'USD') {
  const value = Number(amount);
  if (Number.isNaN(value)) return null;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('unauthenticated');
      return undefined;
    }

    const controller = new AbortController();
    setStatus('loading');

    fetchMyOrders(controller.signal)
      .then((data) => {
        setOrders(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Unable to load orders:', error);
          setStatus('error');
        }
      });

    return () => controller.abort();
  }, [isAuthenticated]);

  return (
    <section className="orders">
      <div className="container">
        <div className="row">
          <div className="col-12" data-aos="fade-up">
            <h2>My Orders</h2>
          </div>
        </div>

        {status === 'unauthenticated' && (
          <div className="blog-status">
            Please{' '}
            <Link className="cart-emptyLink" to="/login">
              log in
            </Link>{' '}
            to view your orders.
          </div>
        )}
        {status === 'loading' && <div className="blog-status">Loading your orders...</div>}
        {status === 'error' && (
          <div className="blog-status">Orders could not be loaded. Please try again later.</div>
        )}
        {status === 'ready' && orders.length === 0 && (
          <div className="blog-status">
            You have no orders yet.{' '}
            <Link className="cart-emptyLink" to="/products">
              Browse products
            </Link>
          </div>
        )}

        {status === 'ready' && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => {
              const total = formatMoney(order.amount, order.currency);
              return (
                <div className="orders-item" key={order.id}>
                  <div className="orders-itemHead">
                    <span className="orders-itemId">
                      Order #{order.printfulOrderId || order.id?.slice(0, 8)}
                    </span>
                    {order.status && (
                      <span className="orders-itemStatus">{order.status}</span>
                    )}
                  </div>
                  {order.createdAt && (
                    <span className="orders-itemDate">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  )}
                  {total && <span className="orders-itemTotal">{total}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
