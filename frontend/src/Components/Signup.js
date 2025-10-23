import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  // Frontend validation
  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (username.length > 30) {
      errors.username = 'Username must be less than 30 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    
    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      errors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(password)) {
      errors.password = 'Password must contain at least one lowercase letter';
    } else if (!/\d/.test(password)) {
      errors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.password = 'Password must contain at least one special character';
    }
    
    return errors;
  };

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    // Frontend validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${CONFIG.API_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(data.message);
        setUsername('');
        setPassword('');
        setEmail('');
        setFieldErrors({});
        
        // Auto-redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (data.field) {
          setFieldErrors({ [data.field]: data.error });
        } else {
          setError(data.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={register} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="form-group">
        <label htmlFor="username" className="form-label">Username</label>
        <input
          id="username"
          type="text"
          className={`form-input ${fieldErrors.username ? 'error' : ''}`}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (fieldErrors.username) {
              setFieldErrors(prev => ({ ...prev, username: '' }));
            }
          }}
          placeholder="Enter your username (3-30 characters)"
          required
        />
        {fieldErrors.username && <div className="field-error">{fieldErrors.username}</div>}
      </div>
      
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
          placeholder="Enter your email address"
          required
        />
        {fieldErrors.email && <div className="field-error">{fieldErrors.email}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          id="password"
          type="password"
          className={`form-input ${fieldErrors.password ? 'error' : ''}`}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors(prev => ({ ...prev, password: '' }));
            }
          }}
          placeholder="Enter a strong password"
          required
        />
        {fieldErrors.password && <div className="field-error">{fieldErrors.password}</div>}
        <div className="password-requirements">
          <small>Password must contain: 8+ characters, uppercase, lowercase, number, special character</small>
        </div>
      </div>
      
      <button 
        type="submit" 
        className={`auth-button ${loading ? 'loading' : ''}`}
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      
      {success && (
        <div className="redirect-message">
          <small>Redirecting to login page...</small>
        </div>
      )}
    </form>
  );
};

export default SignupForm;
