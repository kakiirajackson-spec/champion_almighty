import React, { useState, useEffect } from 'react';
import { Search, X, UserCheck, UserPlus } from 'lucide-react';
import { API, BACKEND_URL } from '../api';

// Smart image URL helper
const imgSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const SearchPage = ({ onViewProfile }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [loadingFollow, setLoadingFollow] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Load ALL users on mount using /users/all
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [usersRes, followingRes] = await Promise.all([
          fetch(`${API}/users/all`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/follows/my/following`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const users = await usersRes.json();
        const following = await followingRes.json();

        const userList = Array.isArray(users) ? users : [];
        setAllUsers(userList);

        // Build follow status from following list
        const statuses = {};
        if (Array.isArray(following)) {
          following.forEach(u => { statuses[u.id] = true; });
        }
        setFollowStatus(statuses);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  // Search by typing — filters allUsers locally OR calls backend
  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }

    // First filter locally for instant feedback
    const local = allUsers.filter(u =>
      u.username?.toLowerCase().includes(q.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(q.toLowerCase())
    );
    setResults(local);

    // Also call backend for accuracy
    try {
      const res = await fetch(`${API}/users/search?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
        // Update follow status for new results
        const statuses = { ...followStatus };
        data.forEach(u => {
          if (statuses[u.id] === undefined) statuses[u.id] = false;
        });
        setFollowStatus(statuses);
      }
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

  const displayUsers = query ? results : allUsers;

  const UserRow = ({ u }) => {
    const isFollowing = followStatus[u.id];
    const isLoading = loadingFollow[u.id];
    const isMe = Number(u.id) === Number(currentUser?.id);

    return (
      <div
        onClick={() => onViewProfile && onViewProfile(u.id)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = '#18181b'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {u.profile_picture ? (
              <img
                src={imgSrc(u.profile_picture)}
                alt={u.username}
                style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
              />
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
            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.username}
            </p>
            <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {u.full_name || u.bio || (u.status === 'online' ? 'Active now' : 'Offline')}
            </p>
          </div>
        </div>

        {!isMe && (
          <button
            onClick={(e) => handleFollowToggle(e, u)}
            disabled={isLoading}
            style={{
              marginLeft: 12, padding: '7px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: isFollowing ? '1px solid #3f3f46' : 'none',
              background: isFollowing ? 'transparent' : '#2563eb',
              color: isFollowing ? '#a1a1aa' : '#fff',
              display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0, opacity: isLoading ? 0.6 : 1,
            }}
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
      {!query && !loading && allUsers.length > 0 && (
        <p style={{ fontSize: 13, fontWeight: 700, color: '#a1a1aa', margin: '0 0 8px 4px', textTransform: 'uppercase', letterSpacing: 1 }}>
          People
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#52525b', fontSize: 14 }}>
          Loading...
        </div>
      )}

      {/* No results when searching */}
      {!loading && query && results.length === 0 && (
        <p style={{ textAlign: 'center', color: '#52525b', fontSize: 14, padding: '48px 0' }}>
          No results for "{query}"
        </p>
      )}

      {/* Users list */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {displayUsers.map(u => <UserRow key={u.id} u={u} />)}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #52525b; }
      `}</style>
    </div>
  );
};

export default SearchPage;