import { useEffect, useState } from 'react';
import api from '../api/client';
import type { Restaurant } from '../types/catalog';

type RestaurantsResponse = {
  restaurants: Restaurant[];
};

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;

    const loadRestaurants = async () => {
      try {
        const { data } = await api.get<RestaurantsResponse>('/restaurants');
        if (!active) {
          return;
        }

        setRestaurants(data.restaurants);
      } catch {
        if (active) {
          setError('Could not load restaurants. Make sure the backend is running.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadRestaurants();

    return () => {
      active = false;
    };
  }, []);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchable = `${restaurant.name} ${restaurant.description ?? ''} ${restaurant.cuisineType ?? ''}`.toLowerCase();
    return searchable.includes(query.toLowerCase());
  });

  return (
    <section className="section">
      <div className="section__header">
        <div>
          <h2>Restaurants</h2>
          <p>Browse what your SQLite database knows about.</p>
        </div>

        <label className="field" style={{ minWidth: 'min(100%, 320px)' }}>
          <span className="hint">Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pizza, biryani, ramen..."
          />
        </label>
      </div>

      {loading ? <div className="page-status">Loading restaurants...</div> : null}
      {error ? <div className="page-status">{error}</div> : null}

      {!loading && !error && filteredRestaurants.length === 0 ? (
        <div className="empty-state">
          <h2>No restaurants yet</h2>
          <p>
            Add sample rows through Prisma Studio or a seed script, and the restaurant cards will show up
            here immediately.
          </p>
        </div>
      ) : null}

      <div className="restaurant-grid section">
        {filteredRestaurants.map((restaurant) => (
          <article className="restaurant-card" key={restaurant.id}>
            <div className="restaurant-card__header">
              <div className="restaurant-card__title">
                <h3>{restaurant.name}</h3>
                <div className="meta-row">
                  {restaurant.cuisineType ? <span className="pill">{restaurant.cuisineType}</span> : null}
                  <span className="pill">Rating {restaurant.rating.toFixed(1)}</span>
                  <span className="pill">{restaurant.menuItems.length} items</span>
                </div>
              </div>
              <span className="pill">{restaurant.isActive ? 'Open' : 'Closed'}</span>
            </div>

            <p>{restaurant.description ?? 'No description yet.'}</p>

            <ul className="menu-list">
              {restaurant.menuItems.slice(0, 4).map((item) => (
                <li className="menu-item" key={item.id}>
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.description ?? 'Simple menu item you can expand later.'}</p>
                  </div>
                  <span className="menu-item__price">₹{item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
