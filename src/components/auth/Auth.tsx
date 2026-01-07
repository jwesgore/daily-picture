import { useState } from 'react';
import { useAuth } from '../../context/UserContext';
import { validatePassword, isPasswordValid } from '../../utils/passwordValidator';
import './Auth.css';

interface AuthProps {
  onSuccess: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRequirements = isSignup ? validatePassword(password) : null;
  const isPasswordComplexEnough = isSignup ? isPasswordValid(password) : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!isPasswordComplexEnough) {
          throw new Error('Password does not meet complexity requirements');
        }
        await signup(username, password);
      } else {
        await login(username, password);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isSignup ? 'Create Account' : 'Sign In'}</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            
            {isSignup && passwordRequirements && (
              <div className="password-requirements">
                <div className={`requirement ${passwordRequirements.minLength ? 'met' : ''}`}>
                  {passwordRequirements.minLength ? '✓' : '✗'} At least 8 characters
                </div>
                <div className={`requirement ${passwordRequirements.hasUppercase ? 'met' : ''}`}>
                  {passwordRequirements.hasUppercase ? '✓' : '✗'} One uppercase letter (A-Z)
                </div>
                <div className={`requirement ${passwordRequirements.hasLowercase ? 'met' : ''}`}>
                  {passwordRequirements.hasLowercase ? '✓' : '✗'} One lowercase letter (a-z)
                </div>
                <div className={`requirement ${passwordRequirements.hasNumber ? 'met' : ''}`}>
                  {passwordRequirements.hasNumber ? '✓' : '✗'} One number (0-9)
                </div>
                <div className={`requirement ${passwordRequirements.hasSpecialChar ? 'met' : ''}`}>
                  {passwordRequirements.hasSpecialChar ? '✓' : '✗'} One special character (!@#$%^&*)
                </div>
              </div>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={loading || (isSignup && !isPasswordComplexEnough)} 
            className="btn-primary"
          >
            {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
                setPassword('');
              }}
              className="toggle-btn"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
