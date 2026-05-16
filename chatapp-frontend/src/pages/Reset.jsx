import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API } from '../api';

const Reset = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API}/auth/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setSent(true);
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (err) {
      alert('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 text-white">
      <div className="w-full max-w-[380px] bg-black border border-zinc-800 p-10 rounded-xl text-center">
        <div className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={40} />
        </div>
        <h2 className="font-bold mb-2">Trouble logging in?</h2>
        <p className="text-xs text-zinc-400 mb-6">Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className="text-green-400 text-sm font-bold mb-6">
            ✅ Reset link sent! Check your email.
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <input
              type="email"
              placeholder="Email"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md py-2 px-3 text-xs mb-4 text-white focus:outline-none focus:border-zinc-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-1.5 rounded-lg text-sm mb-6 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Login Link'}
            </button>
          </form>
        )}

        <Link to="/login" className="text-xs font-bold hover:text-zinc-400 transition-colors">
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default Reset;