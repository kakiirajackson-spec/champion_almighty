import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, Eye, EyeOff } from 'lucide-react';

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
      const response = await fetch('http://localhost:5000/api/auth/login', {
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-black font-sans text-white">
      <div className="flex flex-col md:flex-row max-w-5xl w-full gap-12 items-center justify-center">

        {/* Left Side: Logo */}
        <div className="hidden md:flex flex-col items-center space-y-6 flex-1">
          <div className="p-[3px] rounded-[24px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]">
            <div className="bg-black rounded-[22px] p-5">
              <Send size={60} color="white" />
            </div>
          </div>
          <h1 className="text-[3rem] font-black italic tracking-tighter">ChatApp</h1>
          <p className="text-zinc-500 text-lg">Connect with your world in real-time.</p>
        </div>

        {/* Right Side: Form */}
        <div className="w-full max-w-sm space-y-4">
          <div className="bg-black border border-zinc-800 rounded-xl p-10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
            <form className="space-y-4" onSubmit={handleLogin}>

              <input
                type="text"
                placeholder="Email or Username"
                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-md text-white text-sm focus:outline-none focus:border-zinc-500"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-md text-white text-sm focus:outline-none focus:border-zinc-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0095f6] hover:bg-[#1877f2] text-white font-bold rounded-lg text-sm mt-2 transition-all active:scale-95"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-[1px] bg-zinc-800"></div>
                <span className="text-xs text-zinc-500 font-bold tracking-widest">OR</span>
                <div className="flex-1 h-[1px] bg-zinc-800"></div>
              </div>

              <div className="text-center">
                <Link to="/reset" className="text-xs text-zinc-400 hover:text-white">Forgot password?</Link>
              </div>
            </form>
          </div>

          <div className="bg-black border border-zinc-800 rounded-xl p-5 text-center text-sm shadow-xl">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0095f6] font-bold hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;