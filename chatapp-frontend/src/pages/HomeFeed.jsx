import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, X } from 'lucide-react';
import { API, BACKEND_URL } from '../api';

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
        setPosts(data);
        setIsPopular(false);
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
      const notFollowed = Array.isArray(allUsers)
        ? allUsers.filter(u => !followingIdList.includes(Number(u.id))).slice(0, 5)
        : [];
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
      await fetch(`${API}/likes/${postId}`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
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
      fetchComments(postId);
      fetchFeed();
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', background: '#000', minHeight: '100%' }}>

      {/* CENTER: Feed */}
      <div style={{ width: '100%', maxWidth: 470, paddingBottom: 40 }}>

        {/* Story Viewer */}
        {storyView && currentStory && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 400, height: '100vh' }}>
              <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: 4, zIndex: 10 }}>
                {storyView.group.stories.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 2, borderRadius: 99, background: i <= storyView.index ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
              <div style={{ position: 'absolute', top: 28, left: 16, right: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 14, border: '2px solid #fff' }}>
                    {storyView.group.profile_picture
                      ? <img src={`${BACKEND_URL}${storyView.group.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : storyView.group.username?.[0]?.toUpperCase()
                    }
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{storyView.group.username}</span>
                </div>
                <button onClick={() => setStoryView(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="#fff" />
                </button>
              </div>
              {currentStory.media_type === 'video'
                ? <video src={`${BACKEND_URL}${currentStory.media_url}`} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <img src={`${BACKEND_URL}${currentStory.media_url}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              }
              <button style={{ position: 'absolute', left: 0, top: 0, width: '50%', height: '100%', background: 'none', border: 'none', cursor: 'pointer', zIndex: 20 }}
                onClick={() => storyView.index > 0 ? setStoryView({ ...storyView, index: storyView.index - 1 }) : setStoryView(null)} />
              <button style={{ position: 'absolute', right: 0, top: 0, width: '50%', height: '100%', background: 'none', border: 'none', cursor: 'pointer', zIndex: 20 }}
                onClick={() => storyView.index < storyView.group.stories.length - 1 ? setStoryView({ ...storyView, index: storyView.index + 1 }) : setStoryView(null)} />
            </div>
          </div>
        )}

        {/* Stories Bar */}
        <div style={{ display: 'flex', gap: 12, padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid #27272a' }}>
          {/* My story */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, position: 'relative' }}>
            {myStories.length > 0 ? (
              <>
                <button onClick={() => setStoryView({ group: { user_id: currentUser?.id, username: currentUser?.username, profile_picture: currentUser?.profile_picture, stories: myStories }, index: 0 })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <div style={{ width: 66, height: 66, borderRadius: '50%', padding: 2, background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: 2, background: '#000' }}>
                      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
                        {myStories[0].media_type === 'image'
                          ? <img src={`${BACKEND_URL}${myStories[0].media_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 20 }}>{currentUser?.username?.[0]?.toUpperCase()}</div>
                        }
                      </div>
                    </div>
                  </div>
                </button>
                <label style={{ position: 'absolute', bottom: 22, right: 0, width: 20, height: 20, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #000', cursor: 'pointer' }}>
                  <Plus size={10} color="#fff" />
                  <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleStory} />
                </label>
              </>
            ) : (
              <label style={{ cursor: 'pointer' }}>
                <div style={{ width: 66, height: 66, borderRadius: '50%', padding: 2, background: '#3f3f46' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: 2, background: '#000' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 'bold', position: 'relative', overflow: 'hidden' }}>
                      {currentUser?.profile_picture
                        ? <img src={`${BACKEND_URL}${currentUser.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : currentUser?.username?.[0]?.toUpperCase()
                      }
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #000' }}>
                        <Plus size={10} color="#fff" />
                      </div>
                    </div>
                  </div>
                </div>
                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleStory} />
              </label>
            )}
            <span style={{ fontSize: 10, color: '#a1a1aa' }}>Your story</span>
          </div>

          {/* Others stories */}
          {stories.map(group => (
            <div key={group.user_id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button onClick={() => setStoryView({ group, index: 0 })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <div style={{ width: 66, height: 66, borderRadius: '50%', padding: 2, background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', padding: 2, background: '#000' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3f3f46', fontWeight: 'bold', fontSize: 20 }}>
                      {group.profile_picture
                        ? <img src={`${BACKEND_URL}${group.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : group.username?.[0]?.toUpperCase()
                      }
                    </div>
                  </div>
                </div>
              </button>
              <span style={{ fontSize: 10, color: '#a1a1aa', maxWidth: 66, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.username}</span>
            </div>
          ))}
        </div>

        {/* Popular label */}
        {isPopular && posts.length > 0 && (
          <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, height: 1, background: '#27272a' }} />
            <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600, whiteSpace: 'nowrap' }}>✨ Suggested for you</span>
            <div style={{ flex: 1, height: 1, background: '#27272a' }} />
          </div>
        )}

        {/* Empty state */}
        {posts.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: '#52525b', gap: 12 }}>
            <MessageCircle size={48} />
            <p style={{ fontSize: 14, textAlign: 'center' }}>No posts yet.<br />Be the first to post!</p>
          </div>
        )}

        {/* Posts */}
        {posts.map(post => (
          <div key={post.id} style={{ borderBottom: '1px solid #27272a' }}>
            {/* Post Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
              <button onClick={() => onViewProfile && onViewProfile(post.user_id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 'bold', flexShrink: 0 }}>
                  {post.profile_picture
                    ? <img src={`${BACKEND_URL}${post.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : post.username?.[0]?.toUpperCase()
                  }
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: '#fff' }}>{post.username}</p>
                  <p style={{ fontSize: 10, color: '#71717a', margin: 0 }}>{formatTime(post.created_at)}</p>
                </div>
              </button>
              <MoreHorizontal size={20} color="#71717a" />
            </div>

            {/* Square Image */}
            <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: '#18181b', overflow: 'hidden' }}>
              {post.media_type === 'video'
                ? <video src={`${BACKEND_URL}${post.media_url}`} controls style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : <img src={`${BACKEND_URL}${post.media_url}`} alt="post" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              }
            </div>

            {/* Actions */}
            <div style={{ padding: '10px 12px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button onClick={() => handleLike(post.id, post.is_liked)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Heart size={26} fill={post.is_liked ? '#ef4444' : 'none'} color={post.is_liked ? '#ef4444' : '#fff'} />
                  </button>
                  <button onClick={() => { setShowComments(p => ({ ...p, [post.id]: !p[post.id] })); fetchComments(post.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <MessageCircle size={26} color="#fff" />
                  </button>
                  <Send size={24} color="#fff" />
                </div>
                <Bookmark size={24} color="#fff" />
              </div>

              <p style={{ fontSize: 14, fontWeight: 'bold', margin: '0 0 4px' }}>{Number(post.likes_count || 0).toLocaleString()} likes</p>

              {post.caption && (
                <p style={{ fontSize: 14, margin: '0 0 4px', color: '#fff' }}>
                  <span style={{ fontWeight: 600, marginRight: 4 }}>{post.username}</span>{post.caption}
                </p>
              )}

              {post.comments_count > 0 && (
                <button onClick={() => { setShowComments(p => ({ ...p, [post.id]: !p[post.id] })); fetchComments(post.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', fontSize: 12, padding: 0, marginBottom: 4, display: 'block' }}>
                  View all {post.comments_count} comments
                </button>
              )}

              {showComments[post.id] && (
                <div style={{ marginBottom: 8 }}>
                  {(comments[post.id] || []).map(c => (
                    <p key={c.id} style={{ fontSize: 14, margin: '2px 0', color: '#fff' }}>
                      <span style={{ fontWeight: 600, marginRight: 4 }}>{c.username}</span>{c.content}
                    </p>
                  ))}
                </div>
              )}

              {/* Comment Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #27272a', paddingTop: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold', flexShrink: 0 }}>
                  {currentUser?.profile_picture
                    ? <img src={`${BACKEND_URL}${currentUser.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : currentUser?.username?.[0]?.toUpperCase()
                  }
                </div>
                <input type="text" placeholder="Add a comment..."
                  value={commentText[post.id] || ''}
                  onChange={(e) => setCommentText(p => ({ ...p, [post.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13 }}
                />
                {commentText[post.id] && (
                  <button onClick={() => handleComment(post.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 12, fontWeight: 'bold' }}>
                    Post
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT SIDEBAR — suggested users only, no email card */}
      <div className="right-sidebar" style={{ width: 280, flexShrink: 0, padding: '32px 0 24px 24px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        {suggested.length > 0 && (
          <>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#71717a', margin: '0 0 16px' }}>Suggested for you</p>
            {suggested.map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <button onClick={() => onViewProfile && onViewProfile(u.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff' }}>
                    {u.profile_picture
                      ? <img src={`${BACKEND_URL}${u.profile_picture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : u.username?.[0]?.toUpperCase()
                    }
                  </div>
                  <div style={{ minWidth: 0, textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.username}</p>
                    <p style={{ fontSize: 11, color: '#71717a', margin: 0 }}>Suggested for you</p>
                  </div>
                </button>
                <button onClick={() => handleFollow(u.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 12, fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
                  Follow
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 1100px) { .right-sidebar { display: none !important; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default HomeFeed;