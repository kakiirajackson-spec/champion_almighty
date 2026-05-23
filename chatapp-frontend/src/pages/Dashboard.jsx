import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Film, MessageCircle, Bell } from 'lucide-react';
import HomeFeed from './HomeFeed';
import SearchPage from './SearchPage';
import Reels from './Reels';
import DMs from './DMs';
import Profile from './Profile';
import CreatePost from './CreatePost';
import Notifications from './Notifications';
import Settings from './Settings';
import { BACKEND_URL } from '../api';

const imgSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const token = localStorage.getItem('token');
  const [active, setActive] = useState('home');
  const [viewUserId, setViewUserId] = useState(null);
  const [dmUserId, setDmUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hoveredNav, setHoveredNav] = useState(null);

  useEffect(() => { if (!token) navigate('/login'); }, []);

  useEffect(() => {
    const onStorage = () => setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (active === 'profile') setUser(JSON.parse(localStorage.getItem('user') || 'null'));
  }, [active]);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('https://champion-almighty.onrender.com/api/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();
        const convs = Array.isArray(data) ? data : [];
        setUnreadCount(convs.filter(c => c.unread_count > 0).length);
      } catch (err) {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleViewProfile = (userId) => {
    setViewUserId(userId);
    setActive('profile');
  };

  const handleGoToDMs = (userId) => {
    setDmUserId(userId);
    setActive('dms');
  };

  const handleNavClick = (page) => {
    if (page !== 'profile') setViewUserId(null);
    if (page !== 'dms') setDmUserId(null);
    setActive(page);
  };

  const renderPage = () => {
    switch (active) {
      case 'home': return <HomeFeed token={token} currentUser={user} onViewProfile={handleViewProfile} />;
      case 'search': return <SearchPage token={token} currentUser={user} onViewProfile={handleViewProfile} />;
      case 'create': return <CreatePost token={token} currentUser={user} onDone={() => setActive('home')} />;
      case 'reels': return <Reels token={token} currentUser={user} />;

      // ✅ ONLY FIX IS HERE 👇
      case 'dms': return <DMs token={token} currentUser={user} openUserId={dmUserId} onUnreadCount={setUnreadCount} />;

      case 'notifications': return <Notifications token={token} currentUser={user} onViewProfile={handleViewProfile} />;
      case 'settings': return <Settings onBack={() => setActive('profile')} />;

      case 'profile': return (
        <Profile
          token={token}
          currentUser={user}
          userId={viewUserId || user?.id}
          onBack={viewUserId ? () => { setViewUserId(null); setActive('search'); } : null}
          onViewProfile={handleViewProfile}
          onGoToDMs={handleGoToDMs}
          onSettings={() => setActive('settings')}
        />
      );

      default:
        return <HomeFeed token={token} currentUser={user} onViewProfile={handleViewProfile} />;
    }
  };

  return (
    <div>
      {renderPage()}
    </div>
  );
};

export default Dashboard;