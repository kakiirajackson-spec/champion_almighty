import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Film, MessageCircle, Bell, Bookmark, Settings as SettingsIcon, User, Compass } from 'lucide-react';
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

  const ProfileAvatar = ({ size = 28, ring = false }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      boxShadow: ring ? '0 0 0 2px #fff, 0 0 0 4px #ef4444' : 'none',
    }}>
      {profilePic
        ? <img src={imgSrc(profilePic)} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 700, color: '#fff' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
      }
    </div>
  );

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Compass, label: 'Discover' },
    { id: 'reels', icon: Film, label: 'Reels' },
    { id: 'dms', icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { id: 'create', icon: PlusSquare, label: 'Create' },
    { id: 'profile', icon: null, label: 'Profile' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#fff', overflow: 'hidden' }}>

      {/* ── DESKTOP LEFT SIDEBAR ── */}
      <div className="sidebar-desktop" style={{
        width: 220, flexShrink: 0,
        borderRight: '1px solid #1c1c1e',
        display: 'flex', flexDirection: 'column',
        padding: '20px 0 16px',
        position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 20, background: '#000',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#ec4899,#ef4444,#eab308)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 900, fontStyle: 'italic', color: '#fff' }}>C</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>ChatVitte</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 10px' }}>
          {navItems.map(({ id, icon: Icon, label, badge }) => {
            const isActive = active === id;
            return (
              <button key={id} onClick={() => handleNavClick(id)} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '11px 14px', borderRadius: 12,
                background: isActive ? '#1c1c1e' : 'none',
                border: 'none', cursor: 'pointer',
                color: isActive ? '#fff' : '#6b6b6b',
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s', position: 'relative',
                textAlign: 'left', width: '100%',
              }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#111'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'none'; e.currentTarget.style.color = isActive ? '#fff' : '#6b6b6b'; }}
              >
                {id === 'profile'
                  ? <ProfileAvatar size={22} ring={isActive} />
                  : <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                }
                <span>{label}</span>
                {/* Active indicator */}
                {isActive && id === 'home' && (
                  <div style={{ position: 'absolute', left: 0, top: '20%', height: '60%', width: 3, borderRadius: '0 3px 3px 0', background: '#ef4444' }} />
                )}
                {badge > 0 && (
                  <span style={{ marginLeft: 'auto', background: '#ef4444', borderRadius: 99, minWidth: 18, height: 18, fontSize: 10, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom user card */}
        <div style={{ padding: '12px 14px', margin: '0 10px', borderRadius: 14, background: '#0a0a0a', border: '1px solid #1c1c1e', display: 'flex', alignItems: 'center', gap: 10 }}>
          <ProfileAvatar size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username || 'You'}</p>
            <p style={{ fontSize: 11, color: '#4b4b4b', margin: 0 }}>@{user?.username?.toLowerCase() || 'user'}</p>
          </div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="main-content" style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mobile top bar */}
        <div className="mobile-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #1c1c1e', flexShrink: 0, background: '#000' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#ec4899,#ef4444,#eab308)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 900, fontStyle: 'italic', color: '#fff' }}>C</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>ChatVitte</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleNavClick('search')}>
              <Search size={22} color="#fff" />
            </button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }} onClick={() => handleNavClick('notifications')}>
              <Bell size={22} color="#fff" />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -3, right: -3, background: '#ef4444', borderRadius: '50%', width: 14, height: 14, fontSize: 8, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <ProfileAvatar size={30} ring={active === 'profile'} />
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {renderPage()}
        </div>

        {/* Mobile bottom nav */}
        <div className="mobile-nav" style={{
          display: 'none', alignItems: 'center', justifyContent: 'space-around',
          height: 64, borderTop: '1px solid #1c1c1e',
          background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
          flexShrink: 0, paddingBottom: 4,
        }}>
          {[
            { id: 'home', icon: Home },
            { id: 'search', icon: Compass },
            { id: 'create', icon: null },
            { id: 'dms', icon: MessageCircle },
            { id: 'profile', icon: null },
          ].map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => handleNavClick(id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, position: 'relative', flex: 1 }}>
              {id === 'create' ? (
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#ec4899,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(168,85,247,0.4)' }}>
                  <span style={{ fontSize: 26, color: '#fff', lineHeight: 1, marginTop: -1 }}>+</span>
                </div>
              ) : id === 'profile' ? (
                <ProfileAvatar size={26} ring={active === 'profile'} />
              ) : (
                <Icon size={24} strokeWidth={active === id ? 2.5 : 1.8} color={active === id ? '#fff' : '#4b4b4b'} />
              )}
              {id === 'dms' && unreadCount > 0 && (
                <span style={{ position: 'absolute', top: 4, right: 'calc(50% - 18px)', background: '#ef4444', borderRadius: '50%', width: 14, height: 14, fontSize: 8, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .sidebar-desktop { display: none !important; }
          .main-content { margin-left: 0 !important; }
          .mobile-topbar { display: flex !important; }
          .mobile-nav { display: flex !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #1c1c1e; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default Dashboard;