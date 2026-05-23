import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API, SOCKET_URL } from '../api';

const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

const Chat = ({ conversation, token, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!conversation?.id) return;

    fetchMessages();

    socket.emit('join_conversation', conversation.id);

    socket.on('new_message', (msg) => {
      if (msg.conversation_id === conversation.id) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('user_typing', ({ username }) => {
      setIsTyping(true);
      setTypingUser(username);

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    });

    socket.on('user_stop_typing', () => {
      setIsTyping(false);
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

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

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const tempMsg = newMessage;
    setNewMessage('');

    try {
      const res = await fetch(`${API}/messages/${conversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: tempMsg })
      });

      const data = await res.json();

      setMessages(prev => [...prev, data]);

      socket.emit('send_message', {
        ...data,
        conversationId: conversation.id
      });

      socket.emit('stop_typing', { conversationId: conversation.id });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    socket.emit('typing', {
      conversationId: conversation.id,
      username: currentUser.username
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: conversation.id });
    }, 1000);
  };

  const formatTime = (d) =>
    new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isRead = (msg) => msg.is_read === 1;

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
          {conversation.other_username?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm">{conversation.other_username}</p>
          <p className="text-xs text-zinc-500">
            {conversation.other_status === 'online' ? '🟢 Online' : '⚫ Offline'}
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map(msg => {
          const isMe = msg.sender_id === currentUser.id;

          const isAudio =
            msg.media_url &&
            msg.media_url.match(/\.(webm|mp3|wav|ogg)/i);

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-zinc-800 text-white rounded-bl-sm'
                }`}
              >

                {/* TEXT */}
                {!msg.media_url && <p>{msg.content}</p>}

                {/* AUDIO (FIXED MOBILE SAFE UI) */}
                {isAudio && (
                  <div className="flex items-center gap-2 w-fit max-w-[160px] overflow-hidden">

                    <audio
                      id={`a-${msg.id}`}
                      src={`${API}${msg.media_url}`}
                      style={{ display: 'none' }}
                    />

                    <button
                      onClick={() => {
                        const a = document.getElementById(`a-${msg.id}`);
                        a.paused ? a.play() : a.pause();
                      }}
                      className="text-white text-xs"
                    >
                      ▶
                    </button>

                    {/* SMALL WAVEFORM (SAFE) */}
                    <div className="flex gap-[2px] items-end max-w-[60px] overflow-hidden">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[2px] bg-white/70 rounded"
                          style={{
                            height: `${Math.random() * 10 + 4}px`
                          }}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] opacity-60">🎤</span>
                  </div>
                )}

                {/* TIME + READ */}
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-[10px] opacity-60">
                    {formatTime(msg.created_at)}
                  </span>

                  {isMe && (
                    <span className="text-[10px]">
                      {isRead(msg) ? '✔✔' : '✔'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* TYPING */}
        {isTyping && (
          <div className="text-xs text-zinc-400">
            {typingUser} is typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-zinc-800 flex gap-3"
      >
        <input
          value={newMessage}
          onChange={handleTyping}
          placeholder="Message..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm"
        />

        <button
          disabled={!newMessage.trim()}
          className="bg-blue-600 text-white px-5 rounded-full text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;