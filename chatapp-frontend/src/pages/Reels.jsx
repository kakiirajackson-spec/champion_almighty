import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, Volume2, VolumeX, MoreHorizontal } from 'lucide-react';
import { API, BACKEND_URL } from '../api';

const Reels = ({ token, currentUser }) => {
  const [reels, setReels] = useState([]);
  const [muted, setMuted] = useState(true);

  useEffect(() => { fetchReels(); }, []);

  const fetchReels = async () => {
    try {
      const res = await fetch(`${API}/posts/feed`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setReels(Array.isArray(data) ? data.filter(p => p.media_type === 'video') : []);
    } catch (err) { console.error(err); }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      await fetch(`${API}/likes/${postId}`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReels();
    } catch (err) { console.error(err); }
  };

  if (reels.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-600 gap-3">
      <span className="text-6xl">🎬</span>
      <p className="text-sm font-semibold">No Reels Yet</p>
      <p className="text-xs text-center">Post a video to see it here as a reel!</p>
    </div>
  );

  return (
    <div className="h-full overflow-y-scroll snap-y snap-mandatory">
      {reels.map(reel => (
        <div key={reel.id} className="relative h-screen snap-start flex items-center bg-black">
          <video src={`${BACKEND_URL}${reel.media_url}`}
            className="w-full h-full object-cover" loop autoPlay muted={muted} playsInline />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* User info bottom left */}
          <div className="absolute bottom-24 left-4 right-16 pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-sm border-2 border-white">
                {reel.username?.[0]?.toUpperCase()}
              </div>
              <span className="font-semibold text-sm">{reel.username}</span>
            </div>
            {reel.caption && <p className="text-sm text-zinc-200">{reel.caption}</p>}
          </div>

          {/* Right actions */}
          <div className="absolute right-3 bottom-28 flex flex-col items-center gap-6">
            <button onClick={() => handleLike(reel.id, reel.is_liked)} className="flex flex-col items-center gap-1">
              <Heart size={28} fill={reel.is_liked ? 'rgb(239,68,68)' : 'none'} className={reel.is_liked ? 'text-red-500' : 'text-white'} />
              <span className="text-xs">{reel.likes_count}</span>
            </button>
            <button className="flex flex-col items-center gap-1">
              <MessageCircle size={28} className="text-white" />
              <span className="text-xs">{reel.comments_count}</span>
            </button>
            <button><Send size={26} className="text-white" /></button>
            <button onClick={() => setMuted(!muted)}>
              {muted ? <VolumeX size={26} className="text-white" /> : <Volume2 size={26} className="text-white" />}
            </button>
            <MoreHorizontal size={26} className="text-white" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reels;