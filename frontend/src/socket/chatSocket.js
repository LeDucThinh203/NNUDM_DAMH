import { io } from 'socket.io-client';

let socket = null;

const getSocketServerUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }

  const host = window.location.hostname;
  const isLocalDev = host === 'localhost' || host === '127.0.0.1';
  if (isLocalDev) {
    return `http://${host}:3006`;
  }

  return `${window.location.protocol}//${window.location.hostname}:3006`;
};

export const connectChatSocket = (token) => {
  if (!token) return null;

  const socketToken = typeof token === 'string'
    ? token.trim().replace(/^Bearer\s+/i, '')
    : '';

  if (!socketToken) return null;

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(getSocketServerUrl(), {
    transports: ['polling', 'websocket'],
    upgrade: true,
    auth: { token: socketToken }
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connect error:', error.message);
  });

  return socket;
};

export const getChatSocket = () => socket;

export const disconnectChatSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
