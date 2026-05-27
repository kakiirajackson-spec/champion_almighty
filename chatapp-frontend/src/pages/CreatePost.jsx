import React, { useState } from 'react';
import {
  ArrowLeft,
  Image,
  Video,
  Music2,
  MapPin,
  Sparkles,
  Smile,
  Send
} from 'lucide-react';
import { API } from '../api';

const moods = [
  'Night Drive',
  'Unstoppable',
  'Soft Life',
  'Chaos',
  'Late Night',
  'Dreaming',
  'Focus',
];

const CreatePost = ({ token, currentUser, onDone }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState('Night Drive');

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handlePost = async () => {
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', caption);
    formData.append('mood', mood);

    try {
      await fetch(`${API}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      onDone();
    } catch (err) {
      console.error(err);
      alert('Failed to post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        padding: 20,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;700&display=swap');

        .cv-card{
          background:#111;
          border:1px solid #1e1e1e;
          border-radius:24px;
        }

        .cv-btn{
          border:none;
          cursor:pointer;
          transition:0.2s;
        }

        .cv-btn:hover{
          transform:scale(1.03);
        }

        .cv-input{
          width:100%;
          background:transparent;
          border:none;
          outline:none;
          color:#fff;
          font-size:15px;
          resize:none;
        }

        .cv-input::placeholder{
          color:#666;
        }

        .mood-pill{
          padding:10px 16px;
          border-radius:999px;
          border:1px solid #2a2a2a;
          background:#151515;
          color:#aaa;
          cursor:pointer;
          font-size:13px;
          font-weight:700;
          transition:0.2s;
          white-space:nowrap;
        }

        .mood-pill.active{
          background:linear-gradient(135deg,#ff4d00,#c800ff);
          color:#fff;
          border:none;
          box-shadow:0 0 20px rgba(255,77,0,0.3);
        }
      `}</style>

      {/* HEADER */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onDone}
          className="cv-btn"
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: '#111',
            border: '1px solid #1e1e1e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <ArrowLeft size={22} />
        </button>

        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 28,
            fontWeight: 900,
            background: 'linear-gradient(135deg,#ff4d00,#c800ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          CREATE VIBE
        </div>

        <button
          onClick={handlePost}
          disabled={loading || !file}
          className="cv-btn"
          style={{
            height: 48,
            padding: '0 22px',
            borderRadius: 16,
            background: 'linear-gradient(135deg,#ff4d00,#c800ff)',
            color: '#fff',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            opacity: !file ? 0.5 : 1,
          }}
        >
          <Send size={18} />
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>

      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 20,
        }}
      >
        {/* LEFT */}
        <div className="cv-card" style={{ padding: 18 }}>
          {!preview ? (
            <label
              style={{
                height: 600,
                borderRadius: 24,
                border: '2px dashed #2a2a2a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
                cursor: 'pointer',
                background:
                  'radial-gradient(circle at top,#1a1a1a,#0d0d0d)',
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 30,
                  background:
                    'linear-gradient(135deg,#ff4d00,#c800ff)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 40px rgba(255,77,0,0.35)',
                }}
              >
                <Image size={40} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 28,
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  Drop your vibe
                </h2>

                <p style={{ color: '#666', marginTop: 10 }}>
                  photos • videos • moments • energy
                </p>
              </div>

              <div
                style={{
                  background:
                    'linear-gradient(135deg,#ff4d00,#c800ff)',
                  padding: '14px 22px',
                  borderRadius: 16,
                  fontWeight: 800,
                }}
              >
                Select media
              </div>

              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={handleFile}
              />
            </label>
          ) : (
            <div
              style={{
                borderRadius: 24,
                overflow: 'hidden',
                background: '#000',
                position: 'relative',
              }}
            >
              {file?.type.startsWith('video') ? (
                <video
                  src={preview}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: 700,
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <img
                  src={preview}
                  alt=""
                  style={{
                    width: '100%',
                    maxHeight: 700,
                    objectFit: 'cover',
                  }}
                />
              )}

              <div
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(10px)',
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {mood}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div
          className="cv-card"
          style={{
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 22,
          }}
        >
          {/* USER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg,#ff4d00,#c800ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 22,
              }}
            >
              {currentUser?.username?.[0]?.toUpperCase()}
            </div>

            <div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                {currentUser?.username}
              </div>

              <div style={{ color: '#777', fontSize: 13 }}>
                Kigali • Rwanda
              </div>
            </div>
          </div>

          {/* CAPTION */}
          <div>
            <div
              style={{
                marginBottom: 10,
                color: '#888',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              CAPTION
            </div>

            <textarea
              rows={8}
              placeholder="Tell the world your energy tonight..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="cv-input"
            />
          </div>

          {/* MOODS */}
          <div>
            <div
              style={{
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Sparkles size={16} color="#ff4d00" />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                }}
              >
                CHOOSE VIBE
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`mood-pill ${
                    mood === m ? 'active' : ''
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* EXTRA ACTIONS */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {[
              { icon: Music2, label: 'Add Music' },
              { icon: MapPin, label: 'Add Location' },
              { icon: Smile, label: 'Feeling' },
              { icon: Video, label: 'Cinematic' },
            ].map((item, i) => (
              <button
                key={i}
                className="cv-btn"
                style={{
                  height: 58,
                  borderRadius: 18,
                  background: '#151515',
                  border: '1px solid #1f1f1f',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '0 18px',
                  color: '#ddd',
                  fontWeight: 700,
                }}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>

          {/* FOOTER */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: 18,
              borderTop: '1px solid #1e1e1e',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    color: '#fff',
                    fontWeight: 800,
                    marginBottom: 4,
                  }}
                >
                  Your vibe score
                </div>

                <div style={{ color: '#666', fontSize: 13 }}>
                  Posts with moods get more engagement
                </div>
              </div>

              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background:
                    'conic-gradient(#ff4d00,#c800ff,#ff4d00)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '50%',
                    background: '#0a0a0a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                  }}
                >
                  94%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;