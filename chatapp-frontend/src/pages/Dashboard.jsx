import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Film, MessageCircle, Bell, Compass, Settings, Bookmark, User, Plus } from 'lucide-react';
import HomeFeed from './HomeFeed';
import SearchPage from './SearchPage';
import Reels from './Reels';
import DMs from './DMs';
import Profile from './Profile';
import CreatePost from './CreatePost';
import Notifications from './Notifications';
import SettingsPage from './Settings';
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

  useEffect(() => { if (!token) navigate('/login'); }, []);

  const handleViewProfile = (userId) => { setViewUserId(userId); setActive('profile'); };
  const handleGoToDMs = (userId) => { setDmUserId(userId); setActive('dms'); };
  const handleNavClick = (page) => {
    if (page !== 'profile') setViewUserId(null);
    if (page !== 'dms') setDmUserId(null);
    setActive(page);
  };

  const ProfileAvatar = ({ size = 28, ring = false }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: ring ? '0 0 0 2px #ff4d00' : 'none' }}>
      {user?.profile_picture ? (
        <img src={imgSrc(user.profile_picture)} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ff4d00, #c800ff)', color: '#fff', fontWeight: 700, fontSize: size * 0.4 }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Discover', icon: Compass },
    { id: 'reels', label: 'Reels', icon: Film },
    { id: 'dms', label: 'Messages', icon: MessageCircle, badge: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: true },
    { id: 'create', label: 'Create', icon: PlusSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const mobileNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Discover', icon: Compass },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'dms', label: 'Messages', icon: MessageCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div style={{ display: 'flex', height: '100svh', background: '#0b0d14', color: '#fff', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        /* ── SIDEBAR ── */
        .cv-sidebar {
          width: 250px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: #0b0d14;
          border-right: 1px solid #141420;
          padding: 28px 16px 24px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .cv-sidebar::-webkit-scrollbar { display: none; }

        .cv-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 10px 28px;
        }
        .cv-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #ff4d00, #c800ff);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          color: #fff;
          flex-shrink: 0;
          font-family: 'Syne', sans-serif;
        }
        .cv-logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: #fff;
        }
        .cv-logo-text span { background: linear-gradient(90deg, #ff4d00, #c800ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .cv-nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }

        .cv-nav-btn {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 12px;
          height: 46px;
          border-radius: 14px;
          background: none;
          border: none;
          color: #52526a;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          width: 100%;
          text-align: left;
          position: relative;
        }
        .cv-nav-btn:hover { background: #111120; color: #c8c8d8; }
        .cv-nav-btn.active { background: #141428; color: #fff; font-weight: 600; }
        .cv-nav-btn.active svg { color: #ff4d00; }
        .cv-nav-badge {
          width: 7px; height: 7px;
          background: #ff4d00;
          border-radius: 50%;
          position: absolute;
          top: 10px; left: 34px;
        }

        .cv-create-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 44px;
          background: linear-gradient(135deg, #ff4d00, #c800ff);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          width: 100%;
          margin-top: 8px;
          transition: opacity 0.2s;
        }
        .cv-create-btn:hover { opacity: 0.88; }

        .cv-sidebar-divider { height: 1px; background: #141420; margin: 16px 0; }

        .cv-user-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 10px;
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.15s;
          margin-top: 4px;
        }
        .cv-user-row:hover { background: #111120; }
        .cv-user-name { font-size: 13px; font-weight: 600; color: #fff; }
        .cv-user-link { font-size: 11px; color: #3a3a52; }
        .cv-user-more { margin-left: auto; color: #3a3a52; font-size: 18px; }

        /* ── MAIN ── */
        .cv-main {
          flex: 1;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #1e1e2e transparent;
          padding: 28px 28px 28px;
          display: flex;
          gap: 0;
        }
        .cv-main::-webkit-scrollbar { width: 4px; }
        .cv-main::-webkit-scrollbar-track { background: transparent; }
        .cv-main::-webkit-scrollbar-thumb { background: #1e1e2e; border-radius: 4px; }

        .cv-content { flex: 1; max-width: 720px; margin: 0 auto; width: 100%; }

        /* ── MOBILE BOTTOM NAV ── */
        .cv-mobile-nav {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(11,13,20,0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid #141420;
          padding: 10px 0 max(10px, env(safe-area-inset-bottom));
          z-index: 100;
        }
        .cv-mobile-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-around;
        }
        .cv-mob-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          background: none;
          border: none;
          color: #52526a;
          font-size: 10px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 10px;
          transition: color 0.15s;
          min-width: 44px;
        }
        .cv-mob-btn.active { color: #ff4d00; }
        .cv-mob-btn.create-mob {
          background: linear-gradient(135deg, #ff4d00, #c800ff);
          color: #fff;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -16px;
          box-shadow: 0 4px 20px rgba(255,77,0,0.4);
        }

        @media (max-width: 1024px) {
          .cv-sidebar { display: none; }
          .cv-mobile-nav { display: block; }
          .cv-main { padding: 20px 16px 80px; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      <div className="cv-sidebar">
        <div className="cv-logo">
          <div className="cv-logo-icon">C</div>
          <div className="cv-logo-text">Chat<span>Vitte</span></div>
        </div>

        <nav className="cv-nav">
          {navItems.slice(0, 5).map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`cv-nav-btn ${active === id ? 'active' : ''}`}
              onClick={() => handleNavClick(id)}
            >
              <Icon size={19} />
              {label}
              {badge && active !== id && <span className="cv-nav-badge"></span>}
            </button>
          ))}

          <button className="cv-create-btn" onClick={() => handleNavClick('create')}>
            <Plus size={16} /> Create Post
          </button>

          <div className="cv-sidebar-divider"></div>

          {navItems.slice(6).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`cv-nav-btn ${active === id ? 'active' : ''}`}
              onClick={() => handleNavClick(id)}
            >
              <Icon size={19} />
              {label}
            </button>
          ))}
        </nav>

        <div className="cv-sidebar-divider"></div>

        <div className="cv-user-row" onClick={() => handleNavClick('profile')}>
          <ProfileAvatar size={34} />
          <div>
            <div className="cv-user-name">{user?.username || 'You'}</div>
            <div className="cv-user-link">View profile</div>
          </div>
          <span className="cv-user-more">···</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="cv-main">
        <div className="cv-content">
          {renderPage(active, { token, user, handleViewProfile, handleGoToDMs, setActive })}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="cv-mobile-nav">
        <div className="cv-mobile-nav-inner">
          {mobileNavItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`cv-mob-btn ${id === 'create' ? 'create-mob' : ''} ${active === id ? 'active' : ''}`}
              onClick={() => handleNavClick(id)}
            >
              <Icon size={id === 'create' ? 22 : 20} />
              {id !== 'create' && label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

const renderPage = (active, props) => {
  const { token, user, handleViewProfile, handleGoToDMs, setActive } = props;
  switch (active) {
    case 'home': return <HomeFeed {...props} />;
    case 'search': return <SearchPage token={token} onViewProfile={handleViewProfile} />;
    case 'dms': return <DMs token={token} />;
    case 'notifications': return <Notifications token={token} />;
    case 'profile': return <Profile token={token} />;
    case 'create': return <CreatePost token={token} onPostCreated={() => setActive('home')} />;
    default: return <HomeFeed {...props} />;
  }
};

export default Dashboard;