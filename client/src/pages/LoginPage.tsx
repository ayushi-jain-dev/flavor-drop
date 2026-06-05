import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/restaurants" replace />;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate('/restaurants');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to log in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-grid">
      <div className="hero__intro">
        <span className="eyebrow">Welcome back</span>
        <h1 className="hero__title">Log in and keep building the app.</h1>
        <p className="hero__lede">
          The backend already supports email/password auth. Once you are in, you can connect browsing,
          cart, and orders to the current session.
        </p>
      </div>

      <div className="form-card">
        <h2>Login</h2>
        <p className="hint">Use the same email and password you registered with.</p>

        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error ? <div className="form__error">{error}</div> : null}

          <button type="submit" className="button button--primary button--full" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="hint">
          New here? <Link to="/register" className="button--link">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
