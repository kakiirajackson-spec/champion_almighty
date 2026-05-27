import React, { useState } from 'react';
import { Search, Bell, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Image, Video, Mic, Smile, Flame, Radio } from 'lucide-react';

const HomeFeed = ({ token, currentUser, onViewProfile, onGoToDMs }) => {
  const [postText, setPostText] = useState('');
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});

  const stories = [
    { id: 'me', name: 'Your story', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', isMe: true },
    { id: 'joshua', name: 'joshua', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    { id: 'visionn', name: 'visionn', img: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', live: true },
    { id: 'daniella', name: 'daniella', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', live: true },
    { id: 'urban', name: 'urban.vibez', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    { id: 'soulcri', name: 'soulcri', img: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=150' },
    { id: 'king', name: 'king.artz', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
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
    { name: 'Photography', posts: '64K posts', color: '#f59e0b' },
    { name: 'Art', posts: '52K posts', color: '#10b981' },
  ];

  const liveRooms = [
    { id: 1, title: 'Kigali Chill Zone', listeners: 231, imgs: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50'] },
    { id: 2, title: 'Late Night Vibe', listeners: 187, imgs: ['https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=50', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50'] },
  ];

  const toggleLike = (id) => setLikedPosts(p => ({ ...p, [id]: !p[id] }));
  const toggleSave = (id) => setSavedPosts(p => ({ ...p, [id]: !p[id] }));

  const s = {
    wrap: { display:'flex', gap:'28px', width:'100%', background:'#0b0d14', minHeight:'100%' },
    feed: { flex:'1', minWidth:'0', display:'flex', flexDirection:'column', gap:'18px' },

    // Header
    header: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'12px', flexWrap:'wrap' },
    titleWrap: {},
    titleLine: { display:'flex', alignItems:'center', gap:'8px', flexWrap:'nowrap' },
    titleText: { fontFamily:"'Syne',sans-serif", fontSize:'26px', fontWeight:'800', margin:'0', color:'#fff', whiteSpace:'nowrap' },
    titleName: { fontFamily:"'Syne',sans-serif", fontSize:'26px', fontWeight:'800', background:'linear-gradient(90deg,#ff4d00,#c800ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', whiteSpace:'nowrap' },
    subtitle: { color:'#52526a', fontSize:'13px', margin:'4px 0 0', fontFamily:"'DM Sans',sans-serif" },
    headerRight: { display:'flex', alignItems:'center', gap:'10px', flexShrink:'0' },
    searchBox: { position:'relative', display:'flex', alignItems:'center' },
    searchIcon: { position:'absolute', left:'12px', pointerEvents:'none' },
    searchInput: { width:'200px', height:'38px', background:'#111118', border:'1px solid #1e1e2e', borderRadius:'100px', padding:'0 16px 0 38px', color:'#fff', fontSize:'13px', fontFamily:"'DM Sans',sans-serif", outline:'none' },
    bell: { position:'relative', background:'#111118', border:'1px solid #1e1e2e', borderRadius:'50%', width:'38px', height:'38px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:'0' },
    bellDot: { position:'absolute', top:'8px', right:'8px', width:'7px', height:'7px', background:'#ff4d00', borderRadius:'50%', border:'2px solid #111118' },

    // Stories
    storiesRow: { display:'flex', gap:'14px', overflowX:'auto', padding:'2px 0 6px', scrollbarWidth:'none' },
    storyCol: { display:'flex', flexDirection:'column', alignItems:'center', gap:'7px', flexShrink:'0', cursor:'pointer' },
    storyRingGrad: { padding:'2.5px', borderRadius:'50%', background:'linear-gradient(135deg,#ff4d00,#c800ff)', position:'relative', display:'inline-block' },
    storyRingLive: { padding:'2.5px', borderRadius:'50%', background:'linear-gradient(135deg,#00f2fe,#4facfe)', position:'relative', display:'inline-block' },
    storyRingMe: { padding:'2.5px', borderRadius:'50%', background:'transparent', border:'2px dashed #333350', position:'relative', display:'inline-block' },
    storyImg: { width:'64px', height:'64px', borderRadius:'50%', objectFit:'cover', border:'2.5px solid #0b0d14', display:'block' },
    storyAdd: { position:'absolute', bottom:'1px', right:'1px', width:'20px', height:'20px', background:'linear-gradient(135deg,#ff4d00,#c800ff)', borderRadius:'50%', border:'2px solid #0b0d14', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'800', color:'#fff', lineHeight:'1' },
    storyLiveTag: { position:'absolute', bottom:'-5px', left:'50%', transform:'translateX(-50%)', background:'linear-gradient(90deg,#00f2fe,#4facfe)', color:'#000', fontSize:'8px', fontWeight:'800', padding:'1px 5px', borderRadius:'6px', whiteSpace:'nowrap', letterSpacing:'0.5px' },
    storyName: { fontSize:'11px', color:'#6b6b80', maxWidth:'70px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'center', fontFamily:"'DM Sans',sans-serif" },

    // Composer
    composer: { background:'#0e0e16', border:'1px solid #1e1e2e', borderRadius:'18px', padding:'16px 18px' },
    composerTop: { display:'flex', gap:'12px', alignItems:'center' },
    composerAva: { width:'40px', height:'40px', borderRadius:'50%', overflow:'hidden', flexShrink:'0' },
    composerInput: { flex:'1', background:'transparent', border:'none', color:'#fff', fontSize:'14px', fontFamily:"'DM Sans',sans-serif", outline:'none' },
    wave: { display:'flex', gap:'2px', alignItems:'center', height:'18px' },
    composerDivider: { height:'1px', background:'#1e1e2e', margin:'12px 0' },
    composerBottom: { display:'flex', alignItems:'center', justifyContent:'space-between' },
    composerBtns: { display:'flex', gap:'2px' },
    composerBtn: { display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', color:'#52526a', fontSize:'12px', fontFamily:"'DM Sans',sans-serif", cursor:'pointer', padding:'6px 8px', borderRadius:'10px' },
    postBtn: { background:'linear-gradient(135deg,#ff4d00,#c800ff)', border:'none', borderRadius:'100px', padding:'7px 20px', color:'#fff', fontSize:'13px', fontWeight:'600', fontFamily:"'DM Sans',sans-serif", cursor:'pointer' },

    // Pulse
    pulse: { background:'linear-gradient(135deg,#0e0e16,#0a0a12)', border:'1px solid #1e1e2e', borderRadius:'18px', padding:'18px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', overflow:'hidden', position:'relative' },
    pulseLabel: { textTransform:'uppercase', fontSize:'10px', fontWeight:'700', color:'ff4d00', letterSpacing:'1.5px', display:'flex', alignItems:'center', gap:'6px', color:'#ff4d00' },
    pulseDot: { width:'6px', height:'6px', background:'#ff4d00', borderRadius:'50%' },
    pulseLoc: { color:'#52526a', fontSize:'12px', margin:'3px 0 0', fontFamily:"'DM Sans',sans-serif" },
    pulseNum: { fontFamily:"'Syne',sans-serif", fontSize:'44px', fontWeight:'800', margin:'8px 0 0', lineHeight:'1', color:'#fff' },
    pulseBadge: { display:'inline-flex', alignItems:'center', background:'rgba(0,242,254,0.1)', color:'#00f2fe', fontSize:'11px', fontWeight:'700', padding:'2px 8px', borderRadius:'10px', marginLeft:'10px' },
    pulseSub: { color:'#3a3a52', fontSize:'12px', margin:'5px 0 0', fontFamily:"'DM Sans',sans-serif" },
    pulseRight: { display:'flex', alignItems:'center', gap:'16px' },
    radar: { position:'relative', width:'78px', height:'78px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:'0' },
    radarOuter: { position:'absolute', width:'78px', height:'78px', borderRadius:'50%', border:'1px dashed #1e1e2e' },
    radarMid: { position:'absolute', width:'50px', height:'50px', borderRadius:'50%', border:'1px dashed #2a2a3e' },
    radarInner: { position:'absolute', width:'24px', height:'24px', borderRadius:'50%', border:'1px dashed #3a3a52', background:'#141420' },
    radarDot1: { position:'absolute', top:'12px', right:'8px', width:'7px', height:'7px', background:'#c800ff', borderRadius:'50%', boxShadow:'0 0 10px #c800ff' },
    radarDot2: { position:'absolute', bottom:'16px', left:'10px', width:'5px', height:'5px', background:'#ff4d00', borderRadius:'50%', boxShadow:'0 0 8px #ff4d00' },
    vibeWrap: { textAlign:'right' },
    vibeTitle: { fontSize:'14px', fontWeight:'700', color:'#fff', margin:'0', fontFamily:"'DM Sans',sans-serif" },
    vibeBadge: { display:'inline-block', background:'rgba(0,242,254,0.1)', color:'#00f2fe', fontSize:'10px', fontWeight:'700', padding:'2px 7px', borderRadius:'6px', marginTop:'4px' },
    vibeSub: { color:'#52526a', fontSize:'11px', margin:'5px 0 0', maxWidth:'130px', lineHeight:'1.4', fontFamily:"'DM Sans',sans-serif" },

    // Post
    post: { background:'#0e0e16', border:'1px solid #1e1e2e', borderRadius:'18px', overflow:'hidden' },
    postHead: { padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' },
    postUser: { display:'flex', alignItems:'center', gap:'11px', cursor:'pointer' },
    postAva: { width:'42px', height:'42px', borderRadius:'50%', overflow:'hidden', background:'#1e1e2e', flexShrink:'0', border:'2px solid #1e1e2e' },
    postUname: { fontSize:'14px', fontWeight:'700', color:'#fff', display:'flex', alignItems:'center', gap:'5px', fontFamily:"'DM Sans',sans-serif" },
    verified: { width:'15px', height:'15px', background:'linear-gradient(135deg,#4facfe,#00f2fe)', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'8px', color:'#fff' },
    postMeta: { fontSize:'12px', color:'#52526a', marginTop:'2px', fontFamily:"'DM Sans',sans-serif" },
    postMore: { background:'none', border:'none', color:'#52526a', cursor:'pointer', padding:'4px' },
    postImgWrap: { width:'100%', aspectRatio:'4/3', overflow:'hidden', background:'#060608', position:'relative' },
    postImg: { width:'100%', height:'100%', objectFit:'cover', display:'block' },
    postCounter: { position:'absolute', top:'12px', right:'12px', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(8px)', padding:'3px 9px', borderRadius:'10px', fontSize:'11px', fontWeight:'600', color:'#fff' },
    postBody: { padding:'14px 18px 16px' },
    postActions: { display:'flex', justifyContent:'space-between', alignItems:'center' },
    postLeft: { display:'flex', gap:'4px' },
    actionBtn: { display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', fontSize:'13px', fontWeight:'600', fontFamily:"'DM Sans',sans-serif", cursor:'pointer', padding:'6px 8px', borderRadius:'10px', color:'#ccc' },
    likeBtn: { display:'flex', alignItems:'center', gap:'5px', background:'none', border:'none', fontSize:'13px', fontWeight:'600', fontFamily:"'DM Sans',sans-serif", cursor:'pointer', padding:'6px 8px', borderRadius:'10px', color:'#ff4d00' },
    caption: { margin:'10px 0 0', fontSize:'14px', lineHeight:'1.55', color:'#c8c8d8', fontFamily:"'DM Sans',sans-serif" },
    captionName: { fontWeight:'700', color:'#fff', marginRight:'6px' },
    viewComments: { background:'none', border:'none', color:'#3a3a52', fontSize:'12px', fontFamily:"'DM Sans',sans-serif", padding:'0', marginTop:'6px', cursor:'pointer' },

    // Sidebar
    sidebar: { width:'290px', flexShrink:'0', display:'flex', flexDirection:'column', gap:'16px' },
    sideCard: { background:'#0e0e16', border:'1px solid #1e1e2e', borderRadius:'18px', padding:'18px' },
    sideHead: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' },
    sideTitle: { fontSize:'14px', fontWeight:'700', color:'#fff', display:'flex', alignItems:'center', gap:'7px', margin:'0', fontFamily:"'DM Sans',sans-serif" },
    seeAll: { background:'none', border:'none', color:'#ff4d00', fontSize:'12px', fontWeight:'600', fontFamily:"'DM Sans',sans-serif", cursor:'pointer' },
    suggestList: { display:'flex', flexDirection:'column', gap:'13px' },
    suggestRow: { display:'flex', alignItems:'center', justifyContent:'space-between' },
    suggestInfo: { display:'flex', alignItems:'center', gap:'10px' },
    suggestAva: { width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover', flexShrink:'0' },
    suggestName: { fontSize:'13px', fontWeight:'600', color:'#fff', fontFamily:"'DM Sans',sans-serif" },
    suggestSub: { fontSize:'11px', color:'#3a3a52', marginTop:'1px', fontFamily:"'DM Sans',sans-serif" },
    followBtn: { background:'transparent', border:'1px solid #2a2a3e', color:'#fff', borderRadius:'100px', padding:'5px 13px', fontSize:'12px', fontWeight:'600', fontFamily:"'DM Sans',sans-serif", cursor:'pointer' },
    trendList: { display:'flex', flexDirection:'column', gap:'10px' },
    trendRow: { display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', padding:'5px 6px', borderRadius:'12px' },
    trendIcon: { width:'34px', height:'34px', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'800', fontSize:'15px', flexShrink:'0' },
    trendName: { fontSize:'13px', fontWeight:'600', color:'#fff', fontFamily:"'DM Sans',sans-serif" },
    trendCount: { fontSize:'11px', color:'#3a3a52', marginTop:'1px', fontFamily:"'DM Sans',sans-serif" },
    liveList: { display:'flex', flexDirection:'column', gap:'10px' },
    liveRow: { background:'#0a0a12', border:'1px solid #1a1a28', borderRadius:'14px', padding:'11px 13px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer' },
    liveAvas: { display:'flex' },
    liveAva: { width:'22px', height:'22px', borderRadius:'50%', objectFit:'cover', border:'2px solid #0a0a12', marginLeft:'-8px', flexShrink:'0' },
    liveTitle: { fontSize:'13px', fontWeight:'600', color:'#fff', fontFamily:"'DM Sans',sans-serif" },
    liveBadge: { display:'flex', alignItems:'center', gap:'5px', marginTop:'2px' },
    liveDot: { width:'5px', height:'5px', background:'#00f2fe', borderRadius:'50%' },
    liveTag: { color:'#00f2fe', fontWeight:'700', fontSize:'10px', letterSpacing:'0.5px' },
    liveCount: { color:'#52526a', fontSize:'11px', fontFamily:"'DM Sans',sans-serif" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        .hf-stories::-webkit-scrollbar{display:none}
        .hf-search-input:focus{border-color:#ff4d00!important}
        .hf-follow-btn:hover{background:linear-gradient(135deg,#ff4d00,#c800ff)!important;border-color:transparent!important}
        .hf-trend-row:hover{background:#141420!important}
        .hf-live-row:hover{border-color:rgba(0,242,254,0.3)!important}
        .hf-post:hover{border-color:#2a2a3e!important}
        .hf-action-btn:hover{background:#1e1e2e!important}
        .hf-composer-btn:hover{background:#1a1a26!important;color:#fff!important}
        @media(max-width:1100px){.hf-sidebar-hide{display:none!important}}
        @media(max-width:640px){
          .hf-header-wrap{flex-direction:column!important;gap:10px!important}
          .hf-search-input{width:100%!important}
          .hf-header-right{width:100%!important}
        }
      `}</style>

      <div style={s.wrap}>
        {/* FEED */}
        <div style={s.feed}>

          {/* Header */}
          <div style={s.header} className="hf-header-wrap">
            <div style={s.titleWrap}>
              <div style={s.titleLine}>
                <span style={s.titleText}>Welcome back,&nbsp;</span>
                <span style={s.titleName}>{currentUser?.username || 'joshua'}</span>
                <span style={{fontSize:'24px'}}>👋</span>
              </div>
              <p style={s.subtitle}>Discover creative people around the world.</p>
            </div>
            <div style={s.headerRight} className="hf-header-right">
              <div style={s.searchBox}>
                <span style={s.searchIcon}><Search size={14} color="#3a3a52" /></span>
                <input className="hf-search-input" type="text" placeholder="Search ChatVitte" style={s.searchInput} />
              </div>
              <button style={s.bell}>
                <Bell size={16} color="#8888a0" />
                <div style={s.bellDot}></div>
              </button>
            </div>
          </div>

          {/* Stories */}
          <div style={s.storiesRow} className="hf-stories">
            {stories.map((story) => (
              <div key={story.id} style={s.storyCol}>
                <div style={story.isMe ? s.storyRingMe : story.live ? s.storyRingLive : s.storyRingGrad}>
                  <img src={story.img} alt={story.name} style={s.storyImg} />
                  {story.isMe && <div style={s.storyAdd}>+</div>}
                  {story.live && <div style={s.storyLiveTag}>LIVE</div>}
                </div>
                <span style={s.storyName}>{story.name}</span>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div style={s.composer}>
            <div style={s.composerTop}>
              <div style={s.composerAva}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="me" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              </div>
              <input style={s.composerInput} type="text" placeholder="Share your vibe today..." value={postText} onChange={e=>setPostText(e.target.value)} />
              <div style={s.wave}>
                {[8,14,10,18,7,12,16].map((h,i)=>(
                  <span key={i} style={{width:'2.5px',height:h+'px',background:'#ff4d00',borderRadius:'2px',opacity:'0.7',display:'block'}}></span>
                ))}
              </div>
            </div>
            <div style={s.composerDivider}></div>
            <div style={s.composerBottom}>
              <div style={s.composerBtns}>
                <button style={s.composerBtn} className="hf-composer-btn"><Image size={15} color="#00f2fe" />&nbsp;Photo</button>
                <button style={s.composerBtn} className="hf-composer-btn"><Video size={15} color="#c800ff" />&nbsp;Video</button>
                <button style={s.composerBtn} className="hf-composer-btn"><Mic size={15} color="#ff4d00" />&nbsp;Voice</button>
                <button style={s.composerBtn} className="hf-composer-btn"><Smile size={15} color="#ffb703" />&nbsp;Vibe</button>
              </div>
              <button style={s.postBtn}>Post</button>
            </div>
          </div>

          {/* Pulse */}
          <div style={s.pulse}>
            <div>
              <div style={s.pulseLabel}><span style={s.pulseDot}></span> Today's Pulse</div>
              <p style={s.pulseLoc}>Kigali, Rwanda</p>
              <div style={{display:'flex',alignItems:'baseline',gap:'10px',marginTop:'8px'}}>
                <span style={s.pulseNum}>127</span>
                <span style={s.pulseBadge}>↗ 23%</span>
              </div>
              <p style={s.pulseSub}>people posting right now</p>
            </div>
            <div style={s.pulseRight}>
              <div style={s.radar}>
                <div style={s.radarOuter}></div>
                <div style={s.radarMid}></div>
                <div style={s.radarInner}></div>
                <div style={s.radarDot1}></div>
                <div style={s.radarDot2}></div>
              </div>
              <div style={s.vibeWrap}>
                <p style={s.vibeTitle}>🌙 Night Vibe</p>
                <span style={s.vibeBadge}>Very Active</span>
                <p style={s.vibeSub}>People are posting more at night</p>
              </div>
            </div>
          </div>

          {/* Post */}
          <div style={s.post} className="hf-post">
            <div style={s.postHead}>
              <div style={s.postUser} onClick={()=>onViewProfile&&onViewProfile('joshua')}>
                <div style={s.postAva}><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="joshua" style={{width:'100%',height:'100%',objectFit:'cover'}} /></div>
                <div>
                  <div style={s.postUname}>joshua <span style={s.verified}>✓</span></div>
                  <div style={s.postMeta}>2h ago · Kigali, Rwanda</div>
                </div>
              </div>
              <button style={s.postMore} className="hf-action-btn"><MoreHorizontal size={18} /></button>
            </div>
            <div style={s.postImgWrap}>
              <img src="https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=800" alt="post" style={s.postImg} />
              <div style={s.postCounter}>1 / 4</div>
            </div>
            <div style={s.postBody}>
              <div style={s.postActions}>
                <div style={s.postLeft}>
                  <button style={s.likeBtn} onClick={()=>toggleLike('p1')}>
                    <Heart size={20} fill={likedPosts['p1']?'#ff4d00':'none'} /> 1.2K
                  </button>
                  <button style={s.actionBtn} className="hf-action-btn"><MessageCircle size={20} /> 86</button>
                  <button style={s.actionBtn} className="hf-action-btn"><Send size={20} /> 34</button>
                </div>
                <button style={s.actionBtn} className="hf-action-btn" onClick={()=>toggleSave('p1')}>
                  <Bookmark size={20} fill={savedPosts['p1']?'#fff':'none'} />
                </button>
              </div>
              <p style={s.caption}><span style={s.captionName}>joshua</span>Night drives. Clear mind. 🌙</p>
              <button style={s.viewComments}>View all 86 comments</button>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div style={s.sidebar} className="hf-sidebar-hide">

          {/* Suggested */}
          <div style={s.sideCard}>
            <div style={s.sideHead}>
              <h3 style={s.sideTitle}>Suggested for you</h3>
              <button style={s.seeAll}>See all</button>
            </div>
            <div style={s.suggestList}>
              {suggestedUsers.map(u=>(
                <div key={u.id} style={s.suggestRow}>
                  <div style={s.suggestInfo}>
                    <img src={u.img} alt={u.username} style={s.suggestAva} />
                    <div>
                      <div style={s.suggestName}>{u.username}</div>
                      <div style={s.suggestSub}>{u.subtitle}</div>
                    </div>
                  </div>
                  <button style={s.followBtn} className="hf-follow-btn">Follow</button>
                </div>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div style={s.sideCard}>
            <div style={s.sideHead}>
              <h3 style={s.sideTitle}><Flame size={15} color="#ff4d00" fill="#ff4d00" /> Trending Spaces</h3>
              <button style={s.seeAll}>View all</button>
            </div>
            <div style={s.trendList}>
              {trendingSpaces.map((sp,i)=>(
                <div key={i} style={s.trendRow} className="hf-trend-row">
                  <div style={{...s.trendIcon, background:`${sp.color}18`, color:sp.color}}>#</div>
                  <div>
                    <div style={s.trendName}>{sp.name}</div>
                    <div style={s.trendCount}>{sp.posts}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Rooms */}
          <div style={s.sideCard}>
            <div style={s.sideHead}>
              <h3 style={s.sideTitle}><Radio size={14} color="#00f2fe" /> Live Rooms</h3>
              <button style={s.seeAll}>See all</button>
            </div>
            <div style={s.liveList}>
              {liveRooms.map(room=>(
                <div key={room.id} style={s.liveRow} className="hf-live-row">
                  <div style={s.liveAvas}>
                    {room.imgs.map((img,i)=>(
                      <img key={i} src={img} alt="l" style={{...s.liveAva, marginLeft:i===0?'0':'-8px'}} />
                    ))}
                  </div>
                  <div>
                    <div style={s.liveTitle}>{room.title}</div>
                    <div style={s.liveBadge}>
                      <span style={s.liveDot}></span>
                      <span style={s.liveTag}>LIVE</span>
                      <span style={s.liveCount}>{room.listeners} listening</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default HomeFeed;