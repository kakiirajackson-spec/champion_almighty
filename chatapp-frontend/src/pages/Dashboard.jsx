import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Compass, Film, MessageCircle, Bell, Settings, Bookmark, User, Plus } from 'lucide-react';
import HomeFeed from './HomeFeed';
import SearchPage from './SearchPage';
import Reels from './Reels';
import DMs from './DMs';
import Profile from './Profile';
import CreatePost from './CreatePost';
import Notifications from './Notifications';
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

  const ProfileAvatar = () => (
    <div style={{width:'34px',height:'34px',borderRadius:'50%',overflow:'hidden',flexShrink:'0',background:'linear-gradient(135deg,#ff4d00,#c800ff)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:'700',fontSize:'14px'}}>
      {user?.profile_picture
        ? <img src={imgSrc(user.profile_picture)} alt="me" style={{width:'100%',height:'100%',objectFit:'cover'}} />
        : user?.username?.[0]?.toUpperCase()
      }
    </div>
  );

  const navItems = [
    { id:'home', label:'Home', icon:Home },
    { id:'search', label:'Discover', icon:Compass },
    { id:'reels', label:'Reels', icon:Film },
    { id:'dms', label:'Messages', icon:MessageCircle, badge:true },
    { id:'notifications', label:'Notifications', icon:Bell, badge:true },
    { id:'profile', label:'Profile', icon:User },
    { id:'bookmarks', label:'Bookmarks', icon:Bookmark },
    { id:'settings', label:'Settings', icon:Settings },
  ];

  const mobileNav = [
    { id:'home', label:'Home', icon:Home },
    { id:'search', label:'Discover', icon:Compass },
    { id:'create', label:'', icon:Plus, isCreate:true },
    { id:'dms', label:'Messages', icon:MessageCircle },
    { id:'profile', label:'Profile', icon:User },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{background:#0b0d14!important;color:#fff;height:100%}
        .cv-nav-btn:hover{background:#111120!important;color:#c8c8d8!important}
        .cv-nav-btn.cv-active{background:#141428!important;color:#fff!important}
        .cv-nav-btn.cv-active svg{color:#ff4d00!important}
        .cv-create-btn:hover{opacity:0.88}
        .cv-user-row:hover{background:#111120!important}
        .cv-mob-btn:hover{color:#ff4d00!important}
        @media(max-width:1024px){
          .cv-sidebar{display:none!important}
          .cv-mobile-nav{display:block!important}
          .cv-main{padding:20px 16px 80px!important}
        }
      `}</style>

      <div style={{display:'flex',height:'100svh',background:'#0b0d14',color:'#fff',overflow:'hidden',fontFamily:"'DM Sans',sans-serif"}}>

        {/* Sidebar */}
        <div className="cv-sidebar" style={{width:'240px',flexShrink:'0',display:'flex',flexDirection:'column',background:'#0b0d14',borderRight:'1px solid #141420',padding:'24px 14px 20px',overflowY:'auto',scrollbarWidth:'none'}}>

          {/* Logo */}
          <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'0 8px 26px'}}>
            <div style={{width:'34px',height:'34px',background:'linear-gradient(135deg,#ff4d00,#c800ff)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'800',fontSize:'17px',color:'#fff',fontFamily:"'Syne',sans-serif",flexShrink:'0'}}>C</div>
            <span style={{fontFamily:"'Syne',sans-serif",fontSize:'19px',fontWeight:'800',color:'#fff'}}>
              Chat<span style={{background:'linear-gradient(90deg,#ff4d00,#c800ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>Vitte</span>
            </span>
          </div>

          {/* Nav */}
          <nav style={{display:'flex',flexDirection:'column',gap:'2px',flex:'1'}}>
            {navItems.slice(0,5).map(({id,label,icon:Icon,badge})=>(
              <button key={id} className={`cv-nav-btn${active===id?' cv-active':''}`}
                onClick={()=>handleNavClick(id)}
                style={{display:'flex',alignItems:'center',gap:'12px',padding:'0 12px',height:'44px',borderRadius:'14px',background:'none',border:'none',color:'#52526a',fontSize:'14px',fontWeight:'500',fontFamily:"'DM Sans',sans-serif",cursor:'pointer',width:'100%',textAlign:'left',position:'relative',transition:'background 0.15s,color 0.15s'}}>
                <Icon size={18} />
                {label}
                {badge && active!==id && <span style={{width:'7px',height:'7px',background:'#ff4d00',borderRadius:'50%',position:'absolute',top:'10px',left:'32px'}}></span>}
              </button>
            ))}

            <button className="cv-create-btn" onClick={()=>handleNavClick('create')}
              style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'7px',height:'42px',background:'linear-gradient(135deg,#ff4d00,#c800ff)',border:'none',borderRadius:'14px',color:'#fff',fontSize:'14px',fontWeight:'600',fontFamily:"'DM Sans',sans-serif",cursor:'pointer',width:'100%',marginTop:'8px',transition:'opacity 0.2s'}}>
              <Plus size={16} /> Create Post
            </button>

            <div style={{height:'1px',background:'#141420',margin:'14px 0'}}></div>

            {navItems.slice(5).map(({id,label,icon:Icon})=>(
              <button key={id} className={`cv-nav-btn${active===id?' cv-active':''}`}
                onClick={()=>handleNavClick(id)}
                style={{display:'flex',alignItems:'center',gap:'12px',padding:'0 12px',height:'44px',borderRadius:'14px',background:'none',border:'none',color:'#52526a',fontSize:'14px',fontWeight:'500',fontFamily:"'DM Sans',sans-serif",cursor:'pointer',width:'100%',textAlign:'left',transition:'background 0.15s,color 0.15s'}}>
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>

          <div style={{height:'1px',background:'#141420',margin:'14px 0'}}></div>

          {/* User */}
          <div className="cv-user-row" onClick={()=>handleNavClick('profile')}
            style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 10px',borderRadius:'14px',cursor:'pointer',transition:'background 0.15s'}}>
            <ProfileAvatar />
            <div style={{flex:'1',minWidth:'0'}}>
              <div style={{fontSize:'13px',fontWeight:'600',color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.username||'You'}</div>
              <div style={{fontSize:'11px',color:'#3a3a52'}}>View profile</div>
            </div>
            <span style={{color:'#3a3a52',fontSize:'16px',flexShrink:'0'}}>···</span>
          </div>
        </div>

        {/* Main */}
        <main className="cv-main" style={{flex:'1',overflowY:'auto',padding:'28px 28px',background:'#0b0d14',scrollbarWidth:'thin',scrollbarColor:'#1e1e2e transparent'}}>
          {renderPage(active, { token, user, handleViewProfile, handleGoToDMs, setActive })}
        </main>

        {/* Mobile Nav */}
        <nav className="cv-mobile-nav" style={{display:'none',position:'fixed',bottom:'0',left:'0',right:'0',background:'rgba(11,13,20,0.97)',backdropFilter:'blur(20px)',borderTop:'1px solid #141420',padding:'10px 0 max(10px,env(safe-area-inset-bottom))',zIndex:'100'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-around'}}>
            {mobileNav.map(({id,label,icon:Icon,isCreate})=>(
              <button key={id} className="cv-mob-btn" onClick={()=>handleNavClick(id)}
                style={isCreate
                  ? {background:'linear-gradient(135deg,#ff4d00,#c800ff)',border:'none',borderRadius:'50%',width:'48px',height:'48px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginTop:'-16px',boxShadow:'0 4px 20px rgba(255,77,0,0.4)',color:'#fff',flexShrink:'0'}
                  : {display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',background:'none',border:'none',color:active===id?'#ff4d00':'#52526a',fontSize:'10px',fontFamily:"'DM Sans',sans-serif",cursor:'pointer',padding:'4px 8px',minWidth:'44px',transition:'color 0.15s'}
                }>
                <Icon size={isCreate?22:20} />
                {!isCreate && <span>{label}</span>}
              </button>
            ))}
          </div>
        </nav>

      </div>
    </>
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