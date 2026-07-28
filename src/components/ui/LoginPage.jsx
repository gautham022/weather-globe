import { useState } from 'react';
import CharacterScene from './CharacterScene';
import SpaceBackground from './SpaceBackground';
import { API_URL } from '../../config';
import './LoginPage.css';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [fading, setFading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [charState, setCharState] = useState('idle');
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleEmailFocus = () => setCharState('typingEmail');
  const handlePasswordFocus = () =>
    setCharState(showPassword ? 'passwordVisible' : 'passwordHidden');
  const handleBlurBoth = () => setCharState('idle');

  const toggleShowPassword = () => {
    const next = !showPassword;
    setShowPassword(next);
    setCharState(next ? 'passwordVisible' : 'passwordHidden');
  };

  const [exitingChars, setExitingChars] = useState(false);

const switchMode = (nextMode) => {
  if (nextMode === mode) return;
  setErrorMsg('');
  setSuccessMsg('');
  setShowForgot(false);

  if (mode === 'login' && nextMode === 'signup') {
    // Play the ghost exit animation first, then swap panels + fade the form
    setExitingChars(true);
    setFading(true);
    setTimeout(() => {
      setMode(nextMode);
      setFading(false);
      setExitingChars(false);
    }, 350);
  } else {
    setFading(true);
    setTimeout(() => {
      setMode(nextMode);
      setFading(false);
    }, 220);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const endpoint = mode === 'login' ? '/login' : '/signup';
    const body =
      mode === 'login' ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }

      if (mode === 'login') {
        setCharState('success');
        setTimeout(() => onLoginSuccess?.(data), 900);
      } else {
        setCharState('success');
        setSuccessMsg('Account created! You can log in now.');
        setTimeout(() => {
          setCharState('idle');
          switchMode('login');
        }, 1200);
      }
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
          {mode === 'signup' ? (
            <SpaceBackground />
          ) : (
            <CharacterScene state={charState} exiting={exitingChars} />
          )}
        </div>

        <div className="form-section">
          <div className={`form-content${fading ? ' fading' : ''}`}>
            <h2>{mode === 'login' ? 'Welcome back!' : 'Create your account'}</h2>
            <p className="subtitle">
              {mode === 'login'
                ? 'Please enter your details'
                : 'Join to save your places and preferences'}
            </p>

            {errorMsg && <p className="error-message">{errorMsg}</p>}
            {successMsg && <p className="success-banner">{successMsg}</p>}

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="input-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={handleEmailFocus}
                    onBlur={handleBlurBoth}
                    required
                  />
                </div>
              )}

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
                  minLength={mode === 'signup' ? 6 : undefined}
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
                {loading
                  ? mode === 'login'
                    ? 'Logging in…'
                    : 'Creating account…'
                  : mode === 'login'
                  ? 'Log In'
                  : 'Sign Up'}
              </button>

              {charState === 'success' && mode === 'login' && (
                <p className="success-banner">Welcome in! Redirecting…</p>
              )}
            </form>

            <div className="links-row">
              {mode === 'login' ? (
                <>
                  <button
                    type="button"
                    className="link-muted"
                    onClick={() => setShowForgot((v) => !v)}
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    className="link-primary"
                    onClick={() => switchMode('signup')}
                  >
                    Create new account
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="link-primary"
                  onClick={() => switchMode('login')}
                >
                  Already have an account? Log in
                </button>
              )}
            </div>

            {showForgot && (
              <p className="forgot-note">
                Password reset isn't set up yet — contact support to reset
                your password for now.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}