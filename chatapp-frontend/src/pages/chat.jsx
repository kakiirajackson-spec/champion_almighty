import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API, SOCKET_URL } from '../api';

const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

const Chat = ({ conversation, token, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  let typingTimeout = null;

  useEffect(() => {
    fetchMessages();
    socket.emit('user_online', currentUser.id);
    socket.emit('join_conversation', conversation.id);

    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user_typing', ({ username }) => {
      setIsTyping(true);
    });

    socket.on('user_stop_typing', () => {
      setIsTyping(false);
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API}/messages/${conversation.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`${API}/messages/${conversation.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: newMessage })
      });
      const data = await res.json();
      setMessages(prev => [...prev, data]);
      socket.emit('send_message', { ...data, conversationId: conversation.id });
      setNewMessage('');
      socket.emit('stop_typing', { conversationId: conversation.id });
    } catch (err) {
      console.error(err);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    socket.emit('typing', { conversationId: conversation.id, username: currentUser.username });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: conversation.id });
    }, 1000);
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
            {conversation.other_username[0].toUpperCase()}
          </div>
          {conversation.other_status === 'online' && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
          )}
        </div>
        <div>
          <p className="font-semibold text-sm">{conversation.other_username}</p>
          <p className="text-xs text-zinc-500">
            {conversation.other_status === 'online' ? '🟢 Online' : '⚫ Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
              msg.sender_id === currentUser.id
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-zinc-800 text-white rounded-bl-sm'
            }`}>
              <p>{msg.content}</p>
              <p className="text-[10px] opacity-60 mt-1 text-right">{formatTime(msg.created_at)}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-800 px-4 py-2 rounded-2xl text-xs text-zinc-400">typing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-zinc-800 flex gap-3">
        <input
          type="text"
          placeholder="Message..."
          value={newMessage}
          onChange={handleTyping}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full py-2 px-4 text-sm focus:outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 rounded-full text-sm disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;