import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, X } from 'lucide-react';
import { API, BACKEND_URL } from '../api';

// Helper to handle both Cloudinary URLs and old local URLs
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

 return (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      background: "#000",
      minHeight: "100%",
      color: "#fff",
    }}
  >

    {/* MAIN FEED */}
    <div
      style={{
        width: "100%",
        maxWidth: 620,
        padding: "24px 20px 80px",
      }}
    >

      {/* TOP GREETING */}
      <div
        style={{
          marginBottom: 26,
        }}
      >
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            margin: 0,
            letterSpacing: -1,
          }}
        >
          Welcome back,
          <span
            style={{
              background:
                "linear-gradient(90deg,#a855f7,#ec4899,#ef4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {" "}
            {currentUser?.username}
          </span>
        </h1>

        <p
          style={{
            color: "#71717a",
            marginTop: 6,
            fontSize: 14,
          }}
        >
          Discover creative people around the world.
        </p>
      </div>

      {/* STORIES */}
<div
  style={{
    display: "flex",
    gap: 16,
    overflowX: "auto",
    paddingBottom: 20,
    marginBottom: 28,
  }}
>

  {/* YOUR STORY */}
  <label
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      cursor: "pointer",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: 74,
        height: 74,
        borderRadius: "50%",
        padding: 3,
        background:
          "linear-gradient(135deg,#a855f7,#ec4899,#ef4444)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          background: "#111",
          padding: 3,
        }}
      >
        <img
          src={imgSrc(currentUser?.profile_picture)}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>

    <span
      style={{
        fontSize: 12,
        color: "#a1a1aa",
      }}
    >
      Your Story
    </span>

    <input
      type="file"
      accept="image/*,video/*"
      style={{ display: "none" }}
      onChange={handleStory}
    />
  </label>

  {/* OTHER STORIES */}
  {stories.map((group) => (
    <div
      key={group.user_id}
      onClick={() =>
        setStoryView({
          group,
          index: 0,
        })
      }
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 74,
          height: 74,
          borderRadius: "50%",
          padding: 3,
          background:
            "linear-gradient(135deg,#a855f7,#ec4899,#ef4444)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            overflow: "hidden",
            background: "#111",
            padding: 3,
          }}
        >
          <img
            src={imgSrc(group.profile_picture)}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>

      <span
        style={{
          fontSize: 12,
          color: "#a1a1aa",
          maxWidth: 80,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {group.username}
      </span>
    </div>
  ))}
</div>

      {/* CREATE THOUGHT BOX */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 24,
          padding: 20,
          marginBottom: 32,
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              overflow: "hidden",
            }}
          >
            <img
              src={imgSrc(currentUser?.profile_picture)}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <button
            style={{
              flex: 1,
              height: 50,
              borderRadius: 999,
              border: "none",
              background: "#111",
              color: "#71717a",
              textAlign: "left",
              padding: "0 20px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Share your vibe today...
          </button>
        </div>
      </div>

      {/* POSTS */}
      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            marginBottom: 34,
          }}
        >

          {/* HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  overflow: "hidden",
                }}
              >
                <img
                  src={imgSrc(post.profile_picture)}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {post.username}
                </div>

                <div
                  style={{
                    color: "#71717a",
                    fontSize: 12,
                  }}
                >
                  {formatTime(post.created_at)}
                </div>
              </div>
            </div>

            <MoreHorizontal size={18} color="#71717a" />
          </div>

          {/* IMAGE */}
          <div
            style={{
              borderRadius: 30,
              overflow: "hidden",
              background: "#111",
            }}
          >
            <img
              src={imgSrc(post.media_url)}
              alt=""
              style={{
                width: "100%",
                display: "block",
                objectFit: "cover",
                maxHeight: 720,
              }}
            />
          </div>

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 20,
              }}
            >
              <Heart size={24} />
              <MessageCircle size={24} />
              <Send size={22} />
            </div>

            <Bookmark size={22} />
          </div>

          {/* CAPTION */}
          <div
            style={{
              marginTop: 14,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                marginBottom: 5,
              }}
            >
              {Number(post.likes_count || 0).toLocaleString()} vibes
            </div>

            <div
              style={{
                color: "#d4d4d8",
                lineHeight: 1.6,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  marginRight: 6,
                  color: "#fff",
                }}
              >
                {post.username}
              </span>

              {post.caption}
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* RIGHT PANEL */}
    <div
      className="right-sidebar"
      style={{
        width: 320,
        padding: "30px 24px",
      }}
    >

      {/* USER MINI CARD */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 28,
          padding: 22,
          marginBottom: 28,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <img
            src={imgSrc(currentUser?.profile_picture)}
            alt=""
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {currentUser?.username}
            </div>

            <div
              style={{
                color: "#71717a",
                fontSize: 13,
              }}
            >
              Creative Explorer
            </div>
          </div>
        </div>
      </div>

      {/* TRENDING */}
      <div>
        <h3
          style={{
            marginBottom: 18,
            fontSize: 18,
          }}
        >
          Trending Spaces
        </h3>

        {["Design", "Music", "Street", "Fashion"].map((item) => (
          <div
            key={item}
            style={{
              marginBottom: 14,
              padding: 16,
              borderRadius: 18,
              background: "#0b0b0b",
              cursor: "pointer",
            }}
          >
            #{item}
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default HomeFeed;