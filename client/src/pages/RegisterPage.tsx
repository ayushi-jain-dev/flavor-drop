import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await register(name, email, password);
      navigate('/restaurants');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to create account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-grid">
      <div className="hero__intro">
        <span className="eyebrow">Start here</span>
        <h1 className="hero__title">Create your account and open the app.</h1>
        <p className="hero__lede">
          This registration flow creates a user record in SQLite through the backend API. It is the
          first step toward browsing restaurants, placing orders, and saving addresses.
        </p>
      </div>

      <div className="form-card">
        <h2>Create account</h2>
        <p className="hint">Passwords are hashed on the server before they reach the database.</p>

        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Aarav Sharma"
              required
            />
          </label>

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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </label>

          {error ? <div className="form__error">{error}</div> : null}

          <button type="submit" className="button button--primary button--full" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="hint">
          Already have an account? <Link to="/login" className="button--link">Log in</Link>
        </p>
      </div>
    </section>
  );
}
