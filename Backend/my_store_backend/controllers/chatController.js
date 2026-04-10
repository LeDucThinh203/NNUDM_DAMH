import * as chatRepository from '../repositories/chatRepository.js';
import { badRequest, notFound, serverError, success } from '../utils/response.js';

export const getChatUsers = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const users = await chatRepository.getChatUsers(currentUserId);
    success(res, users);
  } catch (err) {
    serverError(res, err);
  }
};

export const getMessagesWithUser = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const otherUserId = Number(req.params.userId);
    const limit = Number(req.query.limit || 100);

    if (!otherUserId) {
      return badRequest(res, 'userId không hợp lệ');
    }

    const otherUser = await chatRepository.getChatUserById(otherUserId);
    if (!otherUser) {
      return notFound(res, 'Người dùng không tồn tại');
    }

    const messages = await chatRepository.getMessagesBetweenUsers({
      userAId: currentUserId,
      userBId: otherUserId,
      limit
    });

    success(res, messages);
  } catch (err) {
    serverError(res, err);
  }
};
