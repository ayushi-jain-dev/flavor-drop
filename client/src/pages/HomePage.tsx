import { Link } from 'react-router-dom';

const highlights = [
  {
    badge: 'Fast setup',
    title: 'Build auth, browsing, cart, and orders one step at a time.',
    text: 'This starter gives you the backbone of a real food delivery app without forcing you into a giant codebase on day one.',
  },
  {
    badge: 'SQLite-backed',
    title: 'Use Prisma + SQLite for a local database that feels like a real product.',
    text: 'You can seed restaurants, menus, and orders locally, then iterate toward migrations and deployment later.',
  },
  {
    badge: 'Expandable',
    title: 'Add checkout, delivery tracking, reviews, and admin tools after the MVP.',
    text: 'The code is shaped so you can keep growing without redoing the whole stack.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__intro">
          <span className="eyebrow">Food delivery app starter</span>
          <h1 className="hero__title">Your own delivery platform, built one layer at a time.</h1>
          <p className="hero__lede">
            Use this project as the foundation for a modern food delivery app with React, TypeScript,
            auth, SQLite, and a clean backend API. Start with login and restaurant browsing, then add
            cart, checkout, and order tracking when the core flow is working.
          </p>

          <div className="hero__actions">
            <Link to="/register" className="button button--primary">
              Create your account
            </Link>
            <Link to="/restaurants" className="button button--ghost">
              Browse restaurants
            </Link>
          </div>

          <div className="hero__stats" aria-label="Project summary">
            <div className="stat">
              <span className="stat__value">2 apps</span>
              <span className="stat__label">Frontend + backend</span>
            </div>
            <div className="stat">
              <span className="stat__value">SQLite</span>
              <span className="stat__label">Local dev database</span>
            </div>
            <div className="stat">
              <span className="stat__value">Auth first</span>
              <span className="stat__label">Register and login flow</span>
            </div>
          </div>
        </div>

        <aside className="hero__visual">
          <div className="feature-grid">
            {highlights.map((item) => (
              <article className="feature-card" key={item.title}>
                <span className="feature-card__badge">{item.badge}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <h2>What to build next</h2>
            <p>This starter is ready for the first real milestones.</p>
          </div>
        </div>

        <div className="panel-grid">
          <article className="panel">
            <h2>1. Auth and user sessions</h2>
            <ul className="steps">
              <li>
                <span className="dot" />
                <span>
                  <strong>Register and login</strong> with JWT and hashed passwords.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Persist the session</strong> in local storage for now, then upgrade to cookies
                  later if you want.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Protect private routes</strong> like cart, orders, profile, and admin pages.
                </span>
              </li>
            </ul>
          </article>

          <article className="panel">
            <h2>2. Catalog and cart</h2>
            <ul className="steps">
              <li>
                <span className="dot" />
                <span>
                  <strong>Seed restaurants and menus</strong> in SQLite so the app has real data.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Fetch restaurant details</strong> and render menus on the frontend.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Wire cart actions</strong> to the backend once the product flow feels right.
                </span>
              </li>
            </ul>
          </article>

          <article className="panel">
            <h2>3. Orders and admin</h2>
            <ul className="steps">
              <li>
                <span className="dot" />
                <span>
                  <strong>Create checkout</strong> and submit order data to the API.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Track order status</strong> from pending to delivered.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Add admin tools</strong> for restaurants, menu items, and order management.
                </span>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}
