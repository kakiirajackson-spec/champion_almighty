import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Film, MessageCircle, Bell, Compass, Settings, Bookmark, User } from 'lucide-react';
import HomeFeed from './HomeFeed';
import SearchPage from './SearchPage';
import Reels from './Reels';
import DMs from './DMs';
import Profile from './Profile';
import CreatePost from './CreatePost';
import Notifications from './Notifications';
import SettingsPage from './Settings';
import RightSidebar from './RightSidebar'; // Make sure this path matches your file location
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

  const ProfileAvatar = ({ size = 28, ring = false }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      boxShadow: ring ? '0 0 0 2px #ff4d00, 0 0 0 4px #000' : 'none',
      transition: 'box-shadow 0.2s',
    }}>
      {profilePic ? (
        <img src={imgSrc(profilePic)} alt="me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #ff4d00, #c800ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.4, fontWeight: 800, color: '#fff',
          fontFamily: "'Syne', sans-serif",
        }}>
          {user?.username?.[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );

  const desktopNavItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Search, label: 'Discover' },
    { id: 'reels', icon: Film, label: 'Reels' },
    { id: 'dms', icon: MessageCircle, label: 'Messages', badge: unreadCount },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
    { id: 'create', icon: PlusSquare, label: 'Create' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const renderPage = () => {
    switch (active) {
      case 'home':
        return <HomeFeed token={token} currentUser={user} onViewProfile={handleViewProfile} onGoToDMs={handleGoToDMs} />;
      case 'search':
        return <SearchPage token={token} onViewProfile={handleViewProfile} />;
      case 'reels':
        return <Reels token={token} />;
      case 'dms':
        return <DMs token={token} userId={dmUserId} />;
      case 'notifications':
        return <Notifications token={token} />;
      case 'create':
        return <CreatePost token={token} onPostCreated={() => setActive('home')} />;
      case 'profile':
        return <Profile token={token} userId={viewUserId || user?.id} onViewProfile={handleViewProfile} onGoToDMs={handleGoToDMs} />;
      case 'settings':
        return <SettingsPage token={token} />;
      case 'bookmarks':
        return <div style={{ padding: '24px' }}><h3>Bookmarks Content Coming Soon</h3></div>;
      default:
        return <HomeFeed token={token} currentUser={user} onViewProfile={handleViewProfile} onGoToDMs={handleGoToDMs} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000000', color: '#fff', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1c1c1e; border-radius: 4px; }

        .cv-sidebar {
          width: 260px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          position: fixed;
          top: 0; left: 0;
          height: 100vh;
          z-index: 20;
          background: #000000;
          border-right: 1px solid #121214;
        }

        .cv-nav-btn {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          background: none;
          border: none;
          cursor: pointer;
          display: flex; 
          align-items: center; 
          gap: 16px;
          padding: 0 16px;
          position: relative;
          transition: background 0.2s, color 0.2s;
          color: #8e8e93;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
        }
        .cv-nav-btn:hover { background: #0c0c0e; color: #ffffff; }
        .cv-nav-btn.active { background: #0c0c0e; color: #ffffff; font-weight: 600; }

        .cv-create-btn-wide {
          width: 100%;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #ff4d00, #c800ff);
          border: none;
          cursor: pointer;
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 10px;
          margin-top: 12px;
          color: #ffffff;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 20px rgba(255, 77, 0, 0.2);
        }
        .cv-create-btn-wide:hover { opacity: 0.95; transform: scale(1.01); }

        .cv-badge {
          background: #e53e3e;
          border-radius: 20px;
          padding: 2px 6px;
          font-size: 11px; 
          font-weight: 700; 
          color: #fff;
          margin-left: auto;
        }

        .cv-main {
          flex: 1;
          margin-left: 260px;
          display: flex; 
          flex-direction: column;
          overflow: hidden;
          background: #000000;
        }

        /* Enforce exact 3-column configuration framework widths */
        .cv-content-wrapper {
          display: flex !important;
          justify-content: center !important;
          gap: 32px !important;
          width: 100% !important;
          max-width: 1140px !important;
          margin: 0 auto !important;
          height: 100% !important;
          padding: 0 16px !important;
        }

        /* Change this line inside your Dashboard.jsx <style> tag: */
.cv-feed-container {
  flex: 1 !important;
  max-width: 580px !important; /* Changed from 680px to 580px for a tighter feel */
  width: 100% !important;
  padding: 24px 0 !important;
  height: 100% !important;
  overflow-y: auto !important;
}

        .cv-sidebar-right-panel {
          width: 340px !important;
          flex-shrink: 0 !important;
          padding: 24px 0 !important;
          height: 100% !important;
          overflow-y: auto !important;
        }

        .cv-sidebar-profile {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
        }
        .cv-sidebar-profile:hover { background: #0c0c0e; }

        .cv-topbar {
          display: none;
          align-items: center; justify-content: space-between;
          padding: 12px 18px;
          background: #000000;
          border-bottom: 1px solid #121214;
          flex-shrink: 0;
        }
        .cv-topbar-logo { display: flex; align-items: center; gap: 8px; }
        .cv-topbar-logo-c {
          width: 30px; height: 30px; border-radius: 9px;
          background: linear-gradient(135deg, #ff4d00, #c800ff);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 900; color: #fff;
        }
        .cv-topbar-name { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 800; color: #fff; }
        .cv-topbar-actions { display: flex; align-items: center; gap: 14px; }
        .cv-topbar-icon-btn { background: none; border: none; cursor: pointer; color: #888; }

        .cv-bottom-nav {
          display: none;
          align-items: center;
          background: #000000;
          border-top: 1px solid #121214;
          flex-shrink: 0;
          height: 64px;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .cv-bottom-item {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
          background: none; border: none; cursor: pointer; color: #4e4e52;
        }
        .cv-bottom-item.active { color: #fff; }

        @media (max-width: 1024px) {
          .cv-sidebar { display: none !important; }
          .cv-main { margin-left: 0 !important; }
          .cv-topbar { display: flex !important; }
          .cv-bottom-nav { display: flex !important; }
          .cv-feed-container { max-width: 100% !important; }
          .cv-sidebar-right-panel { display: none !important; }
        }
      `}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      <div className="cv-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px 28px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #ff4d00, #c800ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontSize: 18, fontWeight: 900, color: '#fff' }}>C</div>
          <span style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>ChatVitte</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
          {desktopNavItems.map(({ id, icon: Icon, label, badge }) => {
            const isActive = active === id;
            if (id === 'create') {
              return (
                <button key={id} className="cv-create-btn-wide" onClick={() => handleNavClick(id)}>
                  <Icon size={18} strokeWidth={2.5} />
                  <span>Create Post</span>
                </button>
              );
            }
            return (
              <button key={id} className={`cv-nav-btn${isActive ? ' active' : ''}`} onClick={() => handleNavClick(id)}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} color={isActive ? '#fff' : undefined} />
                <span>{label}</span>
                {badge > 0 && <span className="cv-badge">{badge}</span>}
              </button>
            );
          })}
        </nav>

        <button className="cv-sidebar-profile" onClick={() => handleNavClick('profile')}>
          <ProfileAvatar size={36} ring={active === 'profile'} />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username || 'alexvibez'}
            </span>
            <span style={{ fontSize: '12px', color: '#666', whiteSpace: 'nowrap' }}>View profile</span>
          </div>
        </button>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="cv-main">
        {/* Mobile top bar */}
        <div className="cv-topbar">
          <div className="cv-topbar-logo">
            <div className="cv-topbar-logo-c">C</div>
            <span className="cv-topbar-name">ChatVitte</span>
          </div>
          <div className="cv-topbar-actions">
            <button className="cv-topbar-icon-btn" onClick={() => handleNavClick('search')}><Search size={22} /></button>
            <button className="cv-topbar-icon-btn" onClick={() => handleNavClick('notifications')}><Bell size={22} /></button>
            <button className="cv-topbar-icon-btn" onClick={() => handleNavClick('profile')}><ProfileAvatar size={28} /></button>
          </div>
        </div>

        {/* 3-Column Structured Layout Flex Container Wrapper */}
        <div className="cv-content-wrapper">
          
          {/* Column 2: Central Interactive Feeds area */}
          <div className="cv-feed-container">
            {renderPage()}
          </div>

          {/* Column 3: Fixed Right Sidebar Suggestions & Live panels (Shows only on Home feed) */}
          {active === 'home' && (
            <div className="cv-sidebar-right-panel">
              <RightSidebar token={token} currentUser={user} onViewProfile={handleViewProfile} />
            </div>
          )}

        </div>

        {/* Mobile bottom nav */}
        <div className="cv-bottom-nav">
          <button className={`cv-bottom-item${active === 'home' ? ' active' : ''}`} onClick={() => handleNavClick('home')}>
            <Home size={22} strokeWidth={2} />
          </button>
          <button className={`cv-bottom-item${active === 'search' ? ' active' : ''}`} onClick={() => handleNavClick('search')}>
            <Compass size={22} strokeWidth={2} />
          </button>
          <button className={`cv-bottom-item${active === 'create' ? ' active' : ''}`} onClick={() => handleNavClick('create')}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #ff4d00, #c800ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255,77,0,0.3)' }}>
              <PlusSquare size={20} color="#fff" strokeWidth={2.5} />
            </div>
          </button>
          <button className={`cv-bottom-item${active === 'dms' ? ' active' : ''}`} onClick={() => handleNavClick('dms')}>
            <MessageCircle size={22} strokeWidth={2} />
          </button>
          <button className={`cv-bottom-item${active === 'profile' ? ' active' : ''}`} onClick={() => handleNavClick('profile')}>
            <ProfileAvatar size={24} ring={active === 'profile'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;