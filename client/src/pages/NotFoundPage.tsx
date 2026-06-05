import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="empty-state">
        <h2>Page not found</h2>
        <p>The route you tried to open does not exist yet.</p>
        <Link to="/" className="button button--primary">
          Go home
        </Link>
      </div>
    </section>
  );
}
