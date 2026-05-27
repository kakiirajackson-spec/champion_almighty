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
        background: "#121214",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        flexShrink: 0
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
      style={{
        background: "#09090b",
        border: "1px solid #141416",
        borderRadius: "18px",
        overflow: "hidden",
        marginBottom: "20px",
        width: "100%",
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}
    >
      {/* HEADER SECTION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px"
        }}
      >
        <button
          onClick={() => onViewProfile && onViewProfile(post.user_id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0
          }}
        >
          <Avatar
            src={imgSrc(post.profile_picture)}
            name={post.username}
            size={40}
          />

          <div style={{ textAlign: "left" }}>
            <p
              style={{
                margin: 0,
                color: "#fff",
                fontWeight: "700",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              {post.username}
              <span style={{ width: "14px", height: "14px", background: "#4facfe", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "#fff", fontWeight: "bold" }}>✓</span>
            </p>

            <p
              style={{
                margin: "2px 0 0 0",
                color: "#66666e",
                fontSize: "12px"
              }}
            >
              {formatTime ? formatTime(post.created_at) : "2h ago"} • Kigali, Rwanda
            </p>
          </div>
        </button>

        <button
          style={{
            background: "none",
            border: "none",
            color: "#66666e",
            cursor: "pointer"
          }}
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* CAPTION TEXT */}
      {post.caption && (
        <div
          style={{
            padding: "0 20px 14px",
            color: "#e4e4e7",
            fontSize: "14px",
            lineHeight: "1.5"
          }}
        >
          {post.caption}
        </div>
      )}

      {/* POST CONTENT IMAGE */}
      {post.media_url && (
        <div style={{ width: "100%", maxHeight: "540px", overflow: "hidden", background: "#020202", position: "relative" }}>
          <img
            src={imgSrc(post.media_url)}
            alt="post media"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
          <div style={{ position: "absolute", top: "16px", right: "16px", background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', color: '#fff' }}>1/1</div>
        </div>
      )}

      {/* INTERACTION ACTIONS FOOTER */}
      <div style={{ padding: "16px 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "18px"
            }}
          >
            {/* Like Action */}
            <button
              onClick={() => handleLike && handleLike(post.id, post.is_liked)}
              style={{ background: "none", border: "none", color: post.is_liked ? "#ff4d00" : "#fff", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer", padding: 0 }}
            >
              <Heart
                size={22}
                fill={post.is_liked ? "#ff4d00" : "none"}
                color={post.is_liked ? "#ff4d00" : "#fff"}
              />
              <span>{post.likes_count || "0"}</span>
            </button>

            {/* Comment Toggle Action */}
            <button
              onClick={() => {
                if (setShowComments && fetchComments) {
                  setShowComments((p) => ({
                    ...p,
                    [post.id]: !p[post.id]
                  }));
                  fetchComments(post.id);
                }
              }}
              style={{ background: "none", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer", padding: 0 }}
            >
              <MessageCircle size={22} color="#fff" />
              <span>{post.comments_count || "0"}</span>
            </button>

            {/* Share Action */}
            <button style={{ background: "none", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", cursor: "pointer", padding: 0 }}>
              <Send size={22} color="#fff" />
            </button>
          </div>

          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
            <Smile size={22} color="#ffb703" style={{ cursor: "pointer" }} />
            <Bookmark size={22} color="#fff" style={{ cursor: "pointer" }} />
          </div>
        </div>

        {/* TARGET COMMENTS BLOCK EXPANSION */}
        {showComments && showComments[post.id] && (
          <div
            style={{
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "1px solid #141416",
              maxHeight: "200px",
              overflowY: "auto"
            }}
          >
            {(comments[post.id] || []).map((c) => (
              <div
                key={c.id}
                style={{
                  color: "#e4e4e7",
                  marginBottom: "8px",
                  fontSize: "13px",
                  lineHeight: "1.4"
                }}
              >
                <strong style={{ color: "#fff", marginRight: "6px" }}>{c.username}</strong> {c.content}
              </div>
            ))}
          </div>
        )}

        {/* COMMENT IN-LINE INPUT FIELD COMPOSER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: "14px",
            paddingTop: "12px",
            borderTop: "1px solid #141416"
          }}
        >
          <Avatar
            src={imgSrc(currentUser?.profile_picture)}
            name={currentUser?.username}
            size={28}
          />

          <input
            placeholder="Add comment..."
            value={commentText[post.id] || ""}
            onChange={(e) =>
              setCommentText && setCommentText((p) => ({
                ...p,
                [post.id]: e.target.value
              }))
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              handleComment && handleComment(post.id)
            }
            style={{
              flex: 1,
              background: "#0c0c0e",
              border: "1px solid #1c1c1e",
              borderRadius: "12px",
              height: "36px",
              padding: "0 14px",
              color: "#fff",
              outline: "none",
              fontSize: "13px",
              fontFamily: "inherit"
            }}
          />
        </div>
      </div>
    </article>
  );
};

export default PostCard;