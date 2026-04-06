import * as chatRepository from '../repositories/chatRepository.js';

export const getChatUsers = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const users = await chatRepository.getChatUsers(currentUserId);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Không thể lấy danh sách user chat' });
  }
};

export const getMessagesWithUser = async (req, res) => {
  try {
    const currentUserId = Number(req.user.id);
    const otherUserId = Number(req.params.userId);
    const limit = Number(req.query.limit || 100);

    if (!otherUserId) {
      return res.status(400).json({ error: 'userId không hợp lệ' });
    }

    const otherUser = await chatRepository.getChatUserById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: 'Người dùng không tồn tại' });
    }

    const messages = await chatRepository.getMessagesBetweenUsers({
      userAId: currentUserId,
      userBId: otherUserId,
      limit
    });

    return res.json(messages);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Không thể lấy lịch sử tin nhắn' });
  }
};
