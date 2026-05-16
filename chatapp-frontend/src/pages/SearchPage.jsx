import React, { useState, useEffect } from 'react';
import { Search, X, UserCheck, UserPlus } from 'lucide-react';
import { API, BACKEND_URL } from '../api';

const SearchPage = ({ onViewProfile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [loadingFollow, setLoadingFollow] = useState({});

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Load suggested users on mount
  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const res = await fetch(`${API}/users/search?q=`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const users = Array.isArray(data) ? data.slice(0, 20) : [];
        setSuggested(users);

        // Check follow status
        const statuses = {};
        await Promise.all(users.map(async (u) => {
          try {
            const r = await fetch(`${API}/follows/check/${u.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const d = await r.json();
            statuses[u.id] = d.isFollowing;
          } catch { statuses[u.id] = false; }
        }));
        setFollowStatus(statuses);
      } catch (err) { console.error(err); }
    };
    fetchSuggested();
  }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    try {
      const res = await fetch(`${API}/users/search?q=${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const users = Array.isArray(data) ? data : [];
      setResults(users);

      const statuses = { ...followStatus };
      await Promise.all(users.map(async (u) => {
        if (statuses[u.id] === undefined) {
          try {
            const r = await fetch(`${API}/follows/check/${u.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const d = await r.json();
            statuses[u.id] = d.isFollowing;
          } catch { statuses[u.id] = false; }
        }
      }));
      setFollowStatus(statuses);
    } catch (err) { console.error(err); }
  };

  const handleFollowToggle = async (e, u) => {
    e.stopPropagation();
    setLoadingFollow(prev => ({ ...prev, [u.id]: true }));
    const isFollowing = followStatus[u.id];
    try {
      await fetch(`${API}/follows/${u.id}`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowStatus(prev => ({ ...prev, [u.id]: !isFollowing }));
    } catch (err) { console.error(err); }
    setLoadingFollow(prev => ({ ...prev, [u.id]: false }));
  };

  const clearSearch = () => { setQuery(''); setResults([]); };

  const displayUsers = query ? results : suggested;

  const UserRow = ({ u }) => {
    const isFollowing = followStatus[u.id];
    const isLoading = loadingFollow[u.id];
    const isMe = Number(u.id) === Number(currentUser?.id);

    return (
      <div
        key={u.id}
        onClick={() => onViewProfile && onViewProfile(u.id)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = '#18181b'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {u.profile_picture ? (
              <img src={`${BACKEND_URL}${u.profile_picture}`} alt={u.username}
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#fff' }}>
                {u.username?.[0]?.toUpperCase()}
              </div>
            )}
            {u.status === 'online' && (
              <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid #09090b' }} />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</p>
            <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.bio || (u.status === 'online' ? 'Active now' : 'Offline')}
            </p>
          </div>
        </div>

        {!isMe && (
          <button
            onClick={(e) => handleFollowToggle(e, u)}
            disabled={isLoading}
            style={{ marginLeft: 12, padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: isLoading ? 'not-allowed' : 'pointer', border: isFollowing ? '1px solid #3f3f46' : 'none', background: isFollowing ? 'transparent' : '#2563eb', color: isFollowing ? '#a1a1aa' : '#fff', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? (
              <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
            ) : isFollowing ? (
              <><UserCheck size={14} /> Following</>
            ) : (
              <><UserPlus size={14} /> Follow</>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '16px 16px 80px' }}>
      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
        <input
          type="text"
          placeholder="Search people..."
          value={query}
          onChange={handleSearch}
          style={{ width: '100%', background: '#18181b', border: '1px solid #27272a', borderRadius: 12, padding: '12px 40px', fontSize: 14, color: '#fff', outline: 'none', boxSizing: 'border-box' }}
        />
        {query && (
          <button onClick={clearSearch} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: '#3f3f46', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            <X size={12} color="#fff" />
          </button>
        )}
      </div>

      {/* Section title */}
      {!query && suggested.length > 0 && (
        <p style={{ fontSize: 13, fontWeight: 700, color: '#a1a1aa', margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: 1 }}>Suggested</p>
      )}

      {/* No results */}
      {query && results.length === 0 && (
        <p style={{ textAlign: 'center', color: '#52525b', fontSize: 14, padding: '48px 0' }}>No results for "{query}"</p>
      )}

      {/* Users list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {displayUsers.map(u => <UserRow key={u.id} u={u} />)}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #52525b; }
      `}</style>
    </div>
  );
};

export default SearchPage;