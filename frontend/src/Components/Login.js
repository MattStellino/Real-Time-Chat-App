import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../actions/authActions';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const toast = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please enter all fields', life: 3000 });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'USER_LOGIN', payload: { token: data.token } }); // Update auth state
        dispatch({ type: 'SET_USER', payload: data.user });

        // Debugging: Log the data received from the server
        console.log('Login response data:', data);

        dispatch(loginUser(data));
        toast.current.show({ severity: 'success', summary: 'Success', detail: 'Logged in successfully', life: 3000 });
        setEmail('');
        setPassword('');
        navigate('/chats');
      } else {
        // Debugging: Log the error response
        console.error('Login error response:', response);

        toast.current.show({ severity: 'error', summary: 'Login Error', detail: 'Login failed', life: 3000 });
      }
    } catch (error) {
      // Debugging: Log any errors that occur during the login process
      console.error('Login error:', error);

      toast.current.show({ severity: 'error', summary: 'Login Error', detail: error.message, life: 3000 });
    }

    setLoading(false);
  };
  

  return (
    <div className="login-card">
      <Card className="p-fluid">
        <form onSubmit={handleSubmit}>
          <div className="p-field">
            <label htmlFor="email">Email</label><br/><br/>
            <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="p-field">
            <label htmlFor="password">Password</label><br/><br/>
            <InputText id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button label="Login" icon="pi pi-sign-in" disabled={loading} />
        </form>
      </Card>
      <Toast ref={toast} />
    </div>
  );
};

export default Login;
