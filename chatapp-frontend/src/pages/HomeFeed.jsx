import React, { useState } from 'react';
import { Search, Bell, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Image, Video, Mic, Smile, Flame, Radio } from 'lucide-react';

const HomeFeed = ({ token, currentUser, onViewProfile, onGoToDMs }) => {
  const [postText, setPostText] = useState('');
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  const stories = [
    { id: 'me', name: 'Your story', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', isMe: true },
    { id: 'joshua', name: 'joshua', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', live: false },
    { id: 'visionn', name: 'visionn', img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', live: true },
    { id: 'daniella', name: 'daniella', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', live: true },
    { id: 'urban', name: 'urban.vibez', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', live: false },
    { id: 'soulcri', name: 'soulcri', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150', live: false },
    { id: 'king', name: 'king.artz', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', live: false },
  ];

  const suggestedUsers = [
    { id: 'champ', username: 'Champion', subtitle: 'Suggested for you', img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
    { id: 'kennys', username: 'Kennys', subtitle: 'Suggested for you', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { id: 'mari', username: 'mari.visuals', subtitle: 'Suggested for you', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { id: 'not', username: 'not.akira', subtitle: 'Suggested for you', img: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150' },
  ];

  const trendingSpaces = [
    { name: 'Design', posts: '125K posts', color: '#6366f1' },
    { name: 'Music', posts: '98K posts', color: '#a855f7' },
    { name: 'Streetwear', posts: '76K posts', color: '#ec4899' },
    { name: 'Photography', posts: '64K posts', color: '#f59e0b' },
    { name: 'Art', posts: '52K posts', color: '#10b981' },
  ];

  const liveRooms = [
    { id: 1, title: 'Kigali Chill Zone', listeners: 231, imgs: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50'] },
    { id: 2, title: 'Late Night Vibe', listeners: 187, imgs: ['https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=50', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50'] },
  ];

  const toggleLike = (id) => setLikedPosts(p => ({ ...p, [id]: !p[id] }));
  const toggleSave = (id) => setSavedPosts(p => ({ ...p, [id]: !p[id] }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hf-wrap { display: flex; gap: 28px; width: 100%; font-family: 'DM Sans', sans-serif; }

        /* ── FEED ── */
        .hf-feed { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 20px; }

        /* Header */
        .hf-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 4px; }
        .hf-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; margin: 0; line-height: 1.2; }
        .hf-title-name { background: linear-gradient(90deg, #ff4d00, #c800ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hf-subtitle { color: #52526a; font-size: 13px; margin: 3px 0 0 0; }
        .hf-search-wrap { display: flex; align-items: center; gap: 12px; }
        .hf-search { position: relative; display: flex; align-items: center; }
        .hf-search svg { position: absolute; left: 13px; pointer-events: none; }
        .hf-search input { width: 220px; height: 38px; background: #111118; border: 1px solid #1e1e2e; border-radius: 100px; padding: 0 16px 0 40px; color: #fff; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s; }
        .hf-search input:focus { border-color: #ff4d00; }
        .hf-bell { position: relative; background: #111118; border: 1px solid #1e1e2e; border-radius: 50%; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: border-color 0.2s; }
        .hf-bell:hover { border-color: #ff4d00; }
        .hf-bell-dot { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; background: #ff4d00; border-radius: 50%; border: 2px solid #0b0d14; }

        /* Stories */
        .hf-stories { display: flex; gap: 12px; overflow-x: auto; padding: 2px 0 8px; scrollbar-width: none; }
        .hf-stories::-webkit-scrollbar { display: none; }
        .hf-story { display: flex; flex-direction: column; align-items: center; gap: 7px; flex-shrink: 0; cursor: pointer; }
        .hf-story-ring { padding: 2.5px; border-radius: 50%; position: relative; }
        .hf-story-ring.gradient { background: linear-gradient(135deg, #ff4d00, #c800ff); }
        .hf-story-ring.live-ring { background: linear-gradient(135deg, #00f2fe, #4facfe); }
        .hf-story-ring.me { background: #1e1e2e; border: 2px dashed #333350; }
        .hf-story-img { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2.5px solid #0b0d14; display: block; }
        .hf-story-add { position: absolute; bottom: 1px; right: 1px; width: 20px; height: 20px; background: linear-gradient(135deg, #ff4d00, #c800ff); border-radius: 50%; border: 2px solid #0b0d14; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; line-height: 1; }
        .hf-story-live { position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); background: linear-gradient(90deg, #00f2fe, #4facfe); color: #000; font-size: 8px; font-weight: 800; padding: 1px 6px; border-radius: 6px; letter-spacing: 0.5px; white-space: nowrap; }
        .hf-story-name { font-size: 11px; color: #6b6b80; max-width: 68px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: center; }

        /* Composer */
        .hf-composer { background: #0e0e16; border: 1px solid #1e1e2e; border-radius: 20px; padding: 16px 18px; transition: border-color 0.2s; }
        .hf-composer:focus-within { border-color: #2a2a40; }
        .hf-composer-top { display: flex; gap: 12px; align-items: center; }
        .hf-composer-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; }
        .hf-composer-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .hf-composer-input { flex: 1; background: transparent; border: none; color: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
        .hf-composer-input::placeholder { color: #3a3a52; }
        .hf-wave { display: flex; gap: 2px; align-items: center; height: 18px; }
        .hf-wave span { width: 2.5px; border-radius: 2px; background: #ff4d00; opacity: 0.7; }
        .hf-composer-divider { height: 1px; background: #1e1e2e; margin: 14px 0; }
        .hf-composer-actions { display: flex; align-items: center; justify-content: space-between; }
        .hf-composer-btns { display: flex; gap: 4px; }
        .hf-composer-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; color: #52526a; font-size: 12px; font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 6px 10px; border-radius: 10px; transition: background 0.15s, color 0.15s; }
        .hf-composer-btn:hover { background: #1a1a26; color: #fff; }
        .hf-post-btn { background: linear-gradient(135deg, #ff4d00, #c800ff); border: none; border-radius: 100px; padding: 7px 20px; color: #fff; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.2s; }
        .hf-post-btn:hover { opacity: 0.88; }

        /* Pulse */
        .hf-pulse { background: linear-gradient(135deg, #0e0e16, #0a0a12); border: 1px solid #1e1e2e; border-radius: 20px; padding: 20px 22px; display: flex; justify-content: space-between; align-items: center; overflow: hidden; position: relative; }
        .hf-pulse::before { content: ''; position: absolute; top: -40px; right: -40px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(200,0,255,0.06) 0%, transparent 70%); pointer-events: none; }
        .hf-pulse-label { text-transform: uppercase; font-size: 10px; font-weight: 700; color: #ff4d00; letter-spacing: 1.5px; display: flex; align-items: center; gap: 6px; }
        .hf-pulse-dot { width: 6px; height: 6px; background: #ff4d00; border-radius: 50%; animation: hf-blink 1.4s ease-in-out infinite; }
        @keyframes hf-blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .hf-pulse-loc { color: #52526a; font-size: 12px; margin: 3px 0 0 0; }
        .hf-pulse-count { font-family: 'Syne', sans-serif; font-size: 44px; font-weight: 800; margin: 10px 0 0 0; line-height: 1; }
        .hf-pulse-badge { display: inline-flex; align-items: center; background: rgba(0,242,254,0.1); color: #00f2fe; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-left: 10px; }
        .hf-pulse-sub { color: #3a3a52; font-size: 12px; margin: 6px 0 0 0; }
        .hf-pulse-right { display: flex; align-items: center; gap: 20px; }
        .hf-pulse-radar { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .hf-radar-ring { position: absolute; border-radius: 50%; border: 1px dashed; }
        .hf-pulse-vibe { text-align: right; }
        .hf-vibe-title { font-size: 14px; font-weight: 700; color: #fff; margin: 0; }
        .hf-vibe-badge { display: inline-block; background: rgba(0,242,254,0.1); color: #00f2fe; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 6px; margin-top: 4px; }
        .hf-vibe-sub { color: #52526a; font-size: 11px; margin: 5px 0 0 0; max-width: 140px; line-height: 1.4; }

        /* Post Card */
        .hf-post { background: #0e0e16; border: 1px solid #1e1e2e; border-radius: 20px; overflow: hidden; transition: border-color 0.2s; }
        .hf-post:hover { border-color: #2a2a3e; }
        .hf-post-head { padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
        .hf-post-user { display: flex; align-items: center; gap: 11px; cursor: pointer; }
        .hf-post-ava { width: 42px; height: 42px; border-radius: 50%; overflow: hidden; background: #1e1e2e; flex-shrink: 0; border: 2px solid #1e1e2e; }
        .hf-post-ava img { width: 100%; height: 100%; object-fit: cover; }
        .hf-post-uname { font-size: 14px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 5px; }
        .hf-verified { width: 15px; height: 15px; background: linear-gradient(135deg, #4facfe, #00f2fe); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: #fff; }
        .hf-post-meta { font-size: 12px; color: #52526a; margin-top: 1px; }
        .hf-post-more { background: none; border: none; color: #52526a; cursor: pointer; padding: 4px; border-radius: 8px; transition: background 0.15s; }
        .hf-post-more:hover { background: #1e1e2e; color: #fff; }
        .hf-post-img { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #060608; position: relative; }
        .hf-post-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
        .hf-post:hover .hf-post-img img { transform: scale(1.02); }
        .hf-post-counter { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); padding: 3px 9px; border-radius: 10px; font-size: 11px; font-weight: 600; color: #fff; }
        .hf-post-body { padding: 14px 18px 16px; }
        .hf-post-actions { display: flex; justify-content: space-between; align-items: center; }
        .hf-post-left { display: flex; gap: 16px; }
        .hf-action-btn { display: flex; align-items: center; gap: 5px; background: none; border: none; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 6px 8px; border-radius: 10px; transition: background 0.15s; }
        .hf-action-btn.like { color: #ff4d00; }
        .hf-action-btn.like:hover { background: rgba(255,77,0,0.1); }
        .hf-action-btn.comment { color: #ccc; }
        .hf-action-btn.comment:hover { background: #1e1e2e; color: #fff; }
        .hf-action-btn.share { color: #ccc; }
        .hf-action-btn.share:hover { background: #1e1e2e; color: #fff; }
        .hf-action-btn.save { color: #ccc; }
        .hf-action-btn.save:hover { background: #1e1e2e; color: #fff; }
        .hf-post-caption { margin: 12px 0 0 0; font-size: 14px; line-height: 1.55; color: #c8c8d8; }
        .hf-caption-name { font-weight: 700; color: #fff; margin-right: 6px; }
        .hf-view-comments { background: none; border: none; color: #3a3a52; font-size: 12px; font-family: 'DM Sans', sans-serif; padding: 0; margin-top: 8px; cursor: pointer; transition: color 0.15s; }
        .hf-view-comments:hover { color: #6b6b80; }

        /* ── RIGHT SIDEBAR ── */
        .hf-sidebar { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 18px; }
        .hf-sidebar-card { background: #0e0e16; border: 1px solid #1e1e2e; border-radius: 20px; padding: 18px; }
        .hf-sidebar-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .hf-sidebar-title { font-size: 14px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 7px; margin: 0; }
        .hf-see-all { background: none; border: none; color: #ff4d00; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
        .hf-suggest-list { display: flex; flex-direction: column; gap: 14px; }
        .hf-suggest-row { display: flex; align-items: center; justify-content: space-between; }
        .hf-suggest-info { display: flex; align-items: center; gap: 10px; }
        .hf-suggest-ava { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .hf-suggest-name { font-size: 13px; font-weight: 600; color: #fff; }
        .hf-suggest-sub { font-size: 11px; color: #3a3a52; margin-top: 1px; }
        .hf-follow-btn { background: transparent; border: 1px solid #2a2a3e; color: #fff; border-radius: 100px; padding: 5px 14px; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.15s; }
        .hf-follow-btn:hover { background: linear-gradient(135deg, #ff4d00, #c800ff); border-color: transparent; }
        .hf-trending-list { display: flex; flex-direction: column; gap: 12px; }
        .hf-trending-row { display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 6px 8px; border-radius: 12px; transition: background 0.15s; }
        .hf-trending-row:hover { background: #141420; }
        .hf-trending-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; flex-shrink: 0; }
        .hf-trending-name { font-size: 13px; font-weight: 600; color: #fff; }
        .hf-trending-count { font-size: 11px; color: #3a3a52; margin-top: 1px; }
        .hf-live-list { display: flex; flex-direction: column; gap: 10px; }
        .hf-live-row { background: #0a0a12; border: 1px solid #1a1a28; border-radius: 14px; padding: 11px 13px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: border-color 0.2s; }
        .hf-live-row:hover { border-color: #00f2fe44; }
        .hf-live-avatars { display: flex; }
        .hf-live-ava { width: 22px; height: 22px; border-radius: 50%; object-fit: cover; border: 2px solid #0a0a12; margin-left: -8px; flex-shrink: 0; }
        .hf-live-ava:first-child { margin-left: 0; }
        .hf-live-title { font-size: 13px; font-weight: 600; color: #fff; }
        .hf-live-badge { display: flex; align-items: center; gap: 5px; font-size: 11px; margin-top: 2px; }
        .hf-live-dot { width: 5px; height: 5px; background: #00f2fe; border-radius: 50%; animation: hf-blink 1.2s ease-in-out infinite; }
        .hf-live-tag { color: #00f2fe; font-weight: 700; font-size: 10px; letter-spacing: 0.5px; }
        .hf-live-count { color: #52526a; font-size: 11px; }

        /* Scrollbar hide for stories */
        .hf-stories { -ms-overflow-style: none; }

        @media (max-width: 1100px) { .hf-sidebar { display: none; } }
        @media (max-width: 640px) {
          .hf-header { flex-direction: column; align-items: flex-start; gap: 10px; }
          .hf-search-wrap { width: 100%; }
          .hf-search input { width: 100%; }
          .hf-composer-btns { gap: 2px; }
          .hf-composer-btn span { display: none; }
        }
      `}</style>

      <div className="hf-wrap">

        {/* ── CENTRAL FEED ── */}
        <div className="hf-feed">

          {/* Header */}
          <div className="hf-header">
            <div>
              <h1 className="hf-title">
                Welcome back, <span className="hf-title-name">{currentUser?.username || 'joshua'}</span> 👋
              </h1>
              <p className="hf-subtitle">Discover creative people around the world.</p>
            </div>
            <div className="hf-search-wrap">
              <div className="hf-search">
                <Search size={15} color="#3a3a52" />
                <input type="text" placeholder="Search ChatVitte" />
              </div>
              <button className="hf-bell">
                <Bell size={16} color="#8888a0" />
                <div className="hf-bell-dot"></div>
              </button>
            </div>
          </div>

          {/* Stories */}
          <div className="hf-stories">
            {stories.map((story) => (
              <div key={story.id} className="hf-story">
                <div className={`hf-story-ring ${story.isMe ? 'me' : story.live ? 'live-ring' : 'gradient'}`}>
                  <img src={story.img} alt={story.name} className="hf-story-img" />
                  {story.isMe && <div className="hf-story-add">+</div>}
                  {story.live && <div className="hf-story-live">LIVE</div>}
                </div>
                <span className="hf-story-name">{story.name}</span>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="hf-composer">
            <div className="hf-composer-top">
              <div className="hf-composer-avatar">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="me" />
              </div>
              <input
                className="hf-composer-input"
                type="text"
                placeholder="Share your vibe today..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
              />
              <div className="hf-wave">
                <span style={{ height: '8px' }}></span>
                <span style={{ height: '14px' }}></span>
                <span style={{ height: '10px' }}></span>
                <span style={{ height: '18px' }}></span>
                <span style={{ height: '7px' }}></span>
              </div>
            </div>
            <div className="hf-composer-divider"></div>
            <div className="hf-composer-actions">
              <div className="hf-composer-btns">
                <button className="hf-composer-btn"><Image size={16} color="#00f2fe" /><span>Photo</span></button>
                <button className="hf-composer-btn"><Video size={16} color="#c800ff" /><span>Video</span></button>
                <button className="hf-composer-btn"><Mic size={16} color="#ff4d00" /><span>Voice</span></button>
                <button className="hf-composer-btn"><Smile size={16} color="#ffb703" /><span>Vibe</span></button>
              </div>
              <button className="hf-post-btn">Post</button>
            </div>
          </div>

          {/* Pulse */}
          <div className="hf-pulse">
            <div>
              <div className="hf-pulse-label"><span className="hf-pulse-dot"></span> Today's Pulse</div>
              <p className="hf-pulse-loc">Kigali, Rwanda</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '10px' }}>
                <span className="hf-pulse-count">127</span>
                <span className="hf-pulse-badge">↗ 23%</span>
              </div>
              <p className="hf-pulse-sub">people posting right now</p>
            </div>
            <div className="hf-pulse-right">
              <div className="hf-pulse-radar">
                <div className="hf-radar-ring" style={{ width: '80px', height: '80px', borderColor: '#1e1e2e' }}></div>
                <div className="hf-radar-ring" style={{ width: '52px', height: '52px', borderColor: '#2a2a3e' }}></div>
                <div className="hf-radar-ring" style={{ width: '26px', height: '26px', borderColor: '#3a3a52', background: '#141420' }}></div>
                <div style={{ position: 'absolute', top: '12px', right: '8px', width: '8px', height: '8px', background: '#c800ff', borderRadius: '50%', boxShadow: '0 0 12px #c800ff' }}></div>
                <div style={{ position: 'absolute', bottom: '18px', left: '12px', width: '6px', height: '6px', background: '#ff4d00', borderRadius: '50%', boxShadow: '0 0 10px #ff4d00' }}></div>
              </div>
              <div className="hf-pulse-vibe">
                <p className="hf-vibe-title">🌙 Night Vibe</p>
                <span className="hf-vibe-badge">Very Active</span>
                <p className="hf-vibe-sub">People are posting more at night</p>
              </div>
            </div>
          </div>

          {/* Post Card */}
          <div className="hf-post">
            <div className="hf-post-head">
              <div className="hf-post-user" onClick={() => onViewProfile && onViewProfile('joshua')}>
                <div className="hf-post-ava">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="joshua" />
                </div>
                <div>
                  <div className="hf-post-uname">
                    joshua
                    <span className="hf-verified">✓</span>
                  </div>
                  <div className="hf-post-meta">2h ago · Kigali, Rwanda</div>
                </div>
              </div>
              <button className="hf-post-more"><MoreHorizontal size={18} /></button>
            </div>
            <div className="hf-post-img">
              <img src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800" alt="post" />
              <div className="hf-post-counter">1 / 4</div>
            </div>
            <div className="hf-post-body">
              <div className="hf-post-actions">
                <div className="hf-post-left">
                  <button className="hf-action-btn like" onClick={() => toggleLike('post1')}>
                    <Heart size={20} fill={likedPosts['post1'] ? '#ff4d00' : 'none'} />
                    {likedPosts['post1'] ? '1.2K' : '1.2K'}
                  </button>
                  <button className="hf-action-btn comment"><MessageCircle size={20} /> 86</button>
                  <button className="hf-action-btn share"><Send size={20} /> 34</button>
                </div>
                <button className="hf-action-btn save" onClick={() => toggleSave('post1')}>
                  <Bookmark size={20} fill={savedPosts['post1'] ? '#fff' : 'none'} />
                </button>
              </div>
              <p className="hf-post-caption">
                <span className="hf-caption-name">joshua</span>Night drives. Clear mind. 🌙
              </p>
              <button className="hf-view-comments">View all 86 comments</button>
            </div>
          </div>

        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="hf-sidebar">

          {/* Suggested */}
          <div className="hf-sidebar-card">
            <div className="hf-sidebar-head">
              <h3 className="hf-sidebar-title">Suggested for you</h3>
              <button className="hf-see-all">See all</button>
            </div>
            <div className="hf-suggest-list">
              {suggestedUsers.map((u) => (
                <div key={u.id} className="hf-suggest-row">
                  <div className="hf-suggest-info">
                    <img src={u.img} alt={u.username} className="hf-suggest-ava" />
                    <div>
                      <div className="hf-suggest-name">{u.username}</div>
                      <div className="hf-suggest-sub">{u.subtitle}</div>
                    </div>
                  </div>
                  <button className="hf-follow-btn">Follow</button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Spaces */}
          <div className="hf-sidebar-card">
            <div className="hf-sidebar-head">
              <h3 className="hf-sidebar-title"><Flame size={16} color="#ff4d00" fill="#ff4d00" /> Trending Spaces</h3>
              <button className="hf-see-all">View all</button>
            </div>
            <div className="hf-trending-list">
              {trendingSpaces.map((space, i) => (
                <div key={i} className="hf-trending-row">
                  <div className="hf-trending-icon" style={{ background: `${space.color}18`, color: space.color }}>#</div>
                  <div>
                    <div className="hf-trending-name">{space.name}</div>
                    <div className="hf-trending-count">{space.posts}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Rooms */}
          <div className="hf-sidebar-card">
            <div className="hf-sidebar-head">
              <h3 className="hf-sidebar-title"><Radio size={15} color="#00f2fe" /> Live Rooms</h3>
              <button className="hf-see-all">See all</button>
            </div>
            <div className="hf-live-list">
              {liveRooms.map((room) => (
                <div key={room.id} className="hf-live-row">
                  <div className="hf-live-avatars">
                    {room.imgs.map((img, i) => (
                      <img key={i} src={img} alt="listener" className="hf-live-ava" />
                    ))}
                  </div>
                  <div>
                    <div className="hf-live-title">{room.title}</div>
                    <div className="hf-live-badge">
                      <span className="hf-live-dot"></span>
                      <span className="hf-live-tag">LIVE</span>
                      <span className="hf-live-count">{room.listeners} listening</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default HomeFeed;