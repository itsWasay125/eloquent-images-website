import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  resendOtpRequest,
  resetPasswordRequest,
  verifyOtpRequest,
} from '../api/auth.js';

function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || '';

  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  // Step 1 — confirm the code is valid before asking for a new password.
  const handleVerify = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await verifyOtpRequest({ otp });
      setOtpVerified(true);
      setNotice('Code verified. Choose a new password.');
    } catch (err) {
      setError(err.message || 'Invalid or expired code.');
    } finally {
      setBusy(false);
    }
  };

  // Step 2 — set the new password.
  const handleReset = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await resetPasswordRequest({ otp, password });
      navigate('/login', { state: { resetDone: true } });
    } catch (err) {
      setError(err.message || 'Could not reset your password. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Start from “Forgot password” so we know which email to resend to.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await resendOtpRequest({ email });
      setNotice('A new code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Could not resend the code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth">
      <div className="container">
        <div className="auth-card" data-aos="fade-up">
          <h2>Reset password</h2>
          <p className="auth-sub">
            {otpVerified
              ? 'Enter a new password for your account.'
              : `Enter the code we sent${email ? ` to ${email}` : ''}.`}
          </p>

          {!otpVerified ? (
            <form onSubmit={handleVerify}>
              <label className="auth-field">
                <span>One-time code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </label>

              {notice && <p className="auth-notice">{notice}</p>}
              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? 'Verifying...' : 'Verify code'}
              </button>

              <button
                type="button"
                className="auth-linkBtn"
                onClick={handleResend}
                disabled={busy}
              >
                Resend code
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <label className="auth-field">
                <span>New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="auth-field">
                <span>Confirm password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </label>

              {notice && <p className="auth-notice">{notice}</p>}
              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="auth-submit" disabled={busy}>
                {busy ? 'Saving...' : 'Reset password'}
              </button>
            </form>
          )}

          <p className="auth-switch">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;
