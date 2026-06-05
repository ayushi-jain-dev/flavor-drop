import { Link } from 'react-router-dom';

export default function CartPage() {
  return (
    <section className="section">
      <div className="section__header">
        <div>
          <h2>Cart</h2>
          <p>This is where cart state will live before checkout.</p>
        </div>
      </div>

      <div className="empty-state">
        <h2>Cart is ready for the next step</h2>
        <p>
          The backend already has an order creation endpoint. Next, connect menu item actions here so the
          user can build a checkout payload.
        </p>
        <div className="hero__actions">
          <Link to="/restaurants" className="button button--primary">
            Add menu items
          </Link>
        </div>
      </div>
    </section>
  );
}
