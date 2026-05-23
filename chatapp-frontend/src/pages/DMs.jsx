import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import {
  Edit, ChevronDown, X, Send,
  Smile, Image, Heart, Check, CheckCheck,
  Phone, Video, Info, ArrowLeft, Mic, Paperclip,
  Play, Pause
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

function formatDur(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ── Avatar ───────────────────────────────────────────────────────
function Avatar({ src, username, size = 10, online = false }) {
  const initials = username ? username[0].toUpperCase() : '?';
  const px = { 8: 32, 10: 40, 12: 48, 16: 64 }[size] || 40;
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: px, height: px }}>
      {src ? (
        <img src={imgSrc(src)} alt={username} style={{ width: px, height: px, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: px, height: px, borderRadius: '50%', background: 'linear-gradient(135deg,#a855f7,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: px * 0.35 }}>
          {initials}
        </div>
      )}
      {online === true && (
        <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid #000' }} />
      )}
    </div>
  );
}

// ── WhatsApp-style Voice Note Player ────────────────────────────
function VoiceNote({ src, isOwn }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Generate fake waveform bars
  const bars = Array.from({ length: 30 }, (_, i) => {
    const heights = [3, 5, 8, 12, 16, 10, 7, 14, 18, 9, 6, 13, 20, 15, 8, 11, 17, 6, 9, 14, 19, 7, 10, 15, 8, 12, 5, 9, 13, 4];
    return heights[i % heights.length];
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => setDuration(audio.duration);
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.currentTime / audio.duration || 0);
    };
    const onEnded = () => { setPlaying(false); setProgress(0); setCurrentTime(0); };
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    audio.currentTime = ratio * duration;
    setProgress(ratio);
  };

  const activeColor = isOwn ? '#fff' : '#3b82f6';
  const inactiveColor = isOwn ? 'rgba(255,255,255,0.35)' : 'rgba(59,130,246,0.3)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', minWidth: 200, maxWidth: 280 }}>
      <audio ref={audioRef} src={imgSrc(src)} preload="metadata" style={{ display: 'none' }} />

      {/* Play/Pause button */}
      <button onClick={togglePlay} style={{
        width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
        background: isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(59,130,246,0.2)',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {playing
          ? <Pause size={18} color={activeColor} fill={activeColor} />
          : <Play size={18} color={activeColor} fill={activeColor} style={{ marginLeft: 2 }} />
        }
      </button>

      {/* Waveform + progress */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Waveform bars */}
        <div
          onClick={handleSeek}
          style={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer', height: 28 }}
        >
          {bars.map((h, i) => {
            const filled = i / bars.length <= progress;
            return (
              <div key={i} style={{
                width: 3, height: h, borderRadius: 2, flexShrink: 0,
                background: filled ? activeColor : inactiveColor,
                transition: 'background 0.1s',
              }} />
            );
          })}
        </div>

        {/* Time */}
        <span style={{ fontSize: 10, color: isOwn ? 'rgba(255,255,255,0.7)' : '#71717a' }}>
          {playing ? formatDur(currentTime) : formatDur(duration)}
        </span>
      </div>

      {/* Mic icon */}
      <Mic size={14} color={isOwn ? 'rgba(255,255,255,0.5)' : '#71717a'} style={{ flexShrink: 0 }} />
    </div>
  );
}

// ── Typing Indicator ─────────────────────────────────────────────
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
];

function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="absolute bottom-16 left-4 bg-zinc-950 border border-zinc-800 rounded-2xl p-3 z-50 w-72 shadow-2xl">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-zinc-400 text-xs font-semibold tracking-wide uppercase">Emojis</span>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
        {EMOJIS.map(emoji => (
          <button key={emoji} onClick={() => onSelect(emoji)} className="text-2xl p-1 rounded-lg hover:bg-zinc-800 transition-colors">
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

  const filtered = filter === 'unread' ? conversations.filter(c => c.unread_count > 0) : conversations;

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
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${filter === f ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
            {f === 'all' ? 'Primary' : 'Unread'}
          </button>
        ))}
      </div>
      <div className="flex items-center px-4 py-3">
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
        ) : filtered.map(conv => {
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
        })}
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const durationIntervalRef = useRef(null);

  const isOnline = onlineUsers?.has?.(Number(conversation.other_user_id));

  const fetchMessages = useCallback(() => {
    fetch(`${API}/messages/${conversation.id}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [conversation.id]);

  useEffect(() => {
    setLoading(true); setMessages([]);
    fetchMessages();
    joinConversation(conversation.id);
  }, [conversation.id]);

  useEffect(() => {
    if (!socket) return;
    const onNewMsg = (msg) => {
      const convId = msg.conversation_id ?? msg.conversationId;
      if (convId === conversation.id) fetchMessages();
    };
    const onUserTyping = ({ username }) => { setIsTyping(true); setTypingWho(username); };
    const onStopTyping = () => { setIsTyping(false); setTypingWho(''); };
    socket.on('new_message', onNewMsg);
    socket.on('user_typing', onUserTyping);
    socket.on('user_stop_typing', onStopTyping);
    return () => {
      socket.off('new_message', onNewMsg);
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

  useEffect(() => { return () => { if (durationIntervalRef.current) clearInterval(durationIntervalRef.current); }; }, []);

  const handleSend = async (forcedContent = null) => {
    const content = forcedContent !== null ? forcedContent : text.trim();
    if (!content) return;
    if (forcedContent === null) setText('');
    try {
      const res = await fetch(`${API}/messages/${conversation.id}`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ content }),
      });
      const newMsg = await res.json();
      setMessages(prev => [...prev, newMsg]);
      if (socket) socket.emit('send_message', { conversationId: conversation.id, content, senderId: user.id, receiverId: conversation.other_user_id });
    } catch (err) { console.error(err); }
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleTyping = (e) => {
    setText(e.target.value);
    startTyping(conversation.id, user.username);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(conversation.id), 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('media', file);
    try {
      const res = await fetch(`${API}/messages/${conversation.id}/media`, {
        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData,
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        if (socket) socket.emit('send_message', { conversationId: conversation.id, content: newMsg.content || '📎', senderId: user.id, receiverId: conversation.other_user_id });
      }
    } catch (err) { console.error(err); }
    finally { e.target.value = ''; }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        if (audioChunksRef.current.length === 0) return;
        const formData = new FormData();
        formData.append('media', audioBlob, 'voicenote.webm');
        try {
          const res = await fetch(`${API}/messages/${conversation.id}/media`, {
            method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData,
          });
          if (res.ok) {
            const newMsg = await res.json();
            setMessages(prev => [...prev, newMsg]);
            if (socket) socket.emit('send_message', { conversationId: conversation.id, content: '🎤 Voice note', senderId: user.id, receiverId: conversation.other_user_id });
          }
        } catch (err) { console.error(err); }
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);
      durationIntervalRef.current = setInterval(() => setRecordDuration(p => p + 1), 1000);
    } catch (err) { console.error('Mic access blocked:', err); }
  };

  const stopAudioRecording = (shouldSend = true) => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    clearInterval(durationIntervalRef.current);
    setIsRecording(false);
    if (!shouldSend) audioChunksRef.current = [];
    mediaRecorderRef.current.stop();
  };

  const fmtDur = (sec) => { const m = Math.floor(sec / 60); const s = sec % 60; return `${m}:${s < 10 ? '0' : ''}${s}`; };

  // Group messages by date
  const grouped = [];
  let currentDate = '';
  messages.forEach(msg => {
    const d = new Date(msg.created_at).toLocaleDateString();
    if (d !== currentDate) { currentDate = d; grouped.push({ date: d, msgs: [msg] }); }
    else grouped[grouped.length - 1].msgs.push(msg);
  });

  return (
    <div className="flex flex-col h-full bg-black relative">
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
                  const hasMedia = !!msg.media_url;
                  const isImg = hasMedia && /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(msg.media_url);
                  const isVid = hasMedia && /\.(mp4|webm|ogg|mov)$/i.test(msg.media_url);
                  const isAud = hasMedia && /\.(mp3|wav|ogg|webm|m4a)$/i.test(msg.media_url);

                  return (
                    <div key={msg.id} className={`flex flex-col max-w-[70%] mb-1 ${isOwn ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
                      <div className={`rounded-2xl break-words ${isOwn ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-zinc-800 text-white rounded-bl-sm'} ${isAud ? 'px-3 py-2' : isImg || isVid ? 'p-1 overflow-hidden' : 'px-4 py-2'}`}>
                        {isImg && <img src={imgSrc(msg.media_url)} alt="img" className="max-w-xs rounded-xl object-cover max-h-64" />}
                        {isVid && <video src={imgSrc(msg.media_url)} controls className="max-w-xs rounded-xl max-h-64" />}
                        {/* ── WhatsApp-style Voice Note ── */}
                        {isAud && <VoiceNote src={msg.media_url} isOwn={isOwn} />}
                        {hasMedia && !isImg && !isVid && !isAud && (
                          <a href={imgSrc(msg.media_url)} target="_blank" rel="noreferrer" className="underline text-sm flex items-center gap-1 p-2">
                            <Paperclip className="w-4 h-4 shrink-0" /> Download file
                          </a>
                        )}
                        {!hasMedia && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                      </div>
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
        <EmojiPicker onSelect={(emoji) => { setText(p => p + emoji); textareaRef.current?.focus(); }} onClose={() => setShowEmoji(false)} />
      )}

      {/* Input */}
      <div className="border-t border-zinc-800 p-4 shrink-0 bg-black">
        {isRecording ? (
          <div className="flex items-center justify-between gap-4 rounded-full border border-red-500 bg-red-950/20 px-4 py-2 text-white animate-pulse">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-sm font-medium">Recording... {fmtDur(recordDuration)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => stopAudioRecording(false)} className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800">Cancel</button>
              <button onClick={() => stopAudioRecording(true)} className="text-xs font-semibold text-white px-3 py-1 rounded bg-red-600 hover:bg-red-500">Send</button>
            </div>
          </div>
        ) : (
          <div className="flex items-end gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-2">
            <button onClick={() => setShowEmoji(!showEmoji)} className={`hover:text-zinc-400 shrink-0 mb-0.5 ${showEmoji ? 'text-blue-500' : 'text-white'}`}>
              <Smile className="w-6 h-6" />
            </button>
            <textarea ref={textareaRef} value={text} onChange={handleTyping} onKeyDown={handleKeyDown}
              placeholder="Message..." rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none resize-none min-h-[24px] max-h-[120px] py-1" />
            {text.trim() ? (
              <button onClick={() => handleSend()} className="text-blue-500 font-semibold text-sm shrink-0 hover:text-blue-400 mb-1">Send</button>
            ) : (
              <div className="flex items-center gap-3 shrink-0 mb-0.5">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*,audio/*" />
                <button onClick={() => fileInputRef.current?.click()} className="text-white hover:text-zinc-400"><Image className="w-6 h-6" /></button>
                <button onClick={startAudioRecording} className="text-white hover:text-zinc-400"><Mic className="w-6 h-6" /></button>
                <button onClick={() => handleSend('❤️')} className="text-white hover:text-zinc-400"><Heart className="w-6 h-6" /></button>
              </div>
            )}
          </div>
        )}
      </div>
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

  const displayUsers = query ? results : allUsers;
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="relative w-full max-w-lg mx-4 bg-zinc-900 rounded-xl border border-zinc-700 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 shrink-0">
          <button onClick={onClose} className="text-white hover:text-zinc-400"><X className="w-6 h-6" /></button>
          <h2 className="text-base font-semibold text-white">New message</h2>
          <button onClick={() => { if (selected) { onSelectUser(selected); onClose(); setSelected(null); setQuery(''); } }}
            disabled={!selected} className={`text-sm font-semibold ${selected ? 'text-blue-500' : 'text-zinc-600 cursor-not-allowed'}`}>Next</button>
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
                    <span className="text-sm font-semibold text-white">{u.username}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected?.id === u.id ? 'bg-blue-500 border-blue-500' : 'border-zinc-500'}`}>
                    {selected?.id === u.id && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-sm text-zinc-500">{query ? 'No user found.' : 'Loading users...'}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main DMs Page ────────────────────────────────────────────────
export default function DMs({ openUserId }) {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/conversations`, { headers: authHeaders() });
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!openUserId || loading || conversations.length === 0) return;
    const existing = conversations.find(c => Number(c.other_user_id) === Number(openUserId));
    if (existing) { setActive(existing); return; }
    fetch(`${API}/users/${openUserId}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(u => handleSelectUser(u))
      .catch(console.error);
  }, [openUserId, loading, conversations]);

  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', fetchConversations);
    return () => socket.off('new_message', fetchConversations);
  }, [socket, fetchConversations]);

  const handleSelectUser = async (u) => {
    const existing = conversations.find(c => c.other_user_id === u.id);
    if (existing) { setActive(existing); return; }
    try {
      const res = await fetch(`${API}/conversations`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ userId: u.id }),
      });
      const newConv = await res.json();
      const convWithUser = { ...newConv, other_user_id: u.id, other_username: u.username, other_profile_picture: u.profile_picture, other_status: u.status };
      setConversations(prev => [convWithUser, ...prev]);
      setActive(convWithUser);
    } catch (err) { console.error(err); }
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
            <button onClick={() => setShowModal(true)} className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-sm">Send message</button>
          </div>
        )}
      </div>
      <NewMessageModal isOpen={showModal} onClose={() => setShowModal(false)} onSelectUser={handleSelectUser} />
    </div>
  );
}