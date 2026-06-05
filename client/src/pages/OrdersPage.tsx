import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Order } from '../types/order';

type OrdersResponse = {
  orders: Order[];
};

const statusLabel: Record<Order['status'], string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      try {
        const { data } = await api.get<OrdersResponse>('/orders');
        if (!active) {
          return;
        }

        setOrders(data.orders);
      } catch {
        if (active) {
          setError('Could not load orders. Check that the API is running and you are logged in.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section">
      <div className="section__header">
        <div>
          <h2>Your orders</h2>
          <p>Orders are fetched from the authenticated backend route.</p>
        </div>
      </div>

      {loading ? <div className="page-status">Loading orders...</div> : null}
      {error ? <div className="page-status">{error}</div> : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="empty-state">
          <h2>No orders yet</h2>
          <p>Once checkout is wired up, new orders will show up here with status updates.</p>
        </div>
      ) : null}

      <div className="order-list section">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-card__header">
              <div>
                <h3>{order.restaurant.name}</h3>
                <p>
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
              <span className={`status-pill status-pill--${order.status.toLowerCase()}`}>
                {statusLabel[order.status]}
              </span>
            </div>

            <ul className="menu-list">
              {order.items.map((item) => (
                <li className="menu-item" key={item.id}>
                  <div>
                    <h4>
                      {item.name} x {item.quantity}
                    </h4>
                    <p>Unit price ₹{item.unitPrice.toFixed(2)}</p>
                  </div>
                  <span className="menu-item__price">₹{(item.unitPrice * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="meta-row">
              <span className="pill">Subtotal ₹{order.subtotal.toFixed(2)}</span>
              <span className="pill">Delivery ₹{order.deliveryFee.toFixed(2)}</span>
              <span className="pill">Tax ₹{order.tax.toFixed(2)}</span>
              <span className="pill">Total ₹{order.total.toFixed(2)}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
