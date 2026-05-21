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

// Fix for both Cloudinary and local URLs
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

  const handleViewProfile = (userId) => { setViewUserId(userId); setActive('profile'); };
  const handleGoToDMs = (userId) => { setDmUserId(userId); setActive('dms'); };
  const handleNavClick = (page) => {
    if (page !== 'profile') setViewUserId(null);
    if (page !== 'dms') setDmUserId(null);
    setActive(page);
  };

  const profilePic = user?.profile_picture;

  const renderPage = () => {
    switch (active) {
      case 'home': return <HomeFeed token={token} currentUser={user} onViewProfile={handleViewProfile} />;
      case 'search': return <SearchPage token={token} currentUser={user} onViewProfile={handleViewProfile} />;
      case 'create': return <CreatePost token={token} currentUser={user} onDone={() => setActive('home')} />;
      case 'reels': return <Reels token={token} currentUser={user} />;
      case 'dms': return <DMs token={token} currentUser={user} openUserId={dmUserId} />;
      case 'notifications': return <Notifications token={token} currentUser={user} onViewProfile={handleViewProfile} />;
      case 'settings': return <Settings onBack={() => setActive('profile')} />;
      case 'profile': return (
        <Profile
          token={token} currentUser={user}
          userId={viewUserId || user?.id}
          onBack={viewUserId ? () => { setViewUserId(null); setActive('search'); } : null}
          onViewProfile={handleViewProfile}
          onGoToDMs={handleGoToDMs}
          onSettings={() => setActive('settings')}
        />
      );
      default: return <HomeFeed token={token} currentUser={user} onViewProfile={handleViewProfile} />;
    }
  };

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', filled: true },
    { id: 'search', icon: Search, label: 'Search', filled: false },
    { id: 'reels', icon: Film, label: 'Reels', filled: true },
    { id: 'dms', icon: MessageCircle, label: 'Messages', filled: true, badge: unreadCount },
    { id: 'notifications', icon: Bell, label: 'Notifications', filled: false, badge: unreadCount },
    { id: 'create', icon: PlusSquare, label: 'Create', filled: false },
  ];

  const Tooltip = ({ label }) => (
    <div style={{
      position: 'absolute', left: 58, top: '50%', transform: 'translateY(-50%)',
      background: '#18181b', border: '1px solid #27272a', borderRadius: 8,
      padding: '6px 12px', fontSize: 13, fontWeight: 600, color: '#fff',
      whiteSpace: 'nowrap', zIndex: 999, pointerEvents: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
    }}>
      {label}
    </div>
  );

  const ProfileAvatar = ({ size = 28, ring = false }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden',
      boxShadow: ring ? '0 0 0 2px #fff' : 'none', flexShrink: 0,
    }}>
      {profilePic
        ? <img src={imgSrc(profilePic)} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 700, color: '#fff' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
      }
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#fff', overflow: 'hidden' }}>

      {/* LEFT SIDEBAR */}
      <div className="sidebar-desktop" style={{
        width: 72, flexShrink: 0, borderRight: '1px solid #27272a',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '12px 0', position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 20, background: '#000',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 20, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 26, fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(to right,#ec4899,#ef4444,#eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>C</span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
          {navItems.map(({ id, icon: Icon, label, filled, badge }) => {
            const isActive = active === id;
            const isHovered = hoveredNav === id;
            return (
              <div key={id} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => handleNavClick(id)}
                  onMouseEnter={() => setHoveredNav(id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{ width: 48, height: 48, borderRadius: 12, background: isActive ? '#18181b' : isHovered ? '#111' : 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', position: 'relative' }}>
                  <Icon size={26} fill={isActive && filled ? '#fff' : 'none'} color={isActive ? '#fff' : '#a1a1aa'} strokeWidth={isActive ? 2.5 : 2} />
                  {badge > 0 && (
                    <span style={{ position: 'absolute', top: 6, right: 6, background: '#ef4444', borderRadius: '50%', width: 14, height: 14, fontSize: 8, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </button>
                {isHovered && <Tooltip label={label} />}
              </div>
            );
          })}

          {/* Profile button */}
          {(() => {
            const isActive = active === 'profile';
            const isHovered = hoveredNav === 'profile';
            return (
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => handleNavClick('profile')}
                  onMouseEnter={() => setHoveredNav('profile')}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{ width: 48, height: 48, borderRadius: 12, background: isActive ? '#18181b' : isHovered ? '#111' : 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
                  <ProfileAvatar size={28} ring={isActive} />
                </button>
                {isHovered && <Tooltip label="Profile" />}
              </div>
            );
          })()}
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content" style={{ flex: 1, marginLeft: 72, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #27272a', flexShrink: 0, background: '#000' }}>
          <span style={{ fontSize: 22, fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(to right,#ec4899,#ef4444,#eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ChatApp</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }} onClick={() => handleNavClick('notifications')}>
            <Bell size={24} color={active === 'notifications' ? '#fff' : '#71717a'} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {renderPage()}
        </div>

        {/* Mobile bottom nav */}
        <div className="mobile-nav" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-around', height: 56, borderTop: '1px solid #27272a', background: '#000', flexShrink: 0 }}>
          {[
            { id: 'home', icon: Home, filled: true },
            { id: 'search', icon: Search, filled: false },
            { id: 'create', icon: PlusSquare, filled: false },
            { id: 'dms', icon: MessageCircle, filled: true },
          ].map(({ id, icon: Icon, filled }) => (
            <button key={id} onClick={() => handleNavClick(id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
              <Icon size={26} fill={active === id && filled ? '#fff' : 'none'} color={active === id ? '#fff' : '#71717a'} />
            </button>
          ))}
          <button onClick={() => handleNavClick('profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <ProfileAvatar size={28} ring={active === 'profile'} />
          </button>
        </div>
      </div>

      {/* Messages floating bubble */}
      <button className="messages-bubble" onClick={() => handleNavClick('dms')}
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 30, background: '#18181b', border: '1px solid #27272a', borderRadius: 24, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', color: '#fff', fontSize: 15, fontWeight: 600, boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
        onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
        onMouseLeave={e => e.currentTarget.style.background = '#18181b'}>
        <MessageCircle size={20} color="#fff" />
        Messages
        {unreadCount > 0 && (
          <span style={{ background: '#ef4444', borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <style>{`
        @media (max-width: 900px) {
          .sidebar-desktop { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-nav { display: flex !important; }
          .messages-bubble { display: none !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default Dashboard;