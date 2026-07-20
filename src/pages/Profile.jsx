import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Profile() {
  const location = useLocation();
  const { isAuthenticated, user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  // Keep the form in sync with the latest user (e.g. after get-user-by-token).
  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setNotice('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);
    try {
      await updateProfile({ name: form.name, email: form.email });
      setNotice('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="auth">
        <div className="container">
          <div className="auth-card" data-aos="fade-up">
            <h2>Profile</h2>
            <p className="auth-sub">
              Please{' '}
              <Link
                to="/login"
                state={{ from: `${location.pathname}${location.search}${location.hash}` }}
              >
                log in
              </Link>{' '}
              to manage your profile.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="auth">
      <div className="container">
        <div className="auth-card" data-aos="fade-up">
          <h2>My profile</h2>
          <p className="auth-sub">Update your account details below.</p>

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

            {notice && <p className="auth-notice">{notice}</p>}
            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Profile;
