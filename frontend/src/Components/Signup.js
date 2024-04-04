import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';

import '../styles.css';
import 'primeflex/primeflex.css';

const SignupForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const toast = useRef(null);

  const register = async () => {
    if (!username || !password || !email) {
      toast.current.show({ 
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter all fields',
        life: 3000 
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }) // Include email in the request
      });

      if (response.ok) {
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'User registered successfully', life: 3000 });
        setUsername('');
        setPassword('');
        setEmail('');
      } else {
        toast.current.show({ 
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to register user',
          life: 3000 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.current.show({ 
        severity: 'error',
        summary: 'Error', 
        detail: 'Registration failed',
        life: 3000 
      });
    }
  };

  return (
    <div className="signup-card"> {/* Apply the signup-card styling */}
      <Toast ref={toast} />
      <Card className="p-card"> {/* Apply the card styling */}
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="username">Username</label>
            <InputText id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="p-field">
            <label htmlFor="email">Email</label>
            <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="p-field">
            <label htmlFor="password">Password</label>
            <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button label="Register" className="p-button" onClick={register} /> {/* Apply the button styling */}
        </div>
      </Card>
    </div>
  );
};

export default SignupForm;
