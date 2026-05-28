import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, Eye, EyeOff } from 'lucide-react';
import { API } from '../api';

const Login = () => {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        alert(data.message || 'Login Failed');
      }
    } catch (err) {
      console.error('Backend Connection Error:', err);
      alert('Cannot connect to server. Is your Node.js running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#0b0d14', fontFamily: 'sans-serif', color: '#fff' }}>
      <div style={{ display: 'flex', flexDirection: 'row', maxWidth: '900px', width: '100%', gap: '48px', alignItems: 'center', justifyContent: 'center' }}>

        {/* Left Side: Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', flex: '1' }}>
          <div style={{ padding: '3px', borderRadius: '24px', background: 'linear-gradient(135deg, #f09433, #dc2743, #bc1888)' }}>
            <div style={{ background: '#0b0d14', borderRadius: '22px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={60} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-2px', margin: 0, color: '#fff' }}>ChatVitte</h1>
          <p style={{ color: '#71717a', fontSize: '18px', margin: 0 }}>Connect with your world in real-time.</p>
        </div>

        {/* Right Side: Form */}
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#111118', border: '1px solid #27272a', borderRadius: '16px', padding: '40px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', textAlign: 'center', color: '#fff', marginTop: 0 }}>Login</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <input
                type="text"
                placeholder="Email or Username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif' }}
              />

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', padding: '12px', paddingRight: '44px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #ff4d00, #c800ff)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '700', fontSize: '14px', marginTop: '8px', cursor: 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'sans-serif' }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#27272a' }}></div>
                <span style={{ fontSize: '11px', color: '#71717a', fontWeight: '700', letterSpacing: '2px' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#27272a' }}></div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Link to="/reset" style={{ fontSize: '12px', color: '#a1a1aa', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
            </form>
          </div>

          <div style={{ background: '#111118', border: '1px solid #27272a', borderRadius: '16px', padding: '20px', textAlign: 'center', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#ff4d00', fontWeight: '700', textDecoration: 'none' }}>Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;