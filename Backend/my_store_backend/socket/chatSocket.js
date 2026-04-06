import { Server } from 'socket.io';
import { verifyToken } from '../middleware/auth.js';
import * as chatRepository from '../repositories/chatRepository.js';

let io = null;
const connectedUsers = new Map(); // userId -> Set(socketId)

const getOnlineUserIds = () => Array.from(connectedUsers.keys());

const addUserSocket = (userId, socketId) => {
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }
  connectedUsers.get(userId).add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  if (!connectedUsers.has(userId)) return;

  const socketSet = connectedUsers.get(userId);
  socketSet.delete(socketId);

  if (socketSet.size === 0) {
    connectedUsers.delete(userId);
  }
};

const broadcastOnlineUsers = () => {
  if (!io) return;
  io.emit('chat:online-users', getOnlineUserIds());
};

export const initChatSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const tokenFromAuth = socket.handshake.auth?.token;
    const tokenFromQuery = socket.handshake.query?.token;
    const rawToken = tokenFromAuth || tokenFromQuery;

    if (!rawToken) {
      return next(new Error('Không tìm thấy token socket'));
    }

    const token = typeof rawToken === 'string' && rawToken.startsWith('Bearer ')
      ? rawToken.substring(7)
      : rawToken;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return next(new Error('Token socket không hợp lệ'));
    }

    socket.user = decoded;
    return next();
  });

  io.on('connection', (socket) => {
    const userId = Number(socket.user.id);

    addUserSocket(userId, socket.id);
    socket.join(`user:${userId}`);
    socket.emit('chat:online-users', getOnlineUserIds());
    broadcastOnlineUsers();

    socket.on('chat:send', async (payload, ack) => {
      try {
        const toUserId = Number(payload?.toUserId);
        const content = String(payload?.content || '').trim();

        if (!toUserId || !content) {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'Thiếu toUserId hoặc nội dung tin nhắn' });
          }
          return;
        }

        const receiver = await chatRepository.getChatUserById(toUserId);
        if (!receiver) {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'Người nhận không tồn tại' });
          }
          return;
        }

        const savedMessage = await chatRepository.createMessage({
          senderId: userId,
          receiverId: toUserId,
          message: content
        });

        io.to(`user:${userId}`).to(`user:${toUserId}`).emit('chat:message', savedMessage);

        if (typeof ack === 'function') {
          ack({ ok: true, data: savedMessage });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ ok: false, error: error.message || 'Không thể gửi tin nhắn' });
        }
      }
    });

    socket.on('chat:recall', async (payload, ack) => {
      try {
        const messageId = Number(payload?.messageId);
        const mode = payload?.mode === 'all' ? 'all' : 'self';

        if (!messageId) {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'messageId không hợp lệ' });
          }
          return;
        }

        const result = await chatRepository.recallMessageBySender({
          messageId,
          senderId: userId,
          mode
        });

        if (result.status === 'not-found') {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'Không tìm thấy tin nhắn hoặc bạn không có quyền thu hồi' });
          }
          return;
        }

        if (result.status === 'expired') {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'Đã quá 1 ngày, không thể thu hồi tin nhắn này' });
          }
          return;
        }

        const eventPayload = {
          messageId,
          mode,
          senderId: result.senderId,
          receiverId: result.receiverId,
          recalledAt: new Date().toISOString()
        };

        io.to(`user:${result.senderId}`).to(`user:${result.receiverId}`).emit('chat:message-recalled', eventPayload);

        if (typeof ack === 'function') {
          ack({ ok: true, data: eventPayload });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ ok: false, error: error.message || 'Không thể thu hồi tin nhắn' });
        }
      }
    });

    socket.on('chat:react', async (payload, ack) => {
      try {
        const messageId = Number(payload?.messageId);
        const reaction = typeof payload?.reaction === 'string' ? payload.reaction.trim() : '';

        if (!messageId) {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'messageId không hợp lệ' });
          }
          return;
        }

        const result = await chatRepository.reactToMessage({
          messageId,
          userId,
          reaction: reaction || null
        });

        if (result.status === 'not-found') {
          if (typeof ack === 'function') {
            ack({ ok: false, error: 'Không tìm thấy tin nhắn để thả cảm xúc' });
          }
          return;
        }

        const eventPayload = {
          messageId: result.messageId,
          senderId: result.senderId,
          receiverId: result.receiverId,
          reactions: result.reactions,
          updatedBy: userId
        };

        io.to(`user:${result.senderId}`).to(`user:${result.receiverId}`).emit('chat:message-reacted', eventPayload);

        if (typeof ack === 'function') {
          ack({ ok: true, data: eventPayload });
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ ok: false, error: error.message || 'Không thể thả cảm xúc' });
        }
      }
    });

    socket.on('disconnect', () => {
      removeUserSocket(userId, socket.id);
      broadcastOnlineUsers();
    });
  });

  return io;
};

export const getSocketServer = () => io;
