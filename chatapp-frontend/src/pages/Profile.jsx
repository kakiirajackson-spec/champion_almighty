import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Bookmark, Film, UserSquare, X, Settings, LogOut, ArrowLeft, MessageCircle, Camera } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

const API = 'http://localhost:5000/api';

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` };
}
function getMe() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

function Avatar({ src, username, size = 'md' }) {
  const sizes = { sm: 40, md: 48, lg: 80, xl: 112 };
  const px = sizes[size] || 48;
  return src ? (
    <img src={`http://localhost:5000${src}`} alt={username}
      style={{ width: px, height: px, borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0 }} />
  ) : (
    <div style={{ width: px, height: px, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: px * 0.35 }}>
      {username ? username[0].toUpperCase() : '?'}
    </div>
  );
}

// ── User List Modal ──────────────────────────────────────────────
function UserListModal({ title, users, loading, myFollowingIds, meId, onClose, onFollow, onUnfollow, onUserClick }) {
  const { onlineUsers } = useSocket();
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ width: '100%', maxWidth: 360, margin: '0 16px', background: '#18181b', borderRadius: 16, border: '1px solid #27272a', display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #27272a' }}>
          <div style={{ width: 24 }} />
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0 }}><X size={22} /></button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#71717a', fontSize: 14 }}>Loading...</div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#71717a', fontSize: 14 }}>No users yet</div>
          ) : users.map(user => {
            const iFollow = myFollowingIds.includes(Number(user.id));
            const isOnline = onlineUsers?.has?.(Number(user.id));
            const isMe = Number(user.id) === Number(meId);
            return (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
                <button onClick={() => { onUserClick?.(user.id); onClose(); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: 0, flex: 1, textAlign: 'left' }}>
                  <Avatar src={user.profile_picture} username={user.username} size="sm" />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{user.username}</p>
                    <p style={{ fontSize: 12, color: isOnline ? '#22c55e' : '#71717a', margin: 0 }}>{isOnline ? 'Active now' : 'Offline'}</p>
                  </div>
                </button>
                {!isMe && (
                  iFollow ? (
                    <button onClick={() => onUnfollow(user.id)}
                      style={{ padding: '6px 14px', background: '#27272a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                      Following
                    </button>
                  ) : (
                    <button onClick={() => onFollow(user.id)}
                      style={{ padding: '6px 14px', background: '#2563eb', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                      {title === 'Followers' ? 'Follow back' : 'Follow'}
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Post Modal ───────────────────────────────────────────────────
function PostModal({ post, onClose, onDelete, isOwn }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '0 16px', background: '#18181b', borderRadius: 16, overflow: 'hidden' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
          <X size={18} />
        </button>
        {post.media_type === 'video'
          ? <video src={`http://localhost:5000${post.media_url}`} controls style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', background: '#000', display: 'block' }} />
          : <img src={`http://localhost:5000${post.media_url}`} alt="post" style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', background: '#000', display: 'block' }} />
        }
        <div style={{ padding: '12px 16px' }}>
          {post.caption && <p style={{ color: '#fff', fontSize: 14, marginBottom: 8 }}>{post.caption}</p>}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 16, color: '#71717a', fontSize: 14 }}>
              <span>❤️ {post.likes_count || 0}</span>
              <span>💬 {post.comments_count || 0}</span>
            </div>
            {isOwn && (
              <button onClick={() => { onDelete(post.id); onClose(); }}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Profile Modal ───────────────────────────────────────────
function EditProfileModal({ user, onClose, onSaved }) {
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let newPicture = user?.profile_picture;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarRes = await fetch(`${API}/users/me/avatar`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: formData,
        });
        const avatarData = await avatarRes.json();
        if (avatarData.profile_picture) newPicture = avatarData.profile_picture;
      }
      await fetch(`${API}/users/me`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ username, bio }) });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      const updated = { ...stored, username, bio, profile_picture: newPicture };
      localStorage.setItem('user', JSON.stringify(updated));
      onSaved(updated);
      onClose();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)' }}>
      <div style={{ width: '100%', maxWidth: 360, margin: '0 16px', background: '#18181b', borderRadius: 16, border: '1px solid #27272a' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #27272a' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0 }}><X size={20} /></button>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>Edit Profile</h2>
          <button onClick={handleSave} disabled={saving} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: 14, fontWeight: 600, opacity: saving ? 0.5 : 1 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="preview" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                : <Avatar src={user?.profile_picture} username={user?.username} size="lg" />
              }
              <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#2563eb', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Camera size={14} color="#fff" />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
            </div>
            <p style={{ color: '#3b82f6', fontSize: 13, fontWeight: 600, margin: 0, cursor: 'pointer' }}>Change photo</p>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Write something about yourself..."
              style={{ width: '100%', background: '#09090b', border: '1px solid #27272a', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Profile Page ────────────────────────────────────────────
export default function Profile({ userId, token, currentUser, onBack, onGoToDMs, onSettings }) {
  const navigate = useNavigate();
  const me = currentUser || getMe();
  const targetId = userId || me?.id;
  const isOwnProfile = !userId || Number(userId) === Number(me?.id);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [myFollowing, setMyFollowing] = useState([]);
  const [profileFollowers, setProfileFollowers] = useState([]);
  const [profileFollowing, setProfileFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [theyFollowMe, setTheyFollowMe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingUserId, setViewingUserId] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const userEndpoint = isOwnProfile ? `${API}/users/me` : `${API}/users/${targetId}`;
      const [userRes, postsRes, myFollowingRes] = await Promise.all([
        fetch(userEndpoint, { headers: authHeaders() }),
        fetch(`${API}/posts/user/${targetId}`, { headers: authHeaders() }),
        fetch(`${API}/follows/my/following`, { headers: authHeaders() }),
      ]);
      setProfile(await userRes.json());
      const postsData = await postsRes.json();
      setPosts(Array.isArray(postsData) ? postsData : []);
      const myFollowingData = await myFollowingRes.json();
      setMyFollowing(Array.isArray(myFollowingData) ? myFollowingData : []);

      if (isOwnProfile) {
        const followersRes = await fetch(`${API}/follows/my/followers`, { headers: authHeaders() });
        const followersData = await followersRes.json();
        setProfileFollowers(Array.isArray(followersData) ? followersData : []);
        setProfileFollowing(Array.isArray(myFollowingData) ? myFollowingData : []);
      } else {
        const [checkRes, myFollowersRes] = await Promise.all([
          fetch(`${API}/follows/check/${targetId}`, { headers: authHeaders() }),
          fetch(`${API}/follows/my/followers`, { headers: authHeaders() }),
        ]);
        const checkData = await checkRes.json();
        setIsFollowing(checkData.isFollowing);
        const myFollowersData = await myFollowersRes.json();
        setTheyFollowMe(Array.isArray(myFollowersData) && myFollowersData.some(u => Number(u.id) === Number(targetId)));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [targetId, isOwnProfile]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openFollowers = async () => {
    setShowFollowers(true);
    setFollowersLoading(true);
    try {
      const res = await fetch(`${API}/follows/my/followers`, { headers: authHeaders() });
      const data = await res.json();
      setProfileFollowers(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setFollowersLoading(false); }
  };

  const openFollowing = async () => {
    setShowFollowing(true);
    setFollowingLoading(true);
    try {
      const res = await fetch(`${API}/follows/my/following`, { headers: authHeaders() });
      const data = await res.json();
      setProfileFollowing(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setFollowingLoading(false); }
  };

  const handleFollow = async (id) => {
    try {
      await fetch(`${API}/follows/${id}`, { method: 'POST', headers: authHeaders() });
      if (Number(id) === Number(targetId)) setIsFollowing(true);
      const res = await fetch(`${API}/follows/my/following`, { headers: authHeaders() });
      setMyFollowing(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleUnfollow = async (id) => {
    try {
      await fetch(`${API}/follows/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (Number(id) === Number(targetId)) setIsFollowing(false);
      const res = await fetch(`${API}/follows/my/following`, { headers: authHeaders() });
      setMyFollowing(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleDeletePost = async (postId) => {
    try {
      await fetch(`${API}/posts/${postId}`, { method: 'DELETE', headers: authHeaders() });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleMessage = () => {
    if (onGoToDMs) onGoToDMs(targetId);
  };

  if (viewingUserId) {
    return <Profile userId={viewingUserId} token={token} currentUser={me} onBack={() => setViewingUserId(null)} onGoToDMs={onGoToDMs} onSettings={onSettings} />;
  }

  const tabs = [
    { id: 'posts', icon: Grid },
    { id: 'reels', icon: Film },
    ...(isOwnProfile ? [{ id: 'saved', icon: Bookmark }] : []),
    { id: 'tagged', icon: UserSquare },
  ];

  const myFollowingIds = myFollowing.map(u => Number(u.id));
  const followersCount = isOwnProfile ? profileFollowers.length : (profile?.followers_count ?? 0);
  const followingCount = isOwnProfile ? myFollowing.length : (profile?.following_count ?? 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#71717a', fontSize: 14 }}>
      Loading profile...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: 80 }}>
      <div style={{ maxWidth: 470, margin: '0 auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #27272a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {onBack && (
              <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0, display: 'flex' }}>
                <ArrowLeft size={22} />
              </button>
            )}
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{profile?.username}</h1>
          </div>
          {isOwnProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* ⚙️ now opens Settings page */}
              <button onClick={() => onSettings && onSettings()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0, display: 'flex' }}>
                <Settings size={22} />
              </button>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0, display: 'flex' }}>
                <LogOut size={22} />
              </button>
            </div>
          )}
        </div>

        {/* Profile header */}
        <div style={{ padding: '20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <Avatar src={profile?.profile_picture} username={profile?.username} size="xl" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 16 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{posts.length}</p>
                  <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Posts</p>
                </div>
                <button onClick={openFollowers} style={{ textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{followersCount}</p>
                  <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Followers</p>
                </button>
                <button onClick={openFollowing} style={{ textAlign: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0 }}>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{followingCount}</p>
                  <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>Following</p>
                </button>
              </div>
              {profile?.bio && <p style={{ fontSize: 13, color: '#d4d4d8', marginBottom: 12, whiteSpace: 'pre-wrap' }}>{profile.bio}</p>}

              {isOwnProfile ? (
                <button onClick={() => setShowEditModal(true)} style={{ padding: '7px 20px', background: '#27272a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Edit profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => isFollowing ? handleUnfollow(targetId) : handleFollow(targetId)}
                    style={{ padding: '7px 20px', background: isFollowing ? '#27272a' : '#2563eb', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', minWidth: 110 }}>
                    {isFollowing ? 'Following' : theyFollowMe ? 'Follow back' : 'Follow'}
                  </button>
                  <button onClick={handleMessage}
                    style={{ padding: '7px 20px', background: '#27272a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageCircle size={15} /> Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderTop: '1px solid #27272a', display: 'flex', justifyContent: 'center' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', background: 'none', border: 'none', borderTop: activeTab === tab.id ? '1px solid #fff' : '1px solid transparent', marginTop: -1, cursor: 'pointer', color: activeTab === tab.id ? '#fff' : '#71717a' }}>
              <tab.icon size={20} />
            </button>
          ))}
        </div>

        {/* Posts grid */}
        {activeTab === 'posts' && (
          posts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
              <Grid size={56} color="#3f3f46" style={{ marginBottom: 16 }} />
              <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>No Posts Yet</p>
              <p style={{ fontSize: 13, color: '#71717a', margin: 0 }}>{isOwnProfile ? 'Share photos to see them here' : 'No posts to show'}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              {posts.map(post => (
                <button key={post.id} onClick={() => setSelectedPost(post)}
                  style={{ position: 'relative', paddingBottom: '100%', background: 'none', border: 'none', cursor: 'pointer', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', inset: 0 }}>
                    {post.media_type === 'video'
                      ? <video src={`http://localhost:5000${post.media_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <img src={`http://localhost:5000${post.media_url}`} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    }
                  </div>
                </button>
              ))}
            </div>
          )
        )}
        {activeTab === 'reels' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}><Film size={56} color="#3f3f46" /><p style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '16px 0 0' }}>No Reels Yet</p></div>}
        {activeTab === 'saved' && isOwnProfile && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}><Bookmark size={56} color="#3f3f46" /><p style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '16px 0 0' }}>No Saved Posts</p></div>}
        {activeTab === 'tagged' && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}><UserSquare size={56} color="#3f3f46" /><p style={{ fontSize: 18, fontWeight: 600, color: '#fff', margin: '16px 0 0' }}>No Tagged Posts</p></div>}
      </div>

      {showFollowers && <UserListModal title="Followers" users={profileFollowers} loading={followersLoading} myFollowingIds={myFollowingIds} meId={me?.id} onClose={() => setShowFollowers(false)} onFollow={handleFollow} onUnfollow={handleUnfollow} onUserClick={(id) => setViewingUserId(id)} />}
      {showFollowing && <UserListModal title="Following" users={profileFollowing} loading={followingLoading} myFollowingIds={myFollowingIds} meId={me?.id} onClose={() => setShowFollowing(false)} onFollow={handleFollow} onUnfollow={handleUnfollow} onUserClick={(id) => setViewingUserId(id)} />}
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} onDelete={handleDeletePost} isOwn={isOwnProfile} />}
      {showEditModal && <EditProfileModal user={profile} onClose={() => setShowEditModal(false)} onSaved={(updated) => setProfile(prev => ({ ...prev, ...updated }))} />}
    </div>
  );
}