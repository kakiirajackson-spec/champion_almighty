import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { API, BACKEND_URL } from "../api";

const imgSrc = (url) => {
  if (!url) return "https://via.placeholder.com/500";
  if (url.startsWith("http")) return url;
  return `${BACKEND_URL}${url}`;
};

const HomeFeed = ({ token, currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    fetchFeed();
    fetchStories();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await fetch(`${API}/posts/feed`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API}/stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const grouped = {};

      data.forEach((s) => {
        if (!grouped[s.user_id]) {
          grouped[s.user_id] = {
            user_id: s.user_id,
            username: s.username,
            profile_picture: s.profile_picture,
          };
        }
      });

      setStories(Object.values(grouped));
    } catch (err) {
      console.log(err);
    }
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m`;
    }

    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h`;
    }

    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left,#1a0826,#050505 40%)",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          display: "grid",
          gridTemplateColumns: "240px 1fr 320px",
          gap: "24px",
        }}
      >
        {/* LEFT */}
        <div
          className="left-sidebar"
          style={{
            position: "sticky",
            top: 20,
            height: "fit-content",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "28px",
            padding: "24px",
            backdropFilter: "blur(20px)",
          }}
        >
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 40,
              background:
                "linear-gradient(90deg,#a855f7,#ec4899,#ef4444)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ChatVitte
          </h1>

          {[
            "Home",
            "Discover",
            "Messages",
            "Profile",
            "Bookmarks",
            "Settings",
          ].map((item) => (
            <div
              key={item}
              style={{
                padding: "14px 18px",
                borderRadius: "18px",
                marginBottom: 10,
                background:
                  item === "Home"
                    ? "rgba(168,85,247,0.15)"
                    : "transparent",
                cursor: "pointer",
                fontWeight: item === "Home" ? 700 : 500,
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* CENTER */}
        <div>
          {/* GREETING */}
          <div style={{ marginBottom: 30 }}>
            <h1
              style={{
                fontSize: 38,
                marginBottom: 8,
                lineHeight: 1.1,
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
                color: "#9ca3af",
              }}
            >
              Discover creators, vibes and underground culture.
            </p>
          </div>

          {/* STORIES */}
          <div
            style={{
              display: "flex",
              gap: 18,
              overflowX: "auto",
              marginBottom: 30,
              paddingBottom: 10,
            }}
          >
            {/* YOUR STORY */}
            <div
              style={{
                flexShrink: 0,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  padding: 3,
                  background:
                    "linear-gradient(135deg,#a855f7,#ec4899,#ef4444)",
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
                    border: "3px solid #000",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "#9ca3af",
                }}
              >
                Your Story
              </div>
            </div>

            {/* OTHERS */}
            {stories.map((story) => (
              <div
                key={story.user_id}
                style={{
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    padding: 3,
                    background:
                      "linear-gradient(135deg,#a855f7,#ec4899,#ef4444)",
                  }}
                >
                  <img
                    src={imgSrc(story.profile_picture)}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #000",
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#9ca3af",
                    maxWidth: 90,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {story.username}
                </div>
              </div>
            ))}
          </div>

          {/* CREATE POST */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "28px",
              padding: 20,
              marginBottom: 30,
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
              }}
            >
              <img
                src={imgSrc(currentUser?.profile_picture)}
                alt=""
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />

              <button
                style={{
                  flex: 1,
                  height: 52,
                  borderRadius: 999,
                  border: "none",
                  background: "#111",
                  color: "#71717a",
                  textAlign: "left",
                  padding: "0 22px",
                  fontSize: 15,
                  cursor: "pointer",
                }}
              >
                Share your vibe today...
              </button>

              <button
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  border: "none",
                  background:
                    "linear-gradient(135deg,#a855f7,#ec4899)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                <Plus size={22} />
              </button>
            </div>
          </div>

          {/* POSTS */}
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 32,
                padding: 18,
                marginBottom: 30,
                backdropFilter: "blur(20px)",
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <img
                    src={imgSrc(post.profile_picture)}
                    alt=""
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />

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
                        fontSize: 13,
                      }}
                    >
                      {formatTime(post.created_at)}
                    </div>
                  </div>
                </div>

                <MoreHorizontal color="#9ca3af" />
              </div>

              {/* IMAGE */}
              <div
                style={{
                  overflow: "hidden",
                  borderRadius: 28,
                }}
              >
                <img
                  src={imgSrc(post.media_url)}
                  alt=""
                  style={{
                    width: "100%",
                    maxHeight: 700,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>

              {/* ACTIONS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 18,
                  }}
                >
                  <Heart />
                  <MessageCircle />
                  <Send />
                </div>

                <Bookmark />
              </div>

              {/* CAPTION */}
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 8,
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
                      color: "#fff",
                      marginRight: 6,
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

        {/* RIGHT */}
        <div
          className="right-sidebar"
          style={{
            position: "sticky",
            top: 20,
            height: "fit-content",
          }}
        >
          {/* PROFILE */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 30,
              padding: 22,
              marginBottom: 24,
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
              }}
            >
              <img
                src={imgSrc(currentUser?.profile_picture)}
                alt=""
                style={{
                  width: 62,
                  height: 62,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                  }}
                >
                  {currentUser?.username}
                </div>

                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: 13,
                  }}
                >
                  Creative Explorer
                </div>
              </div>
            </div>
          </div>

          {/* TRENDING */}
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 30,
              padding: 22,
              backdropFilter: "blur(20px)",
            }}
          >
            <h3
              style={{
                marginBottom: 20,
                fontSize: 18,
              }}
            >
              Trending Spaces
            </h3>

            {["Streetwear", "Music", "Design", "Creators"].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: "#0f0f0f",
                    marginBottom: 12,
                    cursor: "pointer",
                  }}
                >
                  #{item}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* MOBILE */}
      <style>{`
        @media(max-width:1100px){
          .right-sidebar{
            display:none;
          }
        }

        @media(max-width:850px){
          .left-sidebar{
            display:none;
          }
        }

        @media(max-width:850px){
          div[style*="grid-template-columns"]{
            grid-template-columns:1fr !important;
          }
        }

        @media(max-width:600px){
          h1{
            font-size:28px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeFeed;