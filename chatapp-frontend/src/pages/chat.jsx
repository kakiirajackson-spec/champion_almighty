import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API, SOCKET_URL } from '../api';

const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

const Chat = ({ conversation, token, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  // ───────────────── FETCH MESSAGES ─────────────────
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API}/messages/${conversation.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // ───────────────── INIT ─────────────────
  useEffect(() => {
    if (!conversation?.id) return;

    fetchMessages();

    socket.emit('join_conversation', conversation.id);

    socket.on('new_message', (msg) => {
      if (msg.conversation_id === conversation.id) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('user_typing', () => setIsTyping(true));
    socket.on('user_stop_typing', () => setIsTyping(false));

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [conversation.id]);

  // ───────────────── AUTO SCROLL ─────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ───────────────── SEND MESSAGE ─────────────────
  const sendMessage = async () => {
    if (!text.trim()) return;

    const msgText = text;
    setText('');

    try {
      const res = await fetch(`${API}/messages/${conversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: msgText })
      });

      const msg = await res.json();
      setMessages(prev => [...prev, msg]);

      socket.emit('send_message', {
        ...msg,
        conversationId: conversation.id
      });

    } catch (err) {
      console.error(err);
    }
  };

  // ───────────────── TYPING ─────────────────
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit('typing', {
      conversationId: conversation.id,
      username: currentUser.username
    });

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', {
        conversationId: conversation.id
      });
    }, 1000);
  };

  // ───────────────── VOICE NOTE PLAY ─────────────────
  const toggleAudio = (id) => {
    const audio = document.getElementById(`audio-${id}`);
    const btn = document.getElementById(`btn-${id}`);

    if (!audio) return;

    if (audio.paused) {
      audio.play();
      btn.innerText = '⏸';
    } else {
      audio.pause();
      btn.innerText = '▶';
    }
  };

  // ───────────────── UI ─────────────────
  return (
    <div className="flex flex-col h-full bg-black">

      {/* HEADER */}
      <div className="p-4 border-b border-zinc-800 text-white font-semibold">
        {conversation.other_username}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map(msg => {
          const isMe = msg.sender_id === currentUser.id;
          const isAudio = msg.media_url && msg.media_url.includes('.webm');

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >

              {/* TEXT */}
              {!isAudio && (
                <div className={`px-4 py-2 rounded-2xl text-sm max-w-xs
                  ${isMe ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-white'}
                `}>
                  {msg.content}
                </div>
              )}

              {/* VOICE NOTE (WHATSAPP STYLE) */}
              {isAudio && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full max-w-xs
                  ${isMe ? 'bg-blue-600' : 'bg-zinc-800'}
                `}>

                  <button
                    id={`btn-${msg.id}`}
                    onClick={() => toggleAudio(msg.id)}
                    className="w-8 h-8 rounded-full bg-white/20 text-white"
                  >
                    ▶
                  </button>

                  <audio id={`audio-${msg.id}`} src={`${API}${msg.media_url}`} />

                  <div className="flex gap-[2px] items-end h-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-[2px] bg-white/70 rounded"
                        style={{ height: 4 + (i % 7) * 2 }}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] text-white/70">🎤</span>
                </div>
              )}

            </div>
          );
        })}

        {/* TYPING */}
        {isTyping && (
          <div className="text-xs text-zinc-400">typing...</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 border-t border-zinc-800 flex gap-2">
        <input
          value={text}
          onChange={handleTyping}
          className="flex-1 bg-zinc-900 text-white px-4 py-2 rounded-full"
          placeholder="Message..."
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;