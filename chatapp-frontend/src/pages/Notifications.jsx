import { useState, useEffect, useCallback } from 'react';
import { Heart, UserPlus, MessageCircle, RefreshCw } from 'lucide-react';

const API = 'http://localhost:5000/api';

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

function Avatar({ src, username, size = 44 }) {
  return src ? (
    <img src={`http://localhost:5000${src}`} alt={username}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  ) : (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: size * 0.35, flexShrink: 0 }}>
      {username ? username[0].toUpperCase() : '?'}
    </div>
  );
}

export default function Notifications({ token, currentUser, onViewProfile }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const [followersRes, postsRes, myFollowingRes] = await Promise.all([
        fetch(`${API}/follows/my/followers`, { headers: authHeaders() }),
        fetch(`${API}/posts/user/${currentUser?.id}`, { headers: authHeaders() }),
        fetch(`${API}/follows/my/following`, { headers: authHeaders() }),
      ]);

      const followers = await followersRes.json();
      const posts = await postsRes.json();
      const myFollowing = await myFollowingRes.json();

      // Track who I follow
      setFollowingIds(Array.isArray(myFollowing) ? myFollowing.map(u => Number(u.id)) : []);

      const notifs = [];

      // Follow notifications
      if (Array.isArray(followers)) {
        followers.forEach(f => {
          notifs.push({
            id: `follow-${f.id}`,
            type: 'follow',
            user: f,
            text: 'started following you',
            time: f.followed_at || f.created_at || null,
            postThumb: null,
          });
        });
      }

      // Like + comment notifications from posts
      if (Array.isArray(posts)) {
        posts.forEach(post => {
          if (post.likes_count > 0) {
            notifs.push({
              id: `like-${post.id}`,
              type: 'like',
              user: { username: `${post.likes_count} person${post.likes_count > 1 ? 's' : ''}`, profile_picture: null },
              text: 'liked your post',
              time: post.created_at,
              postThumb: post.media_url,
              userId: null,
            });
          }
          if (post.comments_count > 0) {
            notifs.push({
              id: `comment-${post.id}`,
              type: 'comment',
              user: { username: `${post.comments_count} person${post.comments_count > 1 ? 's' : ''}`, profile_picture: null },
              text: 'commented on your post',
              time: post.created_at,
              postThumb: post.media_url,
              userId: null,
            });
          }
        });
      }

      setNotifications(notifs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleFollowBack = async (e, userId) => {
    e.stopPropagation();
    try {
      await fetch(`${API}/follows/${userId}`, { method: 'POST', headers: authHeaders() });
      setFollowingIds(prev => [...prev, Number(userId)]);
    } catch (err) { console.error(err); }
  };

  const handleUnfollow = async (e, userId) => {
    e.stopPropagation();
    try {
      await fetch(`${API}/follows/${userId}`, { method: 'DELETE', headers: authHeaders() });
      setFollowingIds(prev => prev.filter(id => id !== Number(userId)));
    } catch (err) { console.error(err); }
  };

  const iconFor = (type) => {
    if (type === 'follow') return <UserPlus size={14} color="#3b82f6" />;
    if (type === 'like') return <Heart size={14} color="#ef4444" fill="#ef4444" />;
    if (type === 'comment') return <MessageCircle size={14} color="#22c55e" />;
  };

  const bgFor = (type) => {
    if (type === 'follow') return '#1d4ed8';
    if (type === 'like') return '#dc2626';
    if (type === 'comment') return '#16a34a';
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a', fontSize: 14 }}>Loading...</div>
  );

  return (
    <div style={{ maxWidth: 470, margin: '0 auto', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>Notifications</h2>
        <button onClick={fetchNotifications} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 4, display: 'flex' }}>
          <RefreshCw size={18} />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 16px', textAlign: 'center' }}>
          <UserPlus size={56} color="#27272a" style={{ marginBottom: 16 }} />
          <p style={{ color: '#fff', fontWeight: 600, fontSize: 18, margin: '0 0 4px' }}>No notifications yet</p>
          <p style={{ color: '#71717a', fontSize: 13, margin: 0 }}>When someone follows or likes your post, you'll see it here</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#a1a1aa', padding: '4px 16px', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>This week</p>
          {notifications.map(n => {
            const iFollow = n.user?.id ? followingIds.includes(Number(n.user.id)) : false;
            return (
              <div
                key={n.id}
                onClick={() => n.type === 'follow' && n.user?.id && onViewProfile?.(n.user.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: n.type === 'follow' && n.user?.id ? 'pointer' : 'default' }}
                onMouseEnter={e => { if (n.type === 'follow') e.currentTarget.style.background = '#18181b'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Avatar + icon badge */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar src={n.user?.profile_picture} username={n.user?.username} size={46} />
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 20, height: 20, borderRadius: '50%', background: bgFor(n.type), border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {iconFor(n.type)}
                  </div>
                </div>

                {/* Text + time */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: '#fff', margin: 0, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>{n.user?.username}</span>
                    {' '}<span style={{ color: '#d4d4d8' }}>{n.text}</span>
                  </p>
                  {n.time && (
                    <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0' }}>{timeAgo(n.time)}</p>
                  )}
                </div>

                {/* Post thumbnail for likes/comments */}
                {n.postThumb && (
                  <img src={`http://localhost:5000${n.postThumb}`} alt="post"
                    style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                )}

                {/* Follow back / Following button */}
                {n.type === 'follow' && n.user?.id && (
                  iFollow ? (
                    <button
                      onClick={e => handleUnfollow(e, n.user.id)}
                      style={{ padding: '6px 14px', background: '#27272a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                      Following
                    </button>
                  ) : (
                    <button
                      onClick={e => handleFollowBack(e, n.user.id)}
                      style={{ padding: '6px 14px', background: '#2563eb', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                      Follow back
                    </button>
                  )
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}