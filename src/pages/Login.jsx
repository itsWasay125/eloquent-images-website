import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function isLoginPath(pathname = '') {
  return pathname.replace(/\/+$/, '') === '/login';
}

function getLoginDestination(from) {
  if (typeof from === 'string' && from && !isLoginPath(from)) {
    return { to: from, options: { replace: true } };
  }

  if (from?.pathname && !isLoginPath(from.pathname)) {
    return {
      to: {
        pathname: from.pathname,
        search: from.search || '',
        hash: from.hash || '',
      },
      options: {
        replace: true,
        state: from.state,
      },
    };
  }

  return { to: '/', options: { replace: true } };
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form);
      const destination = getLoginDestination(from);
      navigate(destination.to, destination.options);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="container">
        <div className="auth-card" data-aos="fade-up">
          <h2>Login</h2>
          <p className="auth-sub">Welcome back. Please sign in to continue.</p>

          <form onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="auth-switch">
            <Link to="/forgot-password">Forgot password?</Link>
          </p>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register" state={{ from }}>Register</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
