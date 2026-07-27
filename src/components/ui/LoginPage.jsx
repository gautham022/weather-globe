import { useState } from 'react';
import CharacterScene from './CharacterScene';
import { API_URL } from '../../config';
import './LoginPage.css';

/**
 * Character states: 'idle' | 'typingEmail' | 'passwordHidden' | 'passwordVisible' | 'error' | 'success'
 */
export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [charState, setCharState] = useState('idle');
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailFocus = () => setCharState('typingEmail');

  const handlePasswordFocus = () =>
    setCharState(showPassword ? 'passwordVisible' : 'passwordHidden');

  const handleBlurBoth = () => setCharState('idle');

  const toggleShowPassword = () => {
    const next = !showPassword;
    setShowPassword(next);
    setCharState(next ? 'passwordVisible' : 'passwordHidden');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Invalid email or password');

      const data = await res.json();
      setCharState('success');
      setTimeout(() => onLoginSuccess?.(data), 900);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong');
      setCharState('error');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setCharState('idle'), 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card${shake ? ' shake' : ''}`}>
        <div className="illustration-section">
          <CharacterScene state={charState} />
        </div>

        <div className="form-section">
          <h2>Welcome back!</h2>
          <p className="subtitle">Please enter your details</p>

          {errorMsg && <p className="error-message">{errorMsg}</p>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="enter your email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={handleEmailFocus}
                onBlur={handleBlurBoth}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={handlePasswordFocus}
                onBlur={handleBlurBoth}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleShowPassword}
                tabIndex={-1}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>

            {charState === 'success' && (
              <p className="success-banner">Welcome in! Redirecting…</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}