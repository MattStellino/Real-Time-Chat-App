import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../actions/authActions';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    setAttemptsRemaining(null);

    if (!email || !password) {
      setError('Please enter all fields');
      setLoading(false);
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${CONFIG.API_URL}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch({ type: 'USER_LOGIN', payload: { token: data.user.token } });
        dispatch({ type: 'SET_USER', payload: data.user });
        dispatch(loginUser(data.user));
        setEmail('');
        setPassword('');
        navigate('/chats');
      } else {
        setError(data.error || 'Login failed. Please check your credentials.');
        
        // Show attempts remaining if provided
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        
        // Handle rate limiting
        if (response.status === 429) {
          setError(data.error || 'Too many login attempts. Please try again later.');
        }
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      {attemptsRemaining !== null && attemptsRemaining > 0 && (
        <div className="warning-message">
          {attemptsRemaining} attempts remaining before account lockout
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          id="email"
          type="email"
          className={`form-input ${fieldErrors.email ? 'error' : ''}`}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
              setFieldErrors(prev => ({ ...prev, email: '' }));
            }
          }}
          placeholder="Enter your email"
          required
        />
        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          id="password"
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
      </div>
      
      <button 
        type="submit" 
        className={`auth-button ${loading ? 'loading' : ''}`}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export default Login;
