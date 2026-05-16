import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Film, MessageCircle, Bell, Compass } from 'lucide-react';
import HomeFeed from './HomeFeed';
import SearchPage from './SearchPage';
import Reels from './Reels';
import DMs from './DMs';
import Profile from './Profile';
import CreatePost from './CreatePost';
import Notifications from './Notifications';
import Settings from './Settings';
import { BACKEND_URL } from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const token = localStorage.getItem('token');
  const [active, setActive] = useState('home');
  const [viewUserId, setViewUserId] = useState(null);
  const [dmUserId, setDmUserId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // Nav items
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', filled: true },
    { id: 'search', icon: Search, label: 'Search', filled: false },
    { id: 'reels', icon: Film, label: 'Reels', filled: true },
    { id: 'dms', icon: MessageCircle, label: 'Messages', filled: true, badge: unreadCount },
    { id: 'notifications', icon: Bell, label: 'Notifications', filled: true, badge: unreadCount },
    { id: 'create', icon: PlusSquare, label: 'Create', filled: false },
  ];

  const SidebarAvatar = () => (
    <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: active === 'profile' ? '0 0 0 2px #fff' : 'none' }}>
      {profilePic
        ? <img src={`${BACKEND_URL}${profilePic}`} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
      }
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#fff', overflow: 'hidden' }}>

      {/* ── LEFT SIDEBAR (desktop only) ── */}
      <div style={{
        width: 240, flexShrink: 0, borderRight: '1px solid #27272a',
        display: 'flex', flexDirection: 'column', padding: '16px 12px',
        position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 20,
        background: '#000',
      }}
      className="sidebar-desktop"
      >
        {/* Logo */}
        <div style={{ padding: '16px 12px 24px' }}>
          <span style={{ fontSize: 24, fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(to right,#ec4899,#ef4444,#eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ChatApp
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(({ id, icon: Icon, label, filled, badge }) => (
            <button key={id} onClick={() => handleNavClick(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 12px', borderRadius: 12,
                background: active === id ? '#18181b' : 'none',
                border: 'none', cursor: 'pointer', color: '#fff',
                textAlign: 'left', width: '100%', transition: 'background 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (active !== id) e.currentTarget.style.background = '#111'; }}
              onMouseLeave={e => { if (active !== id) e.currentTarget.style.background = 'none'; }}
            >
              <div style={{ position: 'relative' }}>
                <Icon
                  size={26}
                  fill={active === id && filled ? '#fff' : 'none'}
                  color={active === id ? '#fff' : '#a1a1aa'}
                  strokeWidth={active === id ? 2.5 : 2}
                />
                {badge > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -6, background: '#ef4444', borderRadius: '50%', width: 16, height: 16, fontSize: 9, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 15, fontWeight: active === id ? 700 : 400, color: active === id ? '#fff' : '#a1a1aa' }}>
                {label}
              </span>
            </button>
          ))}

          {/* Profile */}
          <button onClick={() => handleNavClick('profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              padding: '12px 12px', borderRadius: 12,
              background: active === 'profile' ? '#18181b' : 'none',
              border: 'none', cursor: 'pointer', color: '#fff',
              textAlign: 'left', width: '100%', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (active !== 'profile') e.currentTarget.style.background = '#111'; }}
            onMouseLeave={e => { if (active !== 'profile') e.currentTarget.style.background = 'none'; }}
          >
            <SidebarAvatar />
            <span style={{ fontSize: 15, fontWeight: active === 'profile' ? 700 : 400, color: active === 'profile' ? '#fff' : '#a1a1aa' }}>
              Profile
            </span>
          </button>
        </nav>

        {/* Bottom: username */}
        <div style={{ padding: '12px', borderTop: '1px solid #27272a', display: 'flex', alignItems: 'center', gap: 10 }}>
          <SidebarAvatar />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</p>
            <p style={{ fontSize: 11, color: '#71717a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name || user?.email}</p>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        className="main-content"
      >
        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #27272a', flexShrink: 0, background: '#000' }}>
          <span style={{ fontSize: 22, fontWeight: 900, fontStyle: 'italic', background: 'linear-gradient(to right,#ec4899,#ef4444,#eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ChatApp
          </span>
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
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 0 }}>
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
          <button onClick={() => handleNavClick('profile')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', boxShadow: active === 'profile' ? '0 0 0 2px #fff' : 'none' }}>
              {profilePic
                ? <img src={`${BACKEND_URL}${profilePic}`} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
              }
            </div>
          </button>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) {
          .sidebar-desktop { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;