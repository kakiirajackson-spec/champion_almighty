import React from "react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Smile
} from "lucide-react";

const Avatar = ({ src, name, size = 40 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontWeight: 700
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        name?.[0]?.toUpperCase()
      )}
    </div>
  );
};

const PostCard = ({
  post,
  currentUser,
  comments,
  commentText,
  showComments,
  onViewProfile,
  handleLike,
  handleComment,
  fetchComments,
  setCommentText,
  setShowComments,
  formatTime,
  imgSrc
}) => {
  return (
    <article
      className="cv-card"
      style={{
        margin: "0 14px 16px",
        overflow: "hidden"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px"
        }}
      >
        <button
          onClick={() => onViewProfile && onViewProfile(post.user_id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
        >
          <Avatar
            src={imgSrc(post.profile_picture)}
            name={post.username}
          />

          <div style={{ textAlign: "left" }}>
            <p
              style={{
                margin: 0,
                color: "#fff",
                fontWeight: 700
              }}
            >
              {post.username}
            </p>

            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: 11
              }}
            >
              {formatTime(post.created_at)}
            </p>
          </div>
        </button>

        <button
          style={{
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer"
          }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* CAPTION */}
      {post.caption && (
        <div
          style={{
            padding: "0 16px 12px",
            color: "#ddd"
          }}
        >
          {post.caption}
        </div>
      )}

      {/* IMAGE */}
      {post.media_url && (
        <img
          src={imgSrc(post.media_url)}
          alt=""
          style={{
            width: "100%",
            maxHeight: 600,
            objectFit: "cover"
          }}
        />
      )}

      {/* ACTIONS */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 18
            }}
          >
            <button
              className="cv-post-action"
              onClick={() =>
                handleLike(post.id, post.is_liked)
              }
            >
              <Heart
                size={20}
                fill={post.is_liked ? "#ff007a" : "none"}
                color={post.is_liked ? "#ff007a" : "#aaa"}
              />
            </button>

            <button
              className="cv-post-action"
              onClick={() => {
                setShowComments((p) => ({
                  ...p,
                  [post.id]: !p[post.id]
                }));

                fetchComments(post.id);
              }}
            >
              <MessageCircle size={20} />
            </button>

            <button className="cv-post-action">
              <Send size={20} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12
            }}
          >
            <Smile size={20} color="#ff9500" />
            <Bookmark size={20} />
          </div>
        </div>

        {/* COMMENTS */}
        {showComments[post.id] && (
          <div
            style={{
              marginTop: 10
            }}
          >
            {(comments[post.id] || []).map((c) => (
              <div
                key={c.id}
                style={{
                  color: "#ccc",
                  marginBottom: 6
                }}
              >
                <strong>{c.username}</strong> {c.content}
              </div>
            ))}
          </div>
        )}

        {/* COMMENT INPUT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10
          }}
        >
          <Avatar
            src={imgSrc(currentUser?.profile_picture)}
            name={currentUser?.username}
            size={28}
          />

          <input
            placeholder="Add comment..."
            className="cv-comment-input"
            value={commentText[post.id] || ""}
            onChange={(e) =>
              setCommentText((p) => ({
                ...p,
                [post.id]: e.target.value
              }))
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              handleComment(post.id)
            }
          />
        </div>
      </div>
    </article>
  );
};

export default PostCard;