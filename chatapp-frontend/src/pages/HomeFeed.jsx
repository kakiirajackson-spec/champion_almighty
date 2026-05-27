import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, X, TrendingUp, Radio, Smile, Mic, Video, Image } from 'lucide-react';
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

  const Avatar = ({ src, name, size = 36, liveRing = false, storyRing = false }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      padding: liveRing || storyRing ? 2 : 0,
      background: liveRing
        ? 'linear-gradient(135deg, #ff4d00, #c800ff)'
        : storyRing
          ? 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)'
          : 'transparent',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        padding: liveRing || storyRing ? 2 : 0,
        background: liveRing || storyRing ? '#0a0a0a' : 'transparent',
        boxSizing: 'border-box',
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%',
          overflow: 'hidden', background: 'linear-gradient(135deg, #ff4d00, #c800ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: size * 0.38, color: '#fff',
        }}>
          {src
            ? <img src={imgSrc(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            : name?.[0]?.toUpperCase()
          }
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', background: '#0a0a0a', minHeight: '100%' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

        .hf-root { font-family: 'DM Sans', sans-serif; }

        /* Stories scrollbar hidden */
        .stories-scroll::-webkit-scrollbar { display: none; }
        .stories-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        /* Composer */
        .cv-composer {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 16px;
          margin: 12px 14px;
          padding: 14px 16px;
        }
        .cv-composer-input {
          background: transparent; border: none; outline: none;
          color: #888; font-size: 14px; font-family: 'DM Sans', sans-serif;
          width: 100%; caret-color: #ff4d00;
        }
        .cv-composer-input::placeholder { color: #444; }
        .cv-composer-actions {
          display: flex; gap: 0; margin-top: 12px;
          border-top: 1px solid #1e1e1e; padding-top: 12px;
        }
        .cv-composer-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: #555; font-size: 12px; font-family: 'DM Sans', sans-serif;
          font-weight: 600; padding: 4px 0;
          transition: color 0.15s;
          letter-spacing: 0.02em;
        }
        .cv-composer-btn:hover { color: #aaa; }

        /* Pulse widget */
        .cv-pulse {
          margin: 4px 14px 12px;
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 16px;
          padding: 16px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 12px;
          align-items: center;
        }

        /* Post card */
        .cv-post {
          margin: 0 14px 16px;
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 18px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .cv-post:hover { border-color: #2a2a2a; }

        /* Post actions */
        .cv-post-action {
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          color: #888; font-size: 13px; font-family: 'DM Sans', sans-serif;
          font-weight: 500; padding: 0; transition: color 0.15s;
        }
        .cv-post-action:hover { color: #fff; }

        /* Trending */
        .cv-trending-card {
          background: #111; border: 1px solid #1e1e1e;
          border-radius: 14px; padding: 12px 14px;
          display: flex; align-items: center; justify-content: space-between;
          flex: 1; min-width: 0;
          transition: border-color 0.15s, background 0.15s;
          cursor: pointer;
        }
        .cv-trending-card:hover { border-color: #2a2a2a; background: #161616; }

        /* Comment input */
        .cv-comment-input {
          background: transparent; border: none; outline: none;
          color: #ccc; font-size: 13px; font-family: 'DM Sans', sans-serif;
          flex: 1; caret-color: #ff4d00;
        }
        .cv-comment-input::placeholder { color: #3a3a3a; }

        /* Follow button */
        .cv-follow-btn {
          background: none; border: 1px solid #2a2a2a;
          border-radius: 8px; padding: 5px 14px;
          color: #ff4d00; font-size: 12px; font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          letter-spacing: 0.03em;
        }
        .cv-follow-btn:hover { background: rgba(255,77,0,0.1); border-color: #ff4d00; }

        /* Hashtag */
        .cv-hashtag { color: #c800ff; font-weight: 600; }

        /* Live badge */
        .cv-live-badge {
          position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(90deg, #ff4d00, #c800ff);
          border-radius: 4px; padding: 1px 6px;
          font-size: 9px; font-weight: 800; color: #fff;
          font-family: 'Syne', sans-serif; letter-spacing: 0.08em;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .hf-right { display: none !important; }
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }
      `}</style>

      {/* ── STORY VIEWER ── */}
      {storyView && currentStory && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 400, height: '100vh' }}>
            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 4, zIndex: 10 }}>
              {storyView.group.stories.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 99, background: i <= storyView.index ? '#ff4d00' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
            <div style={{ position: 'absolute', top: 28, left: 16, right: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar src={storyView.group.profile_picture} name={storyView.group.username} size={38} liveRing />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>{storyView.group.username}</span>
              </div>
              <button onClick={() => setStoryView(null)} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#fff" />
              </button>
            </div>
            {currentStory.media_type === 'video'
              ? <video src={imgSrc(currentStory.media_url)} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <img src={imgSrc(currentStory.media_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            }
            <button style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: 'none', border: 'none', cursor: 'pointer', zIndex: 20 }}
              onClick={() => storyView.index > 0 ? setStoryView({ ...storyView, index: storyView.index - 1 }) : setStoryView(null)} />
            <button style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: 'none', border: 'none', cursor: 'pointer', zIndex: 20 }}
              onClick={() => storyView.index < storyView.group.stories.length - 1 ? setStoryView({ ...storyView, index: storyView.index + 1 }) : setStoryView(null)} />
          </div>
        </div>
      )}

      {/* ── FEED COLUMN ── */}
      <div className="hf-root" style={{ width: '100%', maxWidth: 500, paddingBottom: 40 }}>

        {/* ── STORIES ── */}
        <div className="stories-scroll" style={{ display: 'flex', gap: 14, padding: '14px 16px 10px', overflowX: 'auto' }}>

          {/* My story */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              {myStories.length > 0 ? (
                <button onClick={() => setStoryView({ group: { user_id: currentUser?.id, username: currentUser?.username, profile_picture: currentUser?.profile_picture, stories: myStories }, index: 0 })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Avatar src={currentUser?.profile_picture} name={currentUser?.username} size={62} storyRing />
                </button>
              ) : (
                <label style={{ cursor: 'pointer', display: 'block' }}>
                  <Avatar src={currentUser?.profile_picture} name={currentUser?.username} size={62} />
                  <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleStory} />
                </label>
              )}
              <label style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 20, height: 20, borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff4d00, #c800ff)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #0a0a0a', cursor: 'pointer',
              }}>
                <Plus size={10} color="#fff" strokeWidth={3} />
                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleStory} />
              </label>
            </div>
            <span style={{ fontSize: 10, color: '#555', fontWeight: 500, letterSpacing: '0.02em' }}>Your Story</span>
          </div>

          {stories.map(group => {
            const isLive = group.stories.some(s => s.is_live);
            return (
              <div key={group.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setStoryView({ group, index: 0 })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Avatar src={group.profile_picture} name={group.username} size={62} liveRing={isLive} storyRing={!isLive} />
                  </button>
                  {isLive && <div className="cv-live-badge">LIVE</div>}
                </div>
                <span style={{ fontSize: 10, color: '#555', fontWeight: 500, maxWidth: 64, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.username}</span>
              </div>
            );
          })}
        </div>

        {/* ── COMPOSER ── */}
        <div className="cv-composer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={currentUser?.profile_picture} name={currentUser?.username} size={38} />
            <input className="cv-composer-input" placeholder={`What's on your mind, ${currentUser?.username || 'you'}?`} readOnly />
            <div style={{ color: '#ff4d00', opacity: 0.7 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="cv-composer-actions">
            <button className="cv-composer-btn"><Image size={15} color="#a855f7" /><span style={{ color: '#888' }}>Photo</span></button>
            <button className="cv-composer-btn"><Video size={15} color="#3b82f6" /><span style={{ color: '#888' }}>Video</span></button>
            <button className="cv-composer-btn"><Mic size={15} color="#ff4d00" /><span style={{ color: '#888' }}>Voice</span></button>
            <button className="cv-composer-btn"><Smile size={15} color="#eab308" /><span style={{ color: '#888' }}>Vibe</span></button>
          </div>
        </div>

        {/* ── TODAY'S PULSE ── */}
        <div className="cv-pulse">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="#ff4d00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#ff4d00', fontFamily: "'Syne', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase' }}>Today's Pulse</span>
            </div>
            <p style={{ margin: 0, fontSize: 10, color: '#555', marginBottom: 6 }}>Kigali, Rwanda</p>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#fff', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>127</p>
            <p style={{ margin: '2px 0 0', fontSize: 10, color: '#555' }}>people posting</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '2px 8px' }}>
              <TrendingUp size={10} color="#22c55e" />
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>23%</span>
            </div>
          </div>

          {/* Radar visual */}
          <div style={{ position: 'relative', width: 72, height: 72 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#1e1e1e" strokeWidth="1"/>
              <circle cx="36" cy="36" r="20" fill="none" stroke="#1e1e1e" strokeWidth="1"/>
              <circle cx="36" cy="36" r="10" fill="none" stroke="#1e1e1e" strokeWidth="1"/>
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(200,0,255,0.15)" strokeWidth="1"/>
              <circle cx="36" cy="36" r="4" fill="#c800ff"/>
              <circle cx="50" cy="26" r="3" fill="#ff4d00"/>
              <circle cx="24" cy="48" r="3" fill="#ff4d00" opacity="0.6"/>
              <line x1="36" y1="36" x2="50" y2="26" stroke="rgba(255,77,0,0.3)" strokeWidth="1"/>
              <line x1="36" y1="36" x2="24" y2="48" stroke="rgba(255,77,0,0.2)" strokeWidth="1"/>
            </svg>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>🌙</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif" }}>Night Vibe</span>
            </div>
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 5, padding: '2px 7px', marginBottom: 5 }}>Very Active</span>
            <p style={{ margin: 0, fontSize: 10, color: '#555', lineHeight: 1.4 }}>People are posting more at night</p>
          </div>
        </div>

        {isPopular && posts.length > 0 && (
          <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
            <span style={{ fontSize: 11, color: '#555', fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>✦ Suggested for you</span>
            <div style={{ flex: 1, height: 1, background: '#1e1e1e' }} />
          </div>
        )}

        {posts.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#2a2a2a', gap: 14 }}>
            <MessageCircle size={44} />
            <p style={{ fontSize: 14, textAlign: 'center', color: '#444', fontFamily: "'DM Sans', sans-serif" }}>No posts yet.<br />Be the first to post!</p>
          </div>
        )}

        {/* ── POSTS ── */}
        {posts.map(post => (
          <div key={post.id} className="cv-post">

            {/* Post header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 10px' }}>
              <button onClick={() => onViewProfile && onViewProfile(post.user_id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Avatar src={post.profile_picture} name={post.username} size={40} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>{post.username}</p>
                    {post.is_verified && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: '#444', margin: 0, fontWeight: 400 }}>
                    {formatTime(post.created_at)} · {post.location || 'Kigali, Rwanda'}
                  </p>
                </div>
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4 }}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            {/* Caption */}
            {post.caption && (
              <div style={{ padding: '0 14px 10px', fontSize: 14, color: '#ccc', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                {post.caption.split(' ').map((word, i) =>
                  word.startsWith('#')
                    ? <span key={i} className="cv-hashtag">{word} </span>
                    : word + ' '
                )}
              </div>
            )}

            {/* Media */}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: '#0d0d0d', overflow: 'hidden' }}>
              {post.media_type === 'video'
                ? <video src={imgSrc(post.media_url)} controls style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : <img src={imgSrc(post.media_url)} alt="post" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              }
              {/* Carousel indicator */}
              {post.images_count > 1 && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: '3px 9px', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: "'Syne', sans-serif" }}>
                  1/{post.images_count}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ padding: '12px 14px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <button className="cv-post-action" onClick={() => handleLike(post.id, post.is_liked)}>
                    <Heart size={22} fill={post.is_liked ? '#ef4444' : 'none'} color={post.is_liked ? '#ef4444' : '#666'} strokeWidth={2} />
                    <span style={{ color: post.is_liked ? '#ef4444' : '#666' }}>{Number(post.likes_count || 0).toLocaleString()}</span>
                  </button>
                  <button className="cv-post-action" onClick={() => { setShowComments(p => ({ ...p, [post.id]: !p[post.id] })); fetchComments(post.id); }}>
                    <MessageCircle size={22} color="#666" strokeWidth={2} />
                    <span>{post.comments_count || 0}</span>
                  </button>
                  <button className="cv-post-action">
                    <Send size={21} color="#666" strokeWidth={2} />
                    <span>{post.shares_count || 0}</span>
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Bookmark size={20} color="#444" strokeWidth={2} style={{ cursor: 'pointer' }} />
                  <Smile size={20} color="#444" strokeWidth={2} style={{ cursor: 'pointer' }} />
                </div>
              </div>

              {/* Comments section */}
              {showComments[post.id] && (
                <div style={{ marginBottom: 8 }}>
                  {(comments[post.id] || []).map(c => (
                    <p key={c.id} style={{ fontSize: 13, margin: '4px 0', color: '#aaa', fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ fontWeight: 700, color: '#ddd', marginRight: 5 }}>{c.username}</span>{c.content}
                    </p>
                  ))}
                </div>
              )}

              {/* Comment input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #1a1a1a', paddingTop: 10, paddingBottom: 4 }}>
                <Avatar src={currentUser?.profile_picture} name={currentUser?.username} size={26} />
                <input
                  className="cv-comment-input"
                  placeholder="Add a comment..."
                  value={commentText[post.id] || ''}
                  onChange={(e) => setCommentText(p => ({ ...p, [post.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                />
                {commentText[post.id] && (
                  <button onClick={() => handleComment(post.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4d00', fontSize: 12, fontWeight: 700, fontFamily: "'Syne', sans-serif", letterSpacing: '0.04em' }}>
                    POST
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* ── TRENDING NOW ── */}
        {posts.length > 0 && (
          <div style={{ padding: '4px 14px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🔥</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.2px' }}>Trending Now</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c800ff', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>See all →</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { emoji: '😊', label: 'Mood Swing', count: '3.2K' },
                { emoji: '🚗', label: 'Night Drive', count: '2.7K' },
                { emoji: '⚡', label: 'Unstoppable', count: '2.1K' },
              ].map((t, i) => (
                <div key={i} className="cv-trending-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{t.emoji}</span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.label}</p>
                      <p style={{ margin: 0, fontSize: 10, color: '#555' }}>{t.count} posts</p>
                    </div>
                  </div>
                  <TrendingUp size={14} color="#22c55e" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT SIDEBAR (desktop) ── */}
      <div className="hf-right" style={{ width: 270, flexShrink: 0, padding: '28px 0 24px 20px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {suggested.length > 0 && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#444', margin: '0 0 16px', fontFamily: "'Syne', sans-serif", letterSpacing: '0.06em', textTransform: 'uppercase' }}>Suggested for you</p>
            {suggested.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <button onClick={() => onViewProfile && onViewProfile(u.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1, minWidth: 0 }}>
                  <Avatar src={u.profile_picture} name={u.username} size={38} />
                  <div style={{ minWidth: 0, textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>{u.username}</p>
                    <p style={{ fontSize: 11, color: '#444', margin: 0 }}>Suggested for you</p>
                  </div>
                </button>
                <button className="cv-follow-btn" onClick={() => handleFollow(u.id)}>Follow</button>
              </div>
            ))}
          </>
        )}

        {/* Live rooms teaser */}
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Radio size={13} color="#ff4d00" />
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12, color: '#fff', letterSpacing: '0.04em' }}>LIVE ROOMS</span>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c800ff', fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>See all →</button>
          </div>
          {[{ count: 231, color: '#ff4d00' }, { count: 187, color: '#c800ff' }, { count: 98, color: '#3b82f6' }].map((room, i) => (
            <div key={i} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${room.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Radio size={16} color={room.color} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: room.color, borderRadius: 4, padding: '1px 6px', fontSize: 9, fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif" }}>LIVE</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#ccc', fontFamily: "'DM Sans', sans-serif" }}>{room.count} listening</span>
                </div>
                <div style={{ display: 'flex', marginTop: 3 }}>
                  {[...Array(4)].map((_, j) => (
                    <div key={j} style={{ width: 18, height: 18, borderRadius: '50%', background: `hsl(${j * 60 + 20},80%,50%)`, border: '2px solid #111', marginLeft: j > 0 ? -6 : 0 }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;