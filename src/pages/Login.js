import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Divider } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const API_BASE = process.env.REACT_APP_API_BASE || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLogin();
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  // Google login success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLogin();
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  // GitHub login success handler
  const handleGithubSuccess = async (response) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: response.code })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        onLogin();
      } else {
        setError(data.message || 'GitHub login failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const handleGithubFailure = (response) => {
    setError('GitHub login failed');
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f6fa">
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" align="center" gutterBottom>Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
        </form>
        <Divider sx={{ my: 2 }}>or</Divider>
        <Box display="flex" flexDirection="column" gap={2}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google login failed')}
          />
          <GitHubLogin
            clientId="Ov23liKw2QdB9reywvB1"
            onSuccess={handleGithubSuccess}
            onFailure={handleGithubFailure}
            buttonText="Login with GitHub"
            redirectUri={typeof window !== 'undefined' ? window.location.origin : ''}
            className="github-btn"
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default Login; 