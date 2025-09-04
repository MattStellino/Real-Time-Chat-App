import React, { useState } from 'react';
import { CONFIG } from '../config';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || !password || !email) {
      setError('Please enter all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${CONFIG.API_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      if (response.ok) {
        setError('');
        setUsername('');
        setPassword('');
        setEmail('');
        // Could show success message or redirect to login
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Registration failed:', response.status, errorData);
        setError(errorData.message || `Failed to register user (${response.status})`);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={register} className="auth-form">
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="username" className="form-label">Username</label>
        <input
          id="username"
          type="text"
          className="form-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          id="email"
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
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
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default SignupForm;
