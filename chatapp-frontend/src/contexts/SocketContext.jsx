import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) return;

    const user = JSON.parse(userRaw);

    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('user_online', user.id);
    });

    newSocket.on('disconnect', () => setIsConnected(false));

    newSocket.on('online_users', (userIds) => {
      setOnlineUsers(new Set(userIds.map(id => Number(id))));
    });

    newSocket.on('user_status_change', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (status === 'online') next.add(Number(userId));
        else next.delete(Number(userId));
        return next;
      });
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const joinConversation = useCallback((conversationId) => {
    if (socket) socket.emit('join_conversation', conversationId);
  }, [socket]);

  const leaveConversation = useCallback((conversationId) => {
    if (socket) socket.emit('leave_conversation', conversationId);
  }, [socket]);

  const startTyping = useCallback((conversationId, username) => {
    if (socket) socket.emit('typing', { conversationId, username });
  }, [socket]);

  const stopTyping = useCallback((conversationId) => {
    if (socket) socket.emit('stop_typing', { conversationId });
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      onlineUsers,
      joinConversation,
      leaveConversation,
      startTyping,
      stopTyping,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be inside SocketProvider');
  return ctx;
}