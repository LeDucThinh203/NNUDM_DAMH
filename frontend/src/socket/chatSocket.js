import { io } from 'socket.io-client';

let socket = null;
const SOCKET_SERVER_URL =
  process.env.REACT_APP_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:3006`;

export const connectChatSocket = (token) => {
  if (!token) return null;

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_SERVER_URL, {
    transports: ['websocket', 'polling'],
    auth: { token }
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
