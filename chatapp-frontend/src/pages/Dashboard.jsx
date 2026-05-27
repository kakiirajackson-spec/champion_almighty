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

  const ProfileAvatar = ({ size = 28, ring = false }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      boxShadow: ring ? '0 0 0 2px #ff4d00, 0 0 0 4px #0d0d0d' : 'none',
      transition: 'box-shadow 0.2s',
    }}>
      {profilePic
        ? <img src={imgSrc(profilePic)} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #ff4d00, #c800ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.4, fontWeight: 800, color: '#fff',
            fontFamily: "'Syne', sans-serif",
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
      }
    </div>
  );

  // Desktop nav items
  const desktopNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Discover' },
    { id: 'reels', icon: Film, label: 'Reels' },
    { id: 'dms', icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { id: 'notifications', icon: Bell, label: 'Alerts', badge: unreadCount },
    { id: 'create', icon: PlusSquare, label: 'Create' },
  ];

  // Mobile bottom nav items
  const mobileNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Compass, label: 'Discover' },
    { id: 'dms', icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { id: 'profile', icon: null, label: 'Profile' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', color: '#fff', overflow: 'hidden', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        /* ── Scrollbar ── */
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }

        /* ── Desktop sidebar ── */
        .cv-sidebar {
          width: 68px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 0 20px;
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          z-index: 20;
          background: #0d0d0d;
          border-right: 1px solid #1a1a1a;
        }

        /* ── Nav button ── */
        .cv-nav-btn {
          width: 44px; height: 44px;
          border-radius: 14px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          position: relative;
          transition: background 0.15s, transform 0.15s;
          color: #555;
        }
        .cv-nav-btn:hover { background: #1a1a1a; transform: scale(1.08); color: #aaa; }
        .cv-nav-btn.active { background: #1a1a1a; color: #fff; }
        .cv-nav-btn.active::before {
          content: '';
          position: absolute;
          left: -1px; top: 50%; transform: translateY(-50%);
          width: 3px; height: 24px;
          background: linear-gradient(180deg, #ff4d00, #c800ff);
          border-radius: 0 3px 3px 0;
        }

        /* ── Create button (desktop) ── */
        .cv-create-btn {
          width: 44px; height: 44px;
          border-radius: 14px;
          background: linear-gradient(135deg, #ff4d00, #c800ff);
          border: none;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(255,77,0,0.35);
        }
        .cv-create-btn:hover { opacity: 0.9; transform: scale(1.08); }

        /* ── Tooltip ── */
        .cv-tooltip {
          position: absolute;
          left: 56px; top: 50%; transform: translateY(-50%);
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 8px;
          padding: 5px 11px;
          font-size: 12px; font-weight: 600;
          color: #fff; white-space: nowrap;
          pointer-events: none; z-index: 999;
          box-shadow: 0 4px 16px rgba(0,0,0,0.6);
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.02em;
        }

        /* ── Badge ── */
        .cv-badge {
          position: absolute; top: 5px; right: 5px;
          background: #ff4d00;
          border-radius: 50%; width: 14px; height: 14px;
          font-size: 8px; font-weight: 700; color: #fff;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid #0d0d0d;
        }

        /* ── Main content ── */
        .cv-main {
          flex: 1;
          margin-left: 68px;
          display: flex; flex-direction: column;
          overflow: hidden;
        }

        /* ── Mobile topbar ── */
        .cv-topbar {
          display: none;
          align-items: center; justify-content: space-between;
          padding: 12px 18px;
          background: #0a0a0a;
          border-bottom: 1px solid #1a1a1a;
          flex-shrink: 0;
        }
        .cv-topbar-logo {
          display: flex; align-items: center; gap: 8px;
        }
        .cv-topbar-logo-c {
          width: 30px; height: 30px;
          border-radius: 9px;
          background: linear-gradient(135deg, #ff4d00, #c800ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 900; color: #fff;
        }
        .cv-topbar-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px; font-weight: 800;
          color: #fff; letter-spacing: -0.3px;
        }
        .cv-topbar-actions { display: flex; align-items: center; gap: 14px; }
        .cv-topbar-icon-btn {
          background: none; border: none; cursor: pointer;
          color: #888; position: relative;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s;
        }
        .cv-topbar-icon-btn:hover { color: #fff; }

        /* ── Mobile bottom nav ── */
        .cv-bottom-nav {
          display: none;
          align-items: center;
          background: #0d0d0d;
          border-top: 1px solid #1a1a1a;
          flex-shrink: 0;
          padding: 0 8px;
          height: 60px;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .cv-bottom-item {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 3px;
          background: none; border: none; cursor: pointer;
          color: #555; padding: 6px 0;
          transition: color 0.15s;
          position: relative;
        }
        .cv-bottom-item.active { color: #fff; }
        .cv-bottom-item span {
          font-size: 9px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.04em; text-transform: uppercase;
        }

        /* ── Center create button (mobile) ── */
        .cv-bottom-create {
          flex: 0 0 64px; display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer;
        }
        .cv-bottom-create-inner {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #ff4d00, #c800ff);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 3px #0d0d0d, 0 4px 20px rgba(255,77,0,0.4);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .cv-bottom-create-inner:hover { transform: scale(1.08); box-shadow: 0 0 0 3px #0d0d0d, 0 6px 24px rgba(255,77,0,0.55); }

        /* ── Logo (desktop) ── */
        .cv-logo {
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px;
        }
        .cv-logo-mark {
          width: 36px; height: 36px; border-radius: 11px;
          background: linear-gradient(135deg, #ff4d00, #c800ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif;
          font-size: 19px; font-weight: 900; color: #fff;
          box-shadow: 0 4px 16px rgba(255,77,0,0.35);
        }

        @media (max-width: 900px) {
          .cv-sidebar { display: none !important; }
          .cv-main { margin-left: 0 !important; }
          .cv-topbar { display: flex !important; }
          .cv-bottom-nav { display: flex !important; }
        }
      `}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="cv-sidebar">
        <div className="cv-logo">
          <div className="cv-logo-mark">C</div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: '100%', paddingTop: 4 }}>
          {desktopNavItems.map(({ id, icon: Icon, label, badge }) => {
            const isActive = active === id;
            const isHovered = hoveredNav === id;
            const isCreate = id === 'create';
            return (
              <div key={id} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                {isCreate ? (
                  <button
                    className="cv-create-btn"
                    onClick={() => handleNavClick(id)}
                    onMouseEnter={() => setHoveredNav(id)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    <Icon size={20} color="#fff" strokeWidth={2.5} />
                  </button>
                ) : (
                  <button
                    className={`cv-nav-btn${isActive ? ' active' : ''}`}
                    onClick={() => handleNavClick(id)}
                    onMouseEnter={() => setHoveredNav(id)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                    {badge > 0 && <span className="cv-badge">{badge > 9 ? '9+' : badge}</span>}
                  </button>
                )}
                {isHovered && <div className="cv-tooltip">{label}</div>}
              </div>
            );
          })}

          {/* Profile */}
          {(() => {
            const isActive = active === 'profile';
            const isHovered = hoveredNav === 'profile';
            return (
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                <button
                  className={`cv-nav-btn${isActive ? ' active' : ''}`}
                  onClick={() => handleNavClick('profile')}
                  onMouseEnter={() => setHoveredNav('profile')}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  <ProfileAvatar size={28} ring={isActive} />
                </button>
                {isHovered && <div className="cv-tooltip">Profile</div>}
              </div>
            );
          })()}
        </nav>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="cv-main">

        {/* Mobile top bar */}
        <div className="cv-topbar">
          <div className="cv-topbar-logo">
            <div className="cv-topbar-logo-c">C</div>
            <span className="cv-topbar-name">ChatVitte</span>
          </div>
          <div className="cv-topbar-actions">
            <button className="cv-topbar-icon-btn" onClick={() => handleNavClick('search')}>
              <Search size={22} color={active === 'search' ? '#fff' : undefined} />
            </button>
            <button className="cv-topbar-icon-btn" style={{ position: 'relative' }} onClick={() => handleNavClick('notifications')}>
              <Bell size={22} color={active === 'notifications' ? '#fff' : undefined} />
              {unreadCount > 0 && (
                <span className="cv-badge" style={{ top: -3, right: -3 }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            <button className="cv-topbar-icon-btn" onClick={() => handleNavClick('profile')}>
              <ProfileAvatar size={30} ring={active === 'profile'} />
            </button>
          </div>
        </div>

        {/* Page */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {renderPage()}
        </div>

        {/* Mobile bottom nav */}
        <div className="cv-bottom-nav">
          {/* Home */}
          <button className={`cv-bottom-item${active === 'home' ? ' active' : ''}`} onClick={() => handleNavClick('home')}>
            <Home size={22} strokeWidth={active === 'home' ? 2.5 : 1.8} />
            <span>Home</span>
          </button>

          {/* Discover */}
          <button className={`cv-bottom-item${active === 'search' ? ' active' : ''}`} onClick={() => handleNavClick('search')}>
            <Compass size={22} strokeWidth={active === 'search' ? 2.5 : 1.8} />
            <span>Discover</span>
          </button>

          {/* Create — center pill */}
          <div className="cv-bottom-create" onClick={() => handleNavClick('create')}>
            <div className="cv-bottom-create-inner">
              <PlusSquare size={22} color="#fff" strokeWidth={2.5} />
            </div>
          </div>

          {/* Messages */}
          <button className={`cv-bottom-item${active === 'dms' ? ' active' : ''}`} onClick={() => handleNavClick('dms')} style={{ position: 'relative' }}>
            <MessageCircle size={22} strokeWidth={active === 'dms' ? 2.5 : 1.8} />
            {unreadCount > 0 && <span className="cv-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            <span>Messages</span>
          </button>

          {/* Profile */}
          <button className={`cv-bottom-item${active === 'profile' ? ' active' : ''}`} onClick={() => handleNavClick('profile')}>
            <ProfileAvatar size={24} ring={active === 'profile'} />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;