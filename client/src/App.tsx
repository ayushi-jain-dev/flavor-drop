import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantsPage from './pages/RestaurantsPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function Shell() {
  const { user, loading, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  return (
    <div className="app-shell">
      <div className="app-shell__orb app-shell__orb--one" aria-hidden="true" />
      <div className="app-shell__orb app-shell__orb--two" aria-hidden="true" />

      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="Go to home">
          <span className="brand__badge">FD</span>
          <span>
            <span className="brand__title">FlavorDrop</span>
            <span className="brand__subtitle">React + TypeScript starter</span>
          </span>
        </NavLink>

        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>
            Home
          </NavLink>
          <NavLink
            to="/restaurants"
            className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
          >
            Restaurants
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
          >
            Orders
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}>
            Cart{itemCount > 0 ? ` (${itemCount})` : ''}
          </NavLink>
        </nav>

        <div className="auth-actions">
          {loading ? (
            <span className="user-chip">Checking session</span>
          ) : user ? (
            <>
              <span className="user-chip">Hi, {user.name.split(' ')[0]}</span>
              <button type="button" className="button button--ghost" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" state={{ from: location }} className="button button--ghost">
                Login
              </NavLink>
              <NavLink to="/register" className="button button--primary">
                Create account
              </NavLink>
            </>
          )}
        </div>
      </header>

      <main className="page">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <Shell />
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
