import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPasswordRequest } from '../api/auth.js';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await forgotPasswordRequest({ email });
      // OTP sent — carry the email so the reset page can resend if needed.
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setError(err.message || 'Could not send the reset code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth">
      <div className="container">
        <div className="auth-card" data-aos="fade-up">
          <h2>Forgot password</h2>
          <p className="auth-sub">
            Enter your email and we&apos;ll send you a one-time code to reset your password.
          </p>

          <form onSubmit={handleSubmit}>
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-submit" disabled={submitting}>
              {submitting ? 'Sending code...' : 'Send reset code'}
            </button>
          </form>

          <p className="auth-switch">
            Remembered it? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;
