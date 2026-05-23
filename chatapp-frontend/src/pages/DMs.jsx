import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import {
  Edit, ChevronDown, X, Search, Send,
  Smile, Image, Heart, Check, CheckCheck,
  Phone, Video, Info, ArrowLeft, Mic, MicOff, Paperclip
} from 'lucide-react';
import { API, BACKEND_URL } from '../api';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

const imgSrc = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${Math.floor(diffDays / 7)}w`;
}

function formatMsgTime(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateHeader(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

function Avatar({ src, username, size = 10, online = false }) {
  const initials = username ? username[0].toUpperCase() : '?';
  const px = { 8: 32, 10: 40, 12: 48, 16: 64 }[size] || 40;
  const fontSize = px * 0.35;
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: px, height: px }}>
      {src ? (
        <img src={imgSrc(src)} alt={username} style={{ width: px, height: px, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: px, height: px, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize }}>
          {initials}
        </div>
      )}
      {online === true && (
        <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid #000' }} />
      )}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-zinc-800 rounded-2xl rounded-bl-sm w-fit">
      {[0, 150, 300].map(delay => (
        <span key={delay} className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
      ))}
    </div>
  );
}

// ── Emoji Picker ─────────────────────────────────────────────────
const EMOJIS = [
  '😀','😂','🥰','😍','🤣','😊','😎','🥳','😏','🤔',
  '😢','😭','😤','🤯','🥺','😴','🤗','😇','🤩','😱',
  '👍','👎','❤️','🔥','💯','🎉','✨','👏','🙌','💪',
  '😆','🤭','🫡','🥹','😅','🫠','🤪','😜','🤑','😋',
  '🐶','🐱','🐻','🦁','🐼','🦊','🐸','🐙','🦋','🌸',
  '🍕','🍔','🎂','🍦','🍿','☕','🍵','🥤','🍜','🍣',
  '⚽','🏀','🎮','🎵','🎶','🎸','🎹','🎤','📱','💻',
  '🌍','🌈','⭐','🌙','☀️','❄️','🌊','🏔️','🌺','🍀',
];

function EmojiPicker({ onSelect, onClose }) {
  return (
    <div style={{
      position: 'absolute', bottom: 70, left: 0,
      background: '#18181b', border: '1px solid #27272a',
      borderRadius: 16, padding: 12, zIndex: 100,
      width: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Emojis</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a' }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
        {EMOJIS.map(emoji => (
          <button key={emoji} onClick={() => onSelect(emoji)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 4, borderRadius: 6, transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#27272a'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Conversation List ────────────────────────────────────────────
function ConversationList({ conversations, loading, activeId, onSelect, onNewMessage }) {
  const user = getUser();
  const [filter, setFilter] = useState('all');
  const { onlineUsers } = useSocket();

  const filtered = filter === 'unread'
    ? conversations.filter(c => c.unread_count > 0)
    : conversations;

  return (
    <div className="flex flex-col h-full border-r border-zinc-800 bg-black">
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-1">
          <h1 className="text-xl font-bold text-white">{user?.username}</h1>
          <ChevronDown className="w-5 h-5 text-white" />
        </div>
        <button onClick={onNewMessage} className="text-white hover:text-zinc-400">
          <Edit className="w-6 h-6" />
        </button>
      </div>

      <div className="flex gap-2 px-4 py-3 border-b border-zinc-800">
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize ${filter === f ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
            {f === 'all' ? 'Primary' : 'Unread'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-base font-semibold text-white">Messages</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-zinc-500 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-white font-semibold">No messages yet</p>
            <p className="text-zinc-500 text-sm mt-1">Start a new conversation</p>
          </div>
        ) : (
          filtered.map(conv => {
            const isOnline = onlineUsers?.has?.(Number(conv.other_user_id));
            return (
              <button key={conv.id} onClick={() => onSelect(conv)}
                className={`flex w-full items-center gap-3 px-4 py-3 transition-colors text-left ${activeId === conv.id ? 'bg-zinc-900' : 'hover:bg-zinc-900/50'}`}>
                <Avatar src={conv.other_profile_picture} username={conv.other_username} size={10} online={isOnline === true} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-white' : 'text-white'}`}>{conv.other_username}</span>
                    {conv.last_message_time && <span className="text-xs text-zinc-500 ml-2 shrink-0">{formatTime(conv.last_message_time)}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm truncate flex-1 ${conv.unread_count > 0 ? 'text-white font-medium' : 'text-zinc-400'}`}>
                      {conv.last_message || 'Start a conversation'}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-xs font-bold text-white">
                        {conv.unread_count > 99 ? '99+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Chat Window ──────────────────────────────────────────────────
function ChatWindow({ conversation, onBack }) {
  const user = getUser();
  const { socket, joinConversation, startTyping, stopTyping, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingWho, setTypingWho] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const isOnline = onlineUsers?.has?.(Number(conversation.other_user_id));

  const fetchMessages = useCallback(() => {
    fetch(`${API}/messages/${conversation.id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [conversation.id]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();
    joinConversation(conversation.id);
    // Poll every 3s to update read receipts live
    const pollInterval = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollInterval);
  }, [conversation.id]);

  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (msg) => {
      const convId = msg.conversation_id ?? msg.conversationId;
      if (convId === conversation.id && msg.sender_id !== user?.id) fetchMessages();
    };
    const onUserTyping = ({ username }) => {
      setIsTyping(true);
      setTypingWho(username);
    };
    const onStopTyping = () => {
      setIsTyping(false);
      setTypingWho('');
    };
    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stop_typing', onStopTyping);
    return () => {
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onUserTyping);
      socket.off('user_stop_typing', onStopTyping);
    };
  }, [socket, conversation.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = async (content) => {
    const msg = content || text.trim();
    if (!msg) return;
    setText('');
    try {
      const res = await fetch(`${API}/messages/${conversation.id}`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ content: msg }),
      });
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
      if (socket) socket.emit('send_message', { conversationId: conversation.id, content: msg, senderId: user.id, receiverId: conversation.other_user_id });
    } catch (err) { console.error('Send failed:', err); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    startTyping(conversation.id, user.username);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(conversation.id), 2000);
  };

  // Emoji
  const handleEmojiSelect = (emoji) => {
    setText(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  // Send image/file
  const handleImageSend = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('media', file);
    formData.append('caption', '');
    try {
      // Upload to posts endpoint to get Cloudinary URL, then send as message
      const uploadRes = await fetch(`${API}/messages/${conversation.id}/media`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        const newMsg = data.message || data;
        setMessages(prev => [...prev, newMsg]);
        if (socket) socket.emit('send_message', { conversationId: conversation.id, content: data.content || '📷 Image', senderId: user.id, receiverId: conversation.other_user_id });
      } else {
        // Fallback: send as text link
        const reader = new FileReader();
        reader.onload = () => handleSend(`📷 [Image sent]`);
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error(err);
      handleSend('📷 [Image sent]');
    }
    e.target.value = '';
  };

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        // Send voice note as message
        const formData = new FormData();
        formData.append('media', blob, 'voice.webm');
        try {
          const uploadRes = await fetch(`${API}/messages/${conversation.id}/media`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            body: formData,
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            setMessages(prev => [...prev, data.message || data]);
          } else {
            handleSend('🎤 [Voice note]');
          }
        } catch { handleSend('🎤 [Voice note]'); }
      };
      mediaRecorder.start();
      setRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000);
    } catch (err) {
      console.error('Mic access denied:', err);
      alert('Microphone access denied. Please allow mic in browser settings.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(recordTimerRef.current);
      setRecordSeconds(0);
    }
  };

  const grouped = [];
  let currentDate = '';
  messages.forEach(msg => {
    const d = new Date(msg.created_at).toLocaleDateString();
    if (d !== currentDate) { currentDate = d; grouped.push({ date: d, msgs: [msg] }); }
    else grouped[grouped.length - 1].msgs.push(msg);
  });

  return (
    <div className="flex flex-col h-full bg-black" style={{ position: 'relative' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-white lg:hidden mr-1"><ArrowLeft className="w-6 h-6" /></button>
          <Avatar src={conversation.other_profile_picture} username={conversation.other_username} size={10} online={isOnline === true} />
          <div>
            <h2 className="text-base font-semibold text-white">{conversation.other_username}</h2>
            <p className="text-xs text-zinc-500">{isOnline ? 'Active now' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white">
          <button className="hover:text-zinc-400"><Phone className="w-6 h-6" /></button>
          <button className="hover:text-zinc-400"><Video className="w-6 h-6" /></button>
          <button className="hover:text-zinc-400"><Info className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Avatar src={conversation.other_profile_picture} username={conversation.other_username} size={16} />
            <h3 className="mt-4 text-lg font-semibold text-white">{conversation.other_username}</h3>
            <p className="text-sm text-zinc-500 mt-1">Start a conversation!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {grouped.map(group => (
              <div key={group.date}>
                <div className="flex items-center justify-center my-4">
                  <span className="text-xs text-zinc-500">{formatDateHeader(group.date)}</span>
                </div>
                {group.msgs.map((msg, i) => {
                  const isOwn = msg.sender_id === user?.id;
                  const showTime = i === group.msgs.length - 1 || group.msgs[i + 1]?.sender_id !== msg.sender_id;
                  const isImage = msg.media_url && (msg.media_type === 'image' || msg.media_url?.match(/\.(jpg|jpeg|png|gif|webp)/i));
                  const isAudio = msg.media_url && (msg.media_type === 'audio' || msg.media_url?.match(/\.(webm|mp3|ogg|wav)/i));
                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[70%] mb-1 ${isOwn ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
                      {isImage ? (
                        <img src={imgSrc(msg.media_url)} alt="media" style={{ maxWidth: 220, borderRadius: 12, objectFit: 'cover' }} />
                      ) : isAudio ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 18, background: isOwn ? '#2563eb' : '#27272a', maxWidth: 220 }}>
                          <audio src={imgSrc(msg.media_url)} style={{ display: 'none' }} id={`audio-${msg.id}`} onEnded={() => { const btn = document.getElementById(`play-${msg.id}`); if(btn) btn.textContent = '▶'; }} />
                          <button id={`play-${msg.id}`} onClick={() => { const a = document.getElementById(`audio-${msg.id}`); const btn = document.getElementById(`play-${msg.id}`); if(a.paused){a.play();btn.textContent='⏸';}else{a.pause();btn.textContent='▶';} }}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#fff', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            ▶
                          </button>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {Array.from({length: 20}).map((_, i) => (
                              <div key={i} style={{ width: 3, borderRadius: 3, background: 'rgba(255,255,255,0.7)', height: Math.random() * 16 + 4 }} />
                            ))}
                          </div>
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, flexShrink: 0 }}>🎤</span>
                        </div>
                      ) : (
                        <div className={`px-4 py-2 rounded-2xl break-words ${isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-zinc-800 text-white rounded-bl-sm'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      )}
                      {showTime && (
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-xs text-zinc-500">{formatMsgTime(msg.created_at)}</span>
                          {isOwn && (msg.is_read ? <CheckCheck className="w-3 h-3 text-blue-400" /> : <Check className="w-3 h-3 text-zinc-500" />)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {isTyping && (
              <div className="self-start mt-2">
                <p className="text-xs text-zinc-500 mb-1">{typingWho} is typing...</p>
                <TypingIndicator />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{ position: 'absolute', bottom: 80, left: 16, zIndex: 100 }}>
          <EmojiPicker onSelect={(e) => { handleEmojiSelect(e); setShowEmoji(false); }} onClose={() => setShowEmoji(false)} />
        </div>
      )}

      {/* Input */}
      <div className="border-t border-zinc-800 p-3 shrink-0">
        {recording ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#18181b', borderRadius: 999, padding: '10px 16px', border: '1px solid #ef4444' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
            <span style={{ color: '#fff', fontSize: 14, flex: 1 }}>Recording... {recordSeconds}s</span>
            <button onClick={stopRecording} style={{ background: '#ef4444', border: 'none', borderRadius: 999, padding: '6px 16px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              Send
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, background: '#18181b', borderRadius: 24, border: '1px solid #3f3f46', padding: '8px 12px' }}>
            {/* Emoji */}
            <button onClick={() => setShowEmoji(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: showEmoji ? '#3b82f6' : '#71717a', flexShrink: 0, display: 'flex' }}>
              <Smile size={22} />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              placeholder="Message..."
              rows={1}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, resize: 'none', minHeight: 24, maxHeight: 120, fontFamily: 'inherit' }}
            />

            {text.trim() ? (
              <button onClick={() => handleSend()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                Send
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                {/* Image */}
                <button onClick={() => imageInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', display: 'flex' }}>
                  <Image size={22} />
                </button>
                <input ref={imageInputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleImageSend} />

                {/* File */}
                <button onClick={() => fileInputRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', display: 'flex' }}>
                  <Paperclip size={22} />
                </button>
                <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleImageSend} />

                {/* Voice note */}
                <button onMouseDown={startRecording} onMouseUp={stopRecording} onTouchStart={startRecording} onTouchEnd={stopRecording}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', display: 'flex' }}>
                  <Mic size={22} />
                </button>

                {/* Heart */}
                <button onClick={() => handleSend('❤️')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', display: 'flex' }}>
                  <Heart size={22} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

// ── New Message Modal ────────────────────────────────────────────
function NewMessageModal({ isOpen, onClose, onSelectUser }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    fetch(`${API}/users/all`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setAllUsers(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/users/search?q=${encodeURIComponent(query)}`, { headers: authHeaders() });
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const handleNext = () => {
    if (selected) { onSelectUser(selected); onClose(); setSelected(null); setQuery(''); }
  };

  const displayUsers = query ? results : allUsers;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-lg mx-4 bg-zinc-900 rounded-xl border border-zinc-700 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 shrink-0">
          <button onClick={onClose} className="text-white hover:text-zinc-400"><X className="w-6 h-6" /></button>
          <h2 className="text-base font-semibold text-white">New message</h2>
          <button onClick={handleNext} disabled={!selected}
            className={`text-sm font-semibold ${selected ? 'text-blue-500 hover:text-blue-400' : 'text-zinc-600 cursor-not-allowed'}`}>
            Next
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-700 shrink-0">
          <span className="text-base font-semibold text-white">To:</span>
          {selected && (
            <span className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg text-sm">
              {selected.username}
              <button onClick={() => setSelected(null)}><X className="w-3 h-3" /></button>
            </span>
          )}
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search users..."
            className="flex-1 min-w-[100px] bg-transparent text-sm text-white placeholder-zinc-500 outline-none" />
        </div>
        <div className="flex-1 overflow-y-auto">
          {searching ? (
            <div className="flex items-center justify-center py-12 text-zinc-500 text-sm">Searching...</div>
          ) : displayUsers.length > 0 ? (
            <div className="py-2">
              {displayUsers.map(u => (
                <button key={u.id} onClick={() => setSelected(u)}
                  className={`flex w-full items-center justify-between px-4 py-2 transition-colors ${selected?.id === u.id ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'}`}>
                  <div className="flex items-center gap-3">
                    <Avatar src={u.profile_picture} username={u.username} size={10} />
                    <div className="text-left">
                      <span className="text-sm font-semibold text-white">{u.username}</span>
                      {u.bio && <p className="text-xs text-zinc-500 truncate max-w-[200px]">{u.bio}</p>}
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected?.id === u.id ? 'bg-blue-500 border-blue-500' : 'border-zinc-500'}`}>
                    {selected?.id === u.id && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="px-4 py-12 text-center text-sm text-zinc-500">No user found.</div>
          ) : (
            <div className="px-4 py-6 text-sm text-zinc-500">Loading users...</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main DMs Page ────────────────────────────────────────────────
export default function DMs({ openUserId, onUnreadCount }) {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/conversations`, { headers: authHeaders() });
      const data = await res.json();
      const convs = Array.isArray(data) ? data : [];
      setConversations(convs);
      // Count conversations with unread messages (not total messages)
      const unreadConvs = convs.filter(c => c.unread_count > 0).length;
      if (onUnreadCount) onUnreadCount(unreadConvs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [onUnreadCount]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!openUserId || loading || conversations.length === 0) return;
    const existing = conversations.find(c => Number(c.other_user_id) === Number(openUserId));
    if (existing) { setActive(existing); return; }
    fetch(`${API}/users/${openUserId}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(user => handleSelectUser(user))
      .catch(console.error);
  }, [openUserId, loading, conversations]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', fetchConversations);
    return () => socket.off('new_message', fetchConversations);
  }, [socket, fetchConversations]);

  const handleSelectUser = async (user) => {
    const existing = conversations.find(c => c.other_user_id === user.id);
    if (existing) { setActive(existing); return; }
    try {
      const res = await fetch(`${API}/conversations`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ userId: user.id }),
      });
      const newConv = await res.json();
      const convWithUser = { ...newConv, other_user_id: user.id, other_username: user.username, other_profile_picture: user.profile_picture, other_status: user.status };
      setConversations(prev => [convWithUser, ...prev]);
      setActive(convWithUser);
    } catch (err) { console.error('Create conversation failed:', err); }
  };

  return (
    <div className="flex h-screen bg-black">
      <div className={`w-full lg:w-96 shrink-0 ${active ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
        <ConversationList conversations={conversations} loading={loading} activeId={active?.id} onSelect={setActive} onNewMessage={() => setShowModal(true)} />
      </div>
      <div className={`flex-1 ${!active ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
        {active ? (
          <ChatWindow conversation={active} onBack={() => setActive(null)} />
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Your messages</h2>
            <p className="text-zinc-500 text-sm mt-2">Send a message to start a chat.</p>
            <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-sm transition-colors">
              Send message
            </button>
          </div>
        )}
      </div>
      <NewMessageModal isOpen={showModal} onClose={() => setShowModal(false)} onSelectUser={handleSelectUser} />
    </div>
  );
}