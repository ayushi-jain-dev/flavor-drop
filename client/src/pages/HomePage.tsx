import { Link } from 'react-router-dom';

const highlights = [
  {
    badge: 'Quick delivery',
    title: 'Hot food, handled carefully and delivered while it still tastes fresh.',
    text: 'Choose something fast for lunch, dinner, or a late-night craving and get it moving right away.',
  },
  {
    badge: 'Top picks',
    title: 'Discover local favorites, comfort food, and healthier choices in one place.',
    text: 'Browse a hand-picked selection of spots that feel right for whatever you are in the mood for.',
  },
  {
    badge: 'Simple checkout',
    title: 'Save your address once, reorder easily, and keep the path to checkout short.',
    text: 'The experience stays light and easy so you can focus on the meal instead of the form fields.',
  },
];

const featuredCards = [
  {
    title: 'Pizza nights',
    text: 'Cheesy, crisp, and perfect for sharing.',
    meta: 'Comfort food',
  },
  {
    title: 'Healthy bowls',
    text: 'Fresh, colorful, and packed with flavor.',
    meta: 'Lighter options',
  },
  {
    title: 'Weekend treats',
    text: 'Indulgent dishes for when you want something special.',
    meta: 'Best sellers',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__intro">
          <span className="eyebrow">Fresh food delivered fast</span>
          <h1 className="hero__title">Hungry? Find something great and get it delivered.</h1>
          <p className="hero__lede">
            Browse restaurants, save your favorite delivery address, build your cart, and place an order
            in just a few taps. FlavorDrop is built to feel quick, simple, and satisfying from the first
            bite to the last.
          </p>

          <div className="hero__actions">
            <Link to="/restaurants" className="button button--primary">
              Explore restaurants
            </Link>
            <Link to="/register" className="button button--ghost">
              Sign up
            </Link>
          </div>

          <div className="hero__stats" aria-label="App highlights">
            <div className="stat">
              <span className="stat__value">Local spots</span>
              <span className="stat__label">Restaurants you actually want to order from</span>
            </div>
            <div className="stat">
              <span className="stat__value">Fast checkout</span>
              <span className="stat__label">Add items, pick an address, place the order</span>
            </div>
            <div className="stat">
              <span className="stat__value">Order tracking</span>
              <span className="stat__label">See what is happening after you hit submit</span>
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
            <h2>What people come here for</h2>
            <p>Easy meals, fast decisions, and a smoother way to order.</p>
          </div>
        </div>

        <div className="panel-grid">
          <article className="panel">
            <h2>Choose a restaurant</h2>
            <ul className="steps">
              <li>
                <span className="dot" />
                <span>
                  <strong>Search by craving</strong> whether it is pizza, biryani, noodles, or a fresh bowl.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Check the menu</strong> and see what is popular before you decide.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Pick what feels right</strong> for the mood, the budget, and the time of day.
                </span>
              </li>
            </ul>
          </article>

          <article className="panel">
            <h2>Build your meal</h2>
            <ul className="steps">
              <li>
                <span className="dot" />
                <span>
                  <strong>Add items to the cart</strong> and adjust the quantity as you go.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Save your address</strong> so checkout stays quick the next time.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Review the total</strong> before you place the order.
                </span>
              </li>
            </ul>
          </article>

          <article className="panel">
            <h2>Track the delivery</h2>
            <ul className="steps">
              <li>
                <span className="dot" />
                <span>
                  <strong>Watch status updates</strong> as your food moves from confirmed to delivered.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Keep orders in one place</strong> so you can reorder the things you loved.
                </span>
              </li>
              <li>
                <span className="dot" />
                <span>
                  <strong>Enjoy the meal</strong> without worrying about the backend work behind it.
                </span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="section__header">
          <div>
            <h2>Popular right now</h2>
            <p>A few tasty ideas to get you started.</p>
          </div>
        </div>

        <div className="panel-grid">
          {featuredCards.map((card) => (
            <article className="panel" key={card.title}>
              <span className="feature-card__badge">{card.meta}</span>
              <h2 style={{ marginTop: '14px' }}>{card.title}</h2>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
