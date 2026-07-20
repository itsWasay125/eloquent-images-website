import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function isAuthPath(pathname = '') {
  return ['/login', '/register'].includes(pathname.replace(/\/+$/, ''));
}

function getRegisterDestination(from) {
  if (typeof from === 'string' && from && !isAuthPath(from)) {
    return { to: from, options: { replace: true } };
  }

  if (from?.pathname && !isAuthPath(from.pathname)) {
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

  return { to: '/products', options: { replace: true } };
}

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      await register(form);
      const destination = getRegisterDestination(from);
      navigate(destination.to, destination.options);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="container">
        <div className="auth-card" data-aos="fade-up">
          <h2>Register</h2>
          <p className="auth-sub">Create an account to start shopping.</p>

          <form onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </label>

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
                autoComplete="new-password"
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login" state={{ from }}>Login</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Register;
