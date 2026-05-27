import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, X,
  TrendingUp, Radio, Smile, Mic, Video, Image as ImageIcon, Search, Bell
} from 'lucide-react';
import { API, BACKEND_URL } from '../api';

const imgSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

const HomeFeed = ({ token, currentUser, onViewProfile }) => {
  const [posts, setPosts] = useState([]);
  const [isPopular, setIsPopular] = useState(false);
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});
  const [storyView, setStoryView] = useState(null);
  const [suggested, setSuggested] = useState([]);
  const [followingIds, setFollowingIds] = useState([]);
  const storyInputRef = useRef(null);

  useEffect(() => { fetchFeed(); fetchStories(); fetchSuggested(); }, []);

  const fetchFeed = async () => {
    try {
      const res = await fetch(`${API}/posts/feed`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPosts(data); setIsPopular(false);
      } else {
        const popRes = await fetch(`${API}/posts/popular`, { headers: { Authorization: `Bearer ${token}` } });
        const popData = await popRes.json();
        setPosts(Array.isArray(popData) ? popData : []);
        setIsPopular(Array.isArray(popData) && popData.length > 0);
      }
    } catch (err) { console.error(err); }
  };

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API}/stories`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!Array.isArray(data)) return;
      const grouped = {};
      data.forEach(s => {
        if (!grouped[s.user_id]) grouped[s.user_id] = { user_id: s.user_id, username: s.username, profile_picture: s.profile_picture, stories: [] };
        grouped[s.user_id].stories.push(s);
      });
      const all = Object.values(grouped);
      setMyStories((all.find(g => g.user_id === currentUser?.id) || { stories: [] }).stories);
      setStories(all.filter(g => g.user_id !== currentUser?.id));
    } catch (err) { console.error(err); }
  };

  const fetchSuggested = async () => {
    try {
      const [allRes, followingRes] = await Promise.all([
        fetch(`${API}/users/all`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/follows/my/following`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const allUsers = await allRes.json();
      const following = await followingRes.json();
      const followingIdList = Array.isArray(following) ? following.map(u => Number(u.id)) : [];
      setFollowingIds(followingIdList);
      const notFollowed = Array.isArray(allUsers) ? allUsers.filter(u => !followingIdList.includes(Number(u.id))).slice(0, 5) : [];
      setSuggested(notFollowed);
    } catch (err) { console.error(err); }
  };

  const handleStory = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const formData = new FormData();
    formData.append('media', f);
    try {
      await fetch(`${API}/stories`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      fetchStories();
    } catch (err) { console.error(err); }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      await fetch(`${API}/likes/${postId}`, { method: isLiked ? 'DELETE' : 'POST', headers: { Authorization: `Bearer ${token}` } });
      fetchFeed();
    } catch (err) { console.error(err); }
  };

  const fetchComments = async (postId) => {
    try {
      const res = await fetch(`${API}/comments/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setComments(prev => ({ ...prev, [postId]: Array.isArray(data) ? data : [] }));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return;
    try {
      await fetch(`${API}/comments/${postId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText[postId] })
      });
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId); fetchFeed();
    } catch (err) { console.error(err); }
  };

  const handleFollow = async (userId) => {
    try {
      await fetch(`${API}/follows/${userId}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      setFollowingIds(prev => [...prev, userId]);
      setSuggested(prev => prev.filter(u => u.id !== userId));
    } catch (err) { console.error(err); }
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  const currentStory = storyView ? storyView.group.stories[storyView.index] : null;

  // ── Avatar with optional gradient story / live ring ──
  const Avatar = ({ src, name, size = 36, ring = 'none' }) => {
    const ringStyle =
      ring === 'story'
        ? { background: 'linear-gradient(135deg,#ff4d00,#ff007a,#c800ff)' }
        : ring === 'live'
        ? { background: 'linear-gradient(135deg,#c800ff,#3b82f6)' }
        : { background: '#2a2a2a' };
    return (
      <div style={{
        width: size + 6, height: size + 6, borderRadius: '50%',
        padding: 2, ...ringStyle, display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: '#0a0a0a', padding: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%',
            background: '#1a1a1a', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#888', fontWeight: 700, fontSize: size * 0.4
          }}>
            {src
              ? <img src={imgSrc(src)} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (name?.[0]?.toUpperCase() || '?')
            }
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="hf-root" style={{
      display: 'flex', gap: 0,
      background: '#0a0a0a', color: '#fff', minHeight: '100vh',
      maxWidth: 1400, margin: '0 auto'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        .hf-root { font-family: 'DM Sans', sans-serif; }
        .hf-syne { font-family: 'Syne', sans-serif; letter-spacing: 0.02em; }

        .stories-scroll::-webkit-scrollbar { display: none; }
        .stories-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        .cv-card {
          background: #111; border: 1px solid #1e1e1e; border-radius: 18px;
          transition: border-color 0.2s;
        }
        .cv-card:hover { border-color: #2a2a2a; }

        .cv-composer-input {
          background: transparent; border: none; outline: none;
          color: #ccc; font-size: 14px; width: 100%; caret-color: #ff4d00;
        }
        .cv-composer-input::placeholder { color: #555; }

        .cv-composer-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #888; font-size: 13px; font-weight: 600; padding: 6px 0;
          transition: color 0.15s;
        }
        .cv-composer-btn:hover { color: #fff; }

        .cv-post-action {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          color: #aaa; font-size: 13px; font-weight: 600; padding: 0;
          transition: color 0.15s, transform 0.1s;
        }
        .cv-post-action:hover { color: #fff; }
        .cv-post-action:active { transform: scale(0.95); }

        .cv-comment-input {
          background: transparent; border: none; outline: none;
          color: #ccc; font-size: 13px; flex: 1; caret-color: #ff4d00;
        }
        .cv-comment-input::placeholder { color: #3a3a3a; }

        .cv-follow-btn {
          background: none; border: 1px solid #2a2a2a;
          border-radius: 8px; padding: 5px 14px;
          color: #ff4d00; font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all 0.15s;
          letter-spacing: 0.03em;
        }
        .cv-follow-btn:hover { background: rgba(255,77,0,0.1); border-color: #ff4d00; }

        .cv-hashtag { color: #c800ff; font-weight: 600; }

        .cv-live-badge {
          position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(90deg, #ff4d00, #c800ff);
          border-radius: 4px; padding: 2px 7px;
          font-size: 9px; font-weight: 800; color: #fff;
          font-family: 'Syne', sans-serif; letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .cv-trending-card {
          background: #111; border: 1px solid #1e1e1e;
          border-radius: 14px; padding: 12px 14px;
          display: flex; align-items: center; justify-content: space-between;
          flex: 1; min-width: 0; cursor: pointer;
          transition: all 0.15s;
        }
        .cv-trending-card:hover { border-color: #2a2a2a; background: #161616; }

        .cv-section-title {
          display: flex; align-items: center; gap: 8px;
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase;
        }

        .cv-see-all {
          background: none; border: none; cursor: pointer;
          color: #c800ff; font-size: 12px; font-weight: 700;
          font-family: 'Syne', sans-serif; letter-spacing: 0.05em;
        }

        @media (max-width: 1024px) { .hf-right { display: none !important; } }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
      `}</style>

      {/* ── STORY VIEWER ── */}
      {storyView && currentStory && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 420, height: '100vh', maxHeight: 800 }}>
            {/* progress bars */}
            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 4, zIndex: 10 }}>
              {storyView.group.stories.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 2,
                  background: i <= storyView.index ? '#fff' : 'rgba(255,255,255,0.3)'
                }} />
              ))}
            </div>
            <div style={{ position: 'absolute', top: 28, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar src={storyView.group.profile_picture} name={storyView.group.username} size={32} ring="story" />
                <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{storyView.group.username}</span>
              </div>
              <button onClick={() => setStoryView(null)} style={{
                background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer',
                borderRadius: '50%', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={18} color="#fff" />
              </button>
            </div>
            {currentStory.media_type === 'video'
              ? <video src={imgSrc(currentStory.media_url)} autoPlay controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <img src={imgSrc(currentStory.media_url)} alt="story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            }
            <div onClick={() => storyView.index > 0 ? setStoryView({ ...storyView, index: storyView.index - 1 }) : setStoryView(null)}
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', cursor: 'pointer' }} />
            <div onClick={() => storyView.index < storyView.group.stories.length - 1 ? setStoryView({ ...storyView, index: storyView.index + 1 }) : setStoryView(null)}
              style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '60%', cursor: 'pointer' }} />
          </div>
        </div>
      )}

      {/* ════════════ FEED COLUMN ════════════ */}
      <div style={{ flex: 1, minWidth: 0, maxWidth: 680, margin: '0 auto', padding: '20px 0' }}>

        {/* ── TOP BAR (search + bell) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 14px 16px' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 8,
            background: '#111', border: '1px solid #1e1e1e', borderRadius: 12,
            padding: '10px 14px'
          }}>
            <Search size={16} color="#555" />
            <input placeholder="Search ChatVitte" className="cv-composer-input" />
          </div>
          <button style={{
            background: '#111', border: '1px solid #1e1e1e', borderRadius: 12,
            width: 42, height: 42, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', position: 'relative'
          }}>
            <Bell size={18} color="#ccc" />
            <span style={{
              position: 'absolute', top: 8, right: 10, width: 8, height: 8,
              borderRadius: '50%', background: '#ff4d00'
            }} />
          </button>
        </div>

        {/* ── STORIES ── */}
        <div className="stories-scroll" style={{
          display: 'flex', gap: 14, overflowX: 'auto',
          padding: '4px 14px 16px', scrollSnapType: 'x mandatory'
        }}>
          {/* My story */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              {myStories.length > 0 ? (
                <button onClick={() => setStoryView({
                  group: { user_id: currentUser?.id, username: currentUser?.username, profile_picture: currentUser?.profile_picture, stories: myStories },
                  index: 0
                })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Avatar src={currentUser?.profile_picture} name={currentUser?.username} size={62} ring="story" />
                </button>
              ) : (
                <Avatar src={currentUser?.profile_picture} name={currentUser?.username} size={62} ring="none" />
              )}
              <label style={{
                position: 'absolute', bottom: -2, right: -2,
                background: 'linear-gradient(135deg,#ff4d00,#c800ff)',
                width: 22, height: 22, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid #0a0a0a'
              }}>
                <Plus size={13} color="#fff" />
                <input ref={storyInputRef} type="file" accept="image/*,video/*" onChange={handleStory} style={{ display: 'none' }} />
              </label>
            </div>
            <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500 }}>Your Story</span>
          </div>

          {stories.map(group => {
            const isLive = group.stories.some(s => s.is_live);
            return (
              <div key={group.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setStoryView({ group, index: 0 })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Avatar src={group.profile_picture} name={group.username} size={62} ring={isLive ? 'live' : 'story'} />
                  </button>
                  {isLive && <span className="cv-live-badge">LIVE</span>}
                </div>
                <span style={{ fontSize: 11, color: '#aaa', fontWeight: 500, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {group.username}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── COMPOSER ── */}
        <div className="cv-card" style={{ margin: '0 14px 16px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={currentUser?.profile_picture} name={currentUser?.username} size={36} />
            <input placeholder={`What's on your mind, ${currentUser?.username || 'friend'}?`} className="cv-composer-input" />
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{
                  width: 3, height: 8 + Math.abs(2 - i) * 4,
                  background: '#ff4d00', borderRadius: 2, opacity: 0.7
                }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, marginTop: 12, borderTop: '1px solid #1e1e1e', paddingTop: 10 }}>
            <button className="cv-composer-btn"><ImageIcon size={16} color="#7c3aed" /> Photo</button>
            <button className="cv-composer-btn"><Video size={16} color="#7c3aed" /> Video</button>
            <button className="cv-composer-btn"><Mic size={16} color="#ff4d00" /> Voice</button>
            <button className="cv-composer-btn"><Smile size={16} color="#ff9500" /> Vibe</button>
          </div>
        </div>

        {/* ── TODAY'S PULSE ── */}
        <div className="cv-card" style={{
          margin: '0 14px 16px', padding: 18,
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <TrendingUp size={14} color="#ff4d00" />
              <span className="cv-syne" style={{ fontSize: 12, fontWeight: 800, color: '#ff4d00', letterSpacing: '0.08em' }}>TODAY'S PULSE</span>
            </div>
            <p style={{ margin: 0, color: '#888', fontSize: 12 }}>Kigali, Rwanda</p>
            <p className="hf-syne" style={{ margin: '6px 0 0', color: '#fff', fontSize: 32, fontWeight: 900, lineHeight: 1 }}>127</p>
            <p style={{ margin: '2px 0 8px', color: '#888', fontSize: 11 }}>people posting</p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 6, padding: '2px 8px', color: '#22c55e', fontSize: 11, fontWeight: 700
            }}>↗ 23%</span>
          </div>

          {/* Radar visual */}
          <div style={{ width: 90, height: 90, position: 'relative' }}>
            <svg viewBox="0 0 100 100" width="90" height="90">
              {[20, 35, 50].map(r => (
                <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(200,0,255,0.25)" strokeWidth="0.5" />
              ))}
              <circle cx="32" cy="38" r="3" fill="#ff4d00" />
              <circle cx="68" cy="44" r="3" fill="#c800ff" />
              <circle cx="55" cy="68" r="3" fill="#ff4d00" />
              <line x1="50" y1="50" x2="32" y2="38" stroke="rgba(200,0,255,0.5)" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="68" y2="44" stroke="rgba(200,0,255,0.5)" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="55" y2="68" stroke="rgba(200,0,255,0.5)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="2" fill="#fff" />
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>🌙</span>
              <span className="hf-syne" style={{ fontSize: 13, fontWeight: 800, color: '#c800ff' }}>Night Vibe</span>
            </div>
            <span style={{
              display: 'inline-block', background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)', borderRadius: 6,
              padding: '3px 10px', color: '#22c55e', fontSize: 11, fontWeight: 700, marginBottom: 6
            }}>Very Active</span>
            <p style={{ margin: 0, color: '#888', fontSize: 11, lineHeight: 1.4 }}>People are posting more at night</p>
          </div>
        </div>

        {isPopular && posts.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 14px 12px' }}>
            <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
            <span className="hf-syne" style={{ color: '#888', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>✦ SUGGESTED FOR YOU</span>
            <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
          </div>
        )}

        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
            <MessageCircle size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 14 }}>No posts yet.</p>
            <p style={{ margin: '4px 0 0', fontSize: 12 }}>Be the first to post!</p>
          </div>
        )}

        {/* ── POSTS ── */}
        {posts.map(post => (
          <article key={post.id} className="cv-card" style={{ margin: '0 14px 16px', overflow: 'hidden' }}>
            {/* Post header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
              <button onClick={() => onViewProfile && onViewProfile(post.user_id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Avatar src={post.profile_picture} name={post.username} size={40} ring="story" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <p style={{ margin: 0, color: '#fff', fontSize: 14, fontWeight: 700 }}>{post.username}</p>
                    {post.is_verified && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#c800ff">
                        <path d="M12 2l2.39 3.42L18.5 4l-.41 4.13L22 10l-2.39 3.42L21 17.5l-4.13.41L15.42 22 12 19.61 8.58 22l-1.45-4.09L3 17.5l1.91-4.08L2.5 10l3.91-1.87L6 4l4.13 1.42L12 2zm-1.5 13.5l5-5-1.06-1.06-3.94 3.94-1.94-1.94L7.5 12.5l3 3z"/>
                      </svg>
                    )}
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: 11 }}>
                    {formatTime(post.created_at)} · {post.location || 'Kigali, Rwanda'}
                  </p>
                </div>
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Caption */}
            {post.caption && (
              <div style={{ padding: '0 16px 12px', color: '#e5e5e5', fontSize: 14, lineHeight: 1.5 }}>
                {post.caption.split(' ').map((word, i) =>
                  word.startsWith('#')
                    ? <span key={i} className="cv-hashtag">{word} </span>
                    : word + ' '
                )}
              </div>
            )}

            {/* Media */}
            {post.media_url && (
              <div style={{ position: 'relative', background: '#000' }}>
                {post.media_type === 'video'
                  ? <video src={imgSrc(post.media_url)} controls style={{ width: '100%', display: 'block', maxHeight: 600, objectFit: 'cover' }} />
                  : <img src={imgSrc(post.media_url)} alt="" style={{ width: '100%', display: 'block', maxHeight: 600, objectFit: 'cover' }} />
                }
                {post.images_count > 1 && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 12
                  }}>
                    1/{post.images_count}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <button className="cv-post-action" onClick={() => handleLike(post.id, post.is_liked)}>
                    <Heart size={20} fill={post.is_liked ? '#ff007a' : 'none'} color={post.is_liked ? '#ff007a' : '#aaa'} />
                    <span style={{ color: post.is_liked ? '#ff007a' : '#aaa' }}>
                      {Number(post.likes_count || 0).toLocaleString()}
                    </span>
                  </button>
                  <button className="cv-post-action" onClick={() => {
                    setShowComments(p => ({ ...p, [post.id]: !p[post.id] }));
                    fetchComments(post.id);
                  }}>
                    <MessageCircle size={20} />
                    <span>{post.comments_count || 0}</span>
                  </button>
                  <button className="cv-post-action">
                    <Send size={20} color="#c800ff" />
                    <span>{post.shares_count || 0}</span>
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button className="cv-post-action"><Smile size={20} color="#ff9500" /></button>
                  <button className="cv-post-action"><Bookmark size={20} /></button>
                </div>
              </div>

              {/* Comments */}
              {showComments[post.id] && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #1e1e1e' }}>
                  {(comments[post.id] || []).map(c => (
                    <div key={c.id} style={{ fontSize: 13, color: '#ccc', marginBottom: 6 }}>
                      <span style={{ color: '#fff', fontWeight: 700, marginRight: 6 }}>{c.username}</span>
                      {c.content}
                    </div>
                  ))}
                </div>
              )}

              {/* Comment input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid #1e1e1e' }}>
                <Avatar src={currentUser?.profile_picture} name={currentUser?.username} size={26} />
                <input
                  placeholder="Add a comment..."
                  className="cv-comment-input"
                  value={commentText[post.id] || ''}
                  onChange={(e) => setCommentText(p => ({ ...p, [post.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                />
                {commentText[post.id] && (
                  <button onClick={() => handleComment(post.id)} className="hf-syne" style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#ff4d00', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em'
                  }}>POST</button>
                )}
              </div>
            </div>
          </article>
        ))}

        {/* ── TRENDING NOW ── */}
        {posts.length > 0 && (
          <div style={{ margin: '0 14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="cv-section-title">
                <span style={{ fontSize: 16 }}>🔥</span>
                <span style={{ color: '#fff' }}>Trending Now</span>
              </div>
              <button className="cv-see-all">See all →</button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { emoji: '😊', label: 'Mood Swing', count: '3.2K', bg: 'rgba(255,149,0,0.15)' },
                { emoji: '🚗', label: 'Night Drive', count: '2.7K', bg: 'rgba(59,130,246,0.15)' },
                { emoji: '⚡', label: 'Unstoppable', count: '2.1K', bg: 'rgba(255,77,0,0.15)' },
              ].map((t, i) => (
                <div key={i} className="cv-trending-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: t.bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0
                    }}>{t.emoji}</div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, color: '#fff', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.label}</p>
                      <p style={{ margin: 0, color: '#666', fontSize: 10 }}>{t.count} posts</p>
                    </div>
                  </div>
                  <TrendingUp size={14} color="#22c55e" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ════════════ RIGHT SIDEBAR ════════════ */}
      <aside className="hf-right" style={{ width: 320, flexShrink: 0, padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {suggested.length > 0 && (
          <div className="cv-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="cv-section-title" style={{ color: '#fff', fontSize: 12 }}>SUGGESTED FOR YOU</span>
              <button className="cv-see-all" style={{ fontSize: 11 }}>See all</button>
            </div>
            {suggested.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <button onClick={() => onViewProfile && onViewProfile(u.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1, minWidth: 0 }}>
                  <Avatar src={u.profile_picture} name={u.username} size={38} />
                  <div style={{ textAlign: 'left', minWidth: 0 }}>
                    <p style={{ margin: 0, color: '#fff', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.username}</p>
                    <p style={{ margin: 0, color: '#666', fontSize: 11 }}>Suggested for you</p>
                  </div>
                </button>
                <button className="cv-follow-btn" onClick={() => handleFollow(u.id)}>Follow</button>
              </div>
            ))}
          </div>
        )}

        {/* Live rooms teaser */}
        <div className="cv-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div className="cv-section-title" style={{ color: '#fff', fontSize: 12 }}>
              <Radio size={14} color="#22c55e" />
              <span>LIVE ROOMS</span>
            </div>
            <button className="cv-see-all" style={{ fontSize: 11 }}>See all →</button>
          </div>
          {[
            { count: 231, color: '#ff4d00' },
            { count: 187, color: '#c800ff' },
            { count: 98, color: '#3b82f6' }
          ].map((room, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: 10, marginBottom: i < 2 ? 8 : 0,
              background: '#0d0d0d', border: '1px solid #1e1e1e',
              borderRadius: 12, cursor: 'pointer', transition: 'border-color 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: `${room.color}25`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Radio size={18} color={room.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800,
                    padding: '1px 5px', borderRadius: 3, fontFamily: 'Syne, sans-serif', letterSpacing: '0.05em'
                  }}>LIVE</span>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{room.count} listening</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {[...Array(4)].map((_, j) => (
                    <div key={j} style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: ['#ff4d00', '#22c55e', '#c800ff', '#3b82f6'][j],
                      border: '2px solid #0d0d0d',
                      marginLeft: j > 0 ? -6 : 0
                    }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default HomeFeed;
