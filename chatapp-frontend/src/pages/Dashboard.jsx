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
import RightSidebar from './RightSidebar';
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
        <img src={imgSrc(user.profile_picture)} alt="me" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff4d00] to-[#c800ff] text-white font-bold">
          {user?.username?.[0]?.toUpperCase()}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0b0d14] text-white overflow-hidden font-sans">
     <style>{`
  .cv-sidebar { width: 260px; padding: 32px 24px; border-right: 1px solid #1e2235; background: #0b0d14; }
  .cv-nav-btn { width: 100%; height: 50px; display: flex; align-items: center; gap: 16px; padding: 0 16px; border-radius: 12px; color: #7c7e8c; transition: 0.2s; }
  .cv-nav-btn:hover { background: rgba(255,255,255,0.05); color: #fff; }
  .cv-nav-btn.active { background: rgba(255,255,255,0.08); color: #fff; font-weight: 600; }
  .cv-create-btn { background: linear-gradient(135deg, #ff4d00, #c800ff); border-radius: 12px; padding: 12px; width: 100%; text-align: center; font-weight: 600; }
  /* Ensure components using cards get the surface color */
  .cv-card { background-color: #121420; border: 1px solid #1e2235; border-radius: 16px; }
  @media (max-width: 1024px) { .cv-sidebar, .cv-right-panel { display: none; } }
`}</style>

      {/* Desktop Sidebar */}
      <div className="cv-sidebar flex flex-col gap-6">
        <h1 className="font-extrabold text-2xl px-4">ChatVitte</h1>
        <nav className="flex flex-col gap-2">
          {['home', 'search', 'dms', 'notifications', 'profile'].map((item) => (
            <button key={item} className={`cv-nav-btn ${active === item ? 'active' : ''}`} onClick={() => handleNavClick(item)}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
          <button className="cv-create-btn mt-4" onClick={() => handleNavClick('create')}>Create Post</button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 flex justify-center">
        <div className="w-full max-w-2xl">
          {/* Here you render your page logic */}
          {renderPage(active, { token, user, handleViewProfile, handleGoToDMs, setActive })}
        </div>
        
        {/* Right Sidebar (only on home) */}
        {active === 'home' && (
          <div className="cv-right-panel w-80 ml-8 hidden xl:block">
            <RightSidebar token={token} currentUser={user} onViewProfile={handleViewProfile} />
          </div>
        )}
      </main>
    </div>
  );
};

// Helper to keep the main return clean
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