import React, { useState } from 'react';
import { Search, Bell, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Image, Video, Mic, Smile, Flame, Radio } from 'lucide-react';

const HomeFeed = ({ token, currentUser, onViewProfile, onGoToDMs }) => {
  const [postText, setPostText] = useState('');

  // Mock Data mimicking the exact text and layout from your images
  const stories = [
    { id: 'me', name: 'Your story', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', isMe: true },
    { id: 'joshua', name: 'joshua', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', live: false },
    { id: 'visionn', name: 'visionn', img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', live: true },
    { id: 'daniella', name: 'daniella', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', live: true },
    { id: 'urban', name: 'urban.vibez', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', live: false },
    { id: 'soulcri', name: 'soulcri', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150', live: false },
    { id: 'king', name: 'king.artz', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', live: false },
  ];

  const suggestedUsers = [
    { id: 'champ', username: 'Champion', subtitle: 'Suggested for you', img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150' },
    { id: 'kennys', username: 'Kennys', subtitle: 'Suggested for you', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { id: 'mari', username: 'mari.visuals', subtitle: 'Suggested for you', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { id: 'not', username: 'not.akira', subtitle: 'Suggested for you', img: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150' },
  ];

  const trendingSpaces = [
    { name: 'Design', posts: '125K posts', color: '#6366f1' },
    { name: 'Music', posts: '98K posts', color: '#a855f7' },
    { name: 'Streetwear', posts: '76K posts', color: '#ec4899' },
  ];

  const liveRooms = [
    { id: 1, title: 'Kigali Chill Zone', listeners: 231, imgs: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50'] },
    { id: 2, title: 'Late Night Vibe', listeners: 187, imgs: ['https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=50', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50'] },
  ];

  return (
    <div style={{ display: 'flex', gap: '32px', width: '100%', maxWidth: '1140px', margin: '0 auto', background: '#000000' }}>
      
      {/* ── CENTRAL FEED SECTION ── */}
      <div style={{ flex: '1', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top bar with input search block matching mockup */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Welcome back, <span style={{ background: 'linear-gradient(to right, #ff4d00, #c800ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{currentUser?.username || 'joshua'}</span> 👋
            </h1>
            <p style={{ color: '#66666e', fontSize: '14px', margin: '4px 0 0 0' }}>Discover creative people around the world.</p>
          </div>

          {/* Clean Rounded Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} color="#4e4e52" style={{ position: 'absolute', left: '14px' }} />
              <input 
                type="text" 
                placeholder="Search ChatVitte" 
                style={{ width: '240px', height: '40px', background: '#0c0c0e', border: '1px solid #1c1c1e', borderRadius: '20px', padding: '0 16px 0 42px', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', position: 'relative' }}>
              <Bell size={22} />
              <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ff4d00', borderRadius: '50%' }}></div>
            </button>
          </div>
        </div>

        {/* Stories Horizontal Tray Container */}
        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', padding: '4px 0', width: '100%' }}>
          {stories.map((story) => (
            <div key={story.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0, cursor: 'pointer' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', padding: '3px',
                background: story.isMe ? 'transparent' : story.live ? 'linear-gradient(135deg, #00f2fe, #4facfe)' : 'linear-gradient(135deg, #ff4d00, #c800ff)',
                position: 'relative'
              }}>
                <img src={story.img} alt={story.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #000' }} />
                {story.isMe && (
                  <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '22px', height: '22px', background: '#ff4d00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #000', fontSize: '14px', fontWeight: 'bold' }}>+</div>
                )}
                {story.live && (
                  <div style={{ position: 'absolute', bottom: '-2px', left: '50%', transform: 'translateX(-50%)', background: '#00f2fe', color: '#000', fontSize: '9px', fontWeight: '800', padding: '1px 5px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live</div>
                )}
              </div>
              <span style={{ fontSize: '12px', color: '#8e8e93', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{story.name}</span>
            </div>
          ))}
        </div>

        {/* Status Composer Post Form Box */}
        <div style={{ background: '#09090b', border: '1px solid #141416', borderRadius: '18px', padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ff4d00', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <input 
              type="text" 
              placeholder={`Share your vibe today...`} 
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              style={{ flex: '1', background: 'transparent', border: 'none', color: '#fff', fontSize: '15px', outline: 'none', fontFamily: 'inherit' }}
            />
            {/* Audio wave dynamic simulation node */}
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '18px' }}>
              <span style={{ width: '3px', height: '10px', background: '#ff4d00', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '16px', background: '#ff4d00', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '12px', background: '#ff4d00', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '18px', background: '#ff4d00', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: '8px', background: '#ff4d00', borderRadius: '2px' }}></span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #141416' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#8e8e93', fontSize: '13px', cursor: 'pointer' }}><Image size={18} color="#00f2fe" /> Photo</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#8e8e93', fontSize: '13px', cursor: 'pointer' }}><Video size={18} color="#c800ff" /> Video</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#8e8e93', fontSize: '13px', cursor: 'pointer' }}><Mic size={18} color="#ff4d00" /> Voice</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#8e8e93', fontSize: '13px', cursor: 'pointer' }}><Smile size={18} color="#ffb703" /> Vibe</button>
            </div>
            <button style={{ background: 'linear-gradient(135deg, #ff4d00, #c800ff)', border: 'none', borderRadius: '20px', padding: '6px 18px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Post</button>
          </div>
        </div>

        {/* Kigali Radar Pulse Tracker Panel Block */}
        <div style={{ background: 'linear-gradient(135deg, #09090b, #040405)', border: '1px solid #141416', borderRadius: '18px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div>
            <span style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '800', color: '#ff4d00', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', background: '#ff4d00', borderRadius: '50%' }}></span> Today's Pulse
            </span>
            <p style={{ color: '#8e8e93', fontSize: '13px', margin: '4px 0 0 0' }}>Kigali, Rwanda</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '12px' }}>
              <h2 style={{ fontSize: '42px', fontWeight: '900', margin: 0, fontFamily: "'Syne', sans-serif" }}>127</h2>
              <span style={{ color: '#00f2fe', fontSize: '13px', fontWeight: '700', padding: '2px 8px', background: 'rgba(0,242,254,0.1)', borderRadius: '12px' }}>↗ 23%</span>
            </div>
            <p style={{ color: '#4e4e52', fontSize: '12px', margin: '6px 0 0 0' }}>people posting right now</p>
          </div>
          
          {/* Right section graphic representation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '50%', border: '1px dashed #2c2c30', display: 'flex', alignItems: 'center', justifyCentent: 'center' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '50%', border: '1px dashed #3a3a40' }}></div>
              <div style={{ position: 'absolute', top: '15px', right: '10px', width: '8px', height: '8px', background: '#c800ff', borderRadius: '50%', boxShadow: '0 0 10px #c800ff' }}></div>
              <div style={{ position: 'absolute', bottom: '20px', left: '15px', width: '6px', height: '6px', background: '#ff4d00', borderRadius: '50%', boxShadow: '0 0 10px #ff4d00' }}></div>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>🌙 Night Vibe</h4>
              <span style={{ fontSize: '11px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px', fontWeight: '600' }}>Very Active</span>
              <p style={{ margin: '6px 0 0 0', color: '#66666e', fontSize: '12px' }}>People are posting more at night</p>
            </div>
          </div>
        </div>

        {/* Target Post Layout Card Block */}
        <div style={{ background: '#09090b', border: '1px solid #141416', borderRadius: '18px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onViewProfile('joshua')}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="joshua" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  joshua 
                  <span style={{ width: '14px', height: '14px', background: '#4facfe', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff' }}>✓</span>
                </span>
                <span style={{ fontSize: '12px', color: '#66666e' }}>2h ago • Kigali, Rwanda</span>
              </div>
            </div>
            <button style={{ background: 'none', border: 'none', color: '#66666e', cursor: 'pointer' }}><MoreHorizontal size={20} /></button>
          </div>
          
          {/* Main Visual Image Frame */}
          <div style={{ width: '100%', maxHeight: '480px', overflow: 'hidden', background: '#020202', position: 'relative' }}>
            <img src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800" alt="post content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>1/4</div>
          </div>

          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '18px' }}>
                <button style={{ background: 'none', border: 'none', color: '#ff4d00', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}><Heart size={22} fill="#ff4d00" /> 1.2K</button>
                <button style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}><MessageCircle size={22} /> 86</button>
                <button style={{ background: 'none', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}><Send size={22} /> 34</button>
              </div>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><Bookmark size={22} /></button>
            </div>
            <p style={{ margin: '14px 0 0 0', fontSize: '14px', lineHeight: '1.5', color: '#e4e4e7' }}>
              <span style={{ fontWeight: '700', marginRight: '8px', color: '#fff' }}>joshua</span> Night drives. Clear mind. 🌙
            </p>
            <button style={{ background: 'none', border: 'none', color: '#4e4e52', fontSize: '13px', padding: 0, marginTop: '10px', cursor: 'pointer' }}>View all 86 comments</button>
          </div>
        </div>

      </div>

      {/* ── FIXED RIGHT SIDEBAR PANEL ── */}
      <div style={{ width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Suggested For You Card */}
        <div style={{ background: '#09090b', border: '1px solid #141416', borderRadius: '18px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#fff' }}>Suggested for you</h3>
            <button style={{ background: 'none', border: 'none', color: '#ff4d00', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>See all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {suggestedUsers.map((sUser) => (
              <div key={sUser.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={sUser.img} alt={sUser.username} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{sUser.username}</span>
                    <span style={{ fontSize: '11px', color: '#4e4e52' }}>{sUser.subtitle}</span>
                  </div>
                </div>
                <button style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '14px', padding: '6px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Follow</button>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Spaces Topic Tags Panel */}
        <div style={{ background: '#09090b', border: '1px solid #141416', borderRadius: '18px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#ff4d00" fill="#ff4d00" /> Trending Spaces
            </h3>
            <button style={{ background: 'none', border: 'none', color: '#ff4d00', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>View all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {trendingSpaces.map((space, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${space.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: space.color, fontWeight: 'bold' }}>#</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{space.name}</span>
                  <span style={{ fontSize: '12px', color: '#4e4e52' }}>{space.posts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audio Live Rooms Widget */}
        <div style={{ background: '#09090b', border: '1px solid #141416', borderRadius: '18px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color="#00f2fe" /> Live Rooms
            </h3>
            <button style={{ background: 'none', border: 'none', color: '#ff4d00', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>See all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {liveRooms.map((room) => (
              <div key={room.id} style={{ background: '#0c0c0e', border: '1px solid #1c1c1e', borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {room.imgs.map((img, i) => (
                      <img key={i} src={img} alt="listener" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', marginLeft: i > 0 ? '-10px' : '0', border: '2px solid #0c0c0e' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{room.title}</span>
                    <span style={{ fontSize: '11px', color: '#00f2fe', fontWeight: '700', marginTop: '2px' }}>● LIVE <span style={{ color: '#66666e', fontWeight: 'normal' }}>{room.listeners} listening</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      
    </div>
  );
};

export default HomeFeed;