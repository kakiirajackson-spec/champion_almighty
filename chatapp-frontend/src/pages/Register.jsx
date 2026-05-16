import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
  });
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check username availability with debounce
  useEffect(() => {
    const username = formData.username.trim();
    if (!username) { setUsernameStatus(null); return; }

    const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
    if (!usernameRegex.test(username)) {
      setUsernameStatus('invalid');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/check-username?username=${username}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'taken') return alert('Username is already taken.');
    if (usernameStatus === 'invalid') return alert('Username is invalid.');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert('Account Created! Please login.');
        navigate('/login');
      } else {
        alert(data.message || 'Registration Failed');
      }
    } catch (err) {
      console.error('Registration Error:', err);
      alert('Cannot connect to server. Is your Node.js running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  const usernameHint = () => {
    if (!formData.username) return null;
    if (usernameStatus === 'checking') return { color: '#71717a', text: 'Checking...' };
    if (usernameStatus === 'available') return { color: '#22c55e', text: '✓ Username available' };
    if (usernameStatus === 'taken') return { color: '#ef4444', text: '✗ Username already taken' };
    if (usernameStatus === 'invalid') return { color: '#f59e0b', text: 'Only letters, numbers, . and _ allowed (3-30 chars)' };
    return null;
  };

  const hint = usernameHint();

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans text-white">
      <div className="w-full max-w-[380px] space-y-4">
        <div className="bg-black border border-zinc-800 p-10 rounded-xl shadow-2xl text-center">
          <h1 className="text-4xl font-black italic tracking-tighter mb-2">ChatApp</h1>
          <p className="text-zinc-500 font-bold text-sm mb-6 uppercase">Create your account</p>

          <form className="space-y-2" onSubmit={handleRegister}>

            {/* Full name — not unique, just display name */}
            <input
              name="full_name"
              type="text"
              placeholder="Full Name (optional)"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-zinc-500"
              onChange={handleChange}
            />

            {/* Email */}
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-zinc-500"
              onChange={handleChange}
              required
            />

            {/* Username — unique */}
            <div>
              <input
                name="username"
                type="text"
                placeholder="Username (unique, e.g. badman_99)"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-zinc-500"
                onChange={handleChange}
                required
              />
              {hint && (
                <p style={{ fontSize: 11, color: hint.color, textAlign: 'left', marginTop: 4, paddingLeft: 2 }}>
                  {hint.text}
                </p>
              )}
            </div>

            {/* Password */}
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-xs focus:outline-none focus:border-zinc-500"
              onChange={handleChange}
              required
            />

            <button
              type="submit"
              disabled={loading || usernameStatus === 'taken' || usernameStatus === 'invalid'}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm mt-4 transition-all"
              style={{ opacity: (loading || usernameStatus === 'taken' || usernameStatus === 'invalid') ? 0.6 : 1 }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <div className="bg-black border border-zinc-800 p-6 rounded-xl text-center text-sm">
          Have an account?{' '}
          <Link to="/login" className="text-blue-500 font-bold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;