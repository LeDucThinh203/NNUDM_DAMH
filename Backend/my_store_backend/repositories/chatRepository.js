import db from '../db.js';

export const getChatUsers = async (currentUserId) => {
  const [rows] = await db.query(
    `SELECT id, username, email, role
     FROM account
     WHERE id <> ?
     ORDER BY username ASC`,
    [currentUserId]
  );

  return rows;
};

export const getChatUserById = async (userId) => {
  const [rows] = await db.query(
    `SELECT id, username, email, role
     FROM account
     WHERE id = ?`,
    [userId]
  );

  return rows[0] || null;
};

export const getMessagesBetweenUsers = async ({ userAId, userBId, limit = 100 }) => {
  const [rows] = await db.query(
    `SELECT id, sender_id, receiver_id, message, created_at, recall_expires_at, sender_hidden_at, recalled_for_all_at, reactions
     FROM chat_messages
     WHERE ((sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?))
     ORDER BY created_at ASC
     LIMIT ?`,
    [userAId, userBId, userBId, userAId, Number(limit)]
  );

  return rows;
};

export const createMessage = async ({ senderId, receiverId, message }) => {
  const [result] = await db.query(
    `INSERT INTO chat_messages (sender_id, receiver_id, message, created_at, recall_expires_at, reactions)
     VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), NULL)`,
    [senderId, receiverId, message]
  );

  const [rows] = await db.query(
    `SELECT id, sender_id, receiver_id, message, created_at, recall_expires_at, sender_hidden_at, recalled_for_all_at, reactions
     FROM chat_messages
     WHERE id = ?`,
    [result.insertId]
  );

  return rows[0] || null;
};

export const recallMessageBySender = async ({ messageId, senderId, mode }) => {
  const [rows] = await db.query(
    `SELECT id, sender_id, receiver_id, recall_expires_at
     FROM chat_messages
     WHERE id = ? AND sender_id = ?`,
    [messageId, senderId]
  );

  const message = rows[0];
  if (!message) {
    return { status: 'not-found' };
  }

  const now = new Date();
  const expireAt = new Date(message.recall_expires_at);
  if (Number.isNaN(expireAt.getTime()) || now > expireAt) {
    return { status: 'expired' };
  }

  if (mode === 'all') {
    await db.query(
      `UPDATE chat_messages
       SET recalled_for_all_at = NOW()
       WHERE id = ?`,
      [messageId]
    );
    return {
      status: 'done',
      mode,
      senderId: Number(message.sender_id),
      receiverId: Number(message.receiver_id)
    };
  }

  await db.query(
    `UPDATE chat_messages
     SET sender_hidden_at = NOW()
     WHERE id = ?`,
    [messageId]
  );

  return {
    status: 'done',
    mode,
    senderId: Number(message.sender_id),
    receiverId: Number(message.receiver_id)
  };
};

export const reactToMessage = async ({ messageId, userId, reaction }) => {
  const [rows] = await db.query(
    `SELECT id, sender_id, receiver_id, reactions
     FROM chat_messages
     WHERE id = ?
       AND receiver_id = ?` ,
    [messageId, userId, userId]
  );

  const message = rows[0];
  if (!message) {
    return { status: 'not-found' };
  }

  let reactions = {};
  if (message.reactions) {
    try {
      reactions = typeof message.reactions === 'string'
        ? JSON.parse(message.reactions)
        : message.reactions;
    } catch {
      reactions = {};
    }
  }

  const userKey = String(userId);
  const rawUserReactions = reactions[userKey];
  const userReactions = Array.isArray(rawUserReactions)
    ? rawUserReactions
    : rawUserReactions
      ? [rawUserReactions]
      : [];

  if (reaction) {
    const existingIndex = userReactions.indexOf(reaction);
    if (existingIndex >= 0) {
      userReactions.splice(existingIndex, 1);
    } else {
      userReactions.push(reaction);
    }
  } else {
    userReactions.length = 0;
  }

  if (userReactions.length > 0) {
    reactions[userKey] = userReactions;
  } else {
    delete reactions[userKey];
  }

  const serialized = Object.keys(reactions).length ? JSON.stringify(reactions) : null;
  await db.query('UPDATE chat_messages SET reactions = ? WHERE id = ?', [serialized, messageId]);

  return {
    status: 'done',
    messageId: Number(messageId),
    senderId: Number(message.sender_id),
    receiverId: Number(message.receiver_id),
    reactions
  };
};
