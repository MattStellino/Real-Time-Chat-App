import React, { useState, useEffect } from 'react';
import Login from '../Components/Login';
import Signup from '../Components/Signup';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Homepage = () => {
  const [selectedOption, setSelectedOption] = useState('login');
  const navigate = useNavigate();
  const { user, initialCheckDone } = useSelector((state) => state.auth); 

  useEffect(() => {
    if (initialCheckDone && user) {
      navigate("/chats"); 
    }
  }, [user, initialCheckDone, navigate]);

  return (
    <div className="home-con">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome to ChatApp</h1>
            <p className="auth-subtitle">Connect with friends and family</p>
          </div>
          
          <div className="auth-form">
            <div className="form-group">
              <label className="form-label">Choose an option:</label>
              <div style={{ display: 'flex', gap: 'var(--gap-2)' }}>
                <button
                  className={`auth-toggle ${selectedOption === 'login' ? 'active' : ''}`}
                  onClick={() => setSelectedOption('login')}
                  style={{
                    background: selectedOption === 'login' ? 'var(--brand)' : 'transparent',
                    color: selectedOption === 'login' ? 'white' : 'var(--text)',
                    padding: 'var(--gap-2) var(--gap-3)',
                    borderRadius: 'calc(var(--radius) - 4px)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                >
                  Login
                </button>
                <button
                  className={`auth-toggle ${selectedOption === 'signup' ? 'active' : ''}`}
                  onClick={() => setSelectedOption('signup')}
                  style={{
                    background: selectedOption === 'signup' ? 'var(--brand)' : 'transparent',
                    color: selectedOption === 'signup' ? 'white' : 'var(--text)',
                    padding: 'var(--gap-2) var(--gap-3)',
                    borderRadius: 'calc(var(--radius) - 4px)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                >
                  Signup
                </button>
              </div>
            </div>
            
            {selectedOption === 'login' && <Login />}
            {selectedOption === 'signup' && <Signup />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Homepage;
