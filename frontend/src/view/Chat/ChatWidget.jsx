import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getChatUsers, getConversationMessages } from '../../api';
import { connectChatSocket } from '../../socket/chatSocket';

export default function ChatWidget() {
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  }, []);
  const token = useMemo(() => localStorage.getItem('token') || '', []);

  const [isOpen, setIsOpen] = useState(false);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recallMenuMessageId, setRecallMenuMessageId] = useState(null);
  const [reactionMenuMessageId, setReactionMenuMessageId] = useState(null);

  const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const messagesRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !token) return;

    const loadUsers = async () => {
      try {
        const users = await getChatUsers();
        setChatUsers(users || []);
        if (!selectedUserId && users?.length) {
          setSelectedUserId(users[0].id);
        }
      } catch (error) {
        console.error('Load chat users failed:', error.message);
      }
    };

    loadUsers();
  }, [isOpen, token, selectedUserId]);

  useEffect(() => {
    if (!isOpen || !selectedUserId) return;

    const loadMessages = async () => {
      try {
        setLoading(true);
        const rows = await getConversationMessages(selectedUserId, 100);
        setMessages(rows || []);
      } catch (error) {
        console.error('Load conversation failed:', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [isOpen, selectedUserId]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = connectChatSocket(token);
    if (!socket) return undefined;

    const applyRecall = (payload) => {
      const messageId = Number(payload?.messageId);
      const recalledAt = payload?.recalledAt || new Date().toISOString();

      setMessages((prev) =>
        prev.map((item) => {
          if (Number(item.id) !== messageId) return item;

          if (payload?.mode === 'all') {
            return {
              ...item,
              message: 'Tin nhắn đã thu hồi',
              recalled_for_all_at: recalledAt,
              sender_hidden_at: null
            };
          }

          if (Number(item.sender_id) === Number(currentUser?.id)) {
            return {
              ...item,
              message: 'Tin nhắn đã thu hồi',
              sender_hidden_at: recalledAt
            };
          }

          return item;
        })
      );
    };

    const onMessage = (message) => {
      const senderId = Number(message?.sender_id);
      const receiverId = Number(message?.receiver_id);
      const currentId = Number(currentUser?.id);
      const targetId = Number(selectedUserId);

      const isRelevant = [senderId, receiverId].includes(currentId) && [senderId, receiverId].includes(targetId);
      if (isRelevant) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const onRecalled = (payload) => applyRecall(payload);
    const onReacted = (payload) => {
      const messageId = Number(payload?.messageId);
      const reactions = payload?.reactions || {};

      setMessages((prev) =>
        prev.map((item) =>
          Number(item.id) === messageId
            ? { ...item, reactions }
            : item
        )
      );
    };
    const onOnlineUsers = (userIds) => setOnlineUsers(Array.isArray(userIds) ? userIds.map(Number) : []);

    socket.on('chat:message', onMessage);
    socket.on('chat:message-recalled', onRecalled);
    socket.on('chat:message-reacted', onReacted);
    socket.on('chat:online-users', onOnlineUsers);

    return () => {
      socket.off('chat:message', onMessage);
      socket.off('chat:message-recalled', onRecalled);
      socket.off('chat:message-reacted', onReacted);
      socket.off('chat:online-users', onOnlineUsers);
    };
  }, [token, selectedUserId, currentUser?.id]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const sendMessage = () => {
    const content = messageInput.trim();
    if (!content || !selectedUserId || !token) return;

    const socket = connectChatSocket(token);
    if (!socket) return;

    socket.emit('chat:send', { toUserId: selectedUserId, content }, (res) => {
      if (!res?.ok) {
        window.alert(res?.error || 'Không gửi được tin nhắn');
        return;
      }
      setMessageInput('');
    });
  };

  const handleRecallMessage = (messageId, mode) => {
    const confirmed = window.confirm('Bạn có muốn chắc sẽ thu hồi ?');
    if (!confirmed) return;

    const socket = connectChatSocket(token);
    if (!socket) return;

    socket.emit('chat:recall', { messageId, mode }, (res) => {
      if (!res?.ok) {
        window.alert(res?.error || 'Thu hồi thất bại');
        return;
      }

      const payload = res.data;
      const messageIdNum = Number(payload?.messageId);
      const recalledAt = payload?.recalledAt || new Date().toISOString();

      setMessages((prev) =>
        prev.map((item) => {
          if (Number(item.id) !== messageIdNum) return item;

          if (payload?.mode === 'all') {
            return {
              ...item,
              message: 'Tin nhắn đã thu hồi',
              recalled_for_all_at: recalledAt,
              sender_hidden_at: null
            };
          }

          return {
            ...item,
            message: 'Tin nhắn đã thu hồi',
            sender_hidden_at: recalledAt
          };
        })
      );

      setRecallMenuMessageId(null);
    });
  };

  const handleReactMessage = (messageId, reaction) => {
    const socket = connectChatSocket(token);
    if (!socket) return;

    socket.emit('chat:react', { messageId, reaction }, (res) => {
      if (!res?.ok) {
        window.alert(res?.error || 'Không thể thả cảm xúc');
        return;
      }

      const payload = res.data;
      const messageIdNum = Number(payload?.messageId);
      const reactions = payload?.reactions || {};

      setMessages((prev) =>
        prev.map((item) =>
          Number(item.id) === messageIdNum
            ? { ...item, reactions }
            : item
        )
      );

      setReactionMenuMessageId(null);
    });
  };

  if (!currentUser?.id) return null;

  const selectedUser = chatUsers.find((u) => Number(u.id) === Number(selectedUserId));

  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full bg-blue-600 text-white px-5 py-3 shadow-lg hover:bg-blue-700 transition font-semibold"
        >
          Chat
        </button>
      )}

      {isOpen && (
        <div className="w-[360px] h-[500px] bg-white rounded-xl shadow-2xl border overflow-hidden flex flex-col">
          <div className="px-3 py-2 bg-blue-600 text-white flex items-center justify-between">
            <span className="font-semibold">Hỗ trợ chat</span>
            <button onClick={() => setIsOpen(false)} className="text-sm bg-white/20 px-2 py-1 rounded">Đóng</button>
          </div>

          <div className="px-3 py-2 border-b">
            <label className="text-xs text-gray-500 block mb-1">Chọn người chat</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              {!chatUsers.length && <option value="">Không có user</option>}
              {chatUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username} {onlineUsers.includes(Number(u.id)) ? '🟢 (Online)' : '⚫ (Offline)'}
                </option>
              ))}
            </select>
            {selectedUser && <p className="text-[11px] text-gray-500 mt-1 truncate">{selectedUser.email}</p>}
          </div>

          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto px-3 py-2 bg-gray-50"
            onClick={() => {
              setRecallMenuMessageId(null);
              setReactionMenuMessageId(null);
            }}
          >
            {loading ? (
              <p className="text-sm text-gray-500">Đang tải...</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => {
                  const mine = Number(msg.sender_id) === Number(currentUser?.id);
                  const recalled = Boolean(msg.recalled_for_all_at) || (mine && Boolean(msg.sender_hidden_at));
                  const parsedReactions = msg.reactions && typeof msg.reactions === 'string'
                    ? (() => {
                        try { return JSON.parse(msg.reactions); } catch { return {}; }
                      })()
                    : (msg.reactions || {});

                  const normalizedReactionMap = Object.fromEntries(
                    Object.entries(parsedReactions).map(([uid, value]) => [
                      uid,
                      Array.isArray(value) ? value : value ? [value] : []
                    ])
                  );

                  const reactionCountMap = {};
                  Object.values(normalizedReactionMap)
                    .flat()
                    .forEach((icon) => {
                      reactionCountMap[icon] = (reactionCountMap[icon] || 0) + 1;
                    });

                  const reactionEntries = Object.entries(reactionCountMap);
                  const currentUserReactionSet = new Set(normalizedReactionMap[String(currentUser?.id)] || []);
                  const canRecall = mine && !recalled;
                  const canReact = !mine && !recalled;
                  const hasReactions = reactionEntries.length > 0;

                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`relative max-w-[85%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`max-w-[92%] min-w-[120px] text-sm rounded-lg px-2 py-1 ${recalled ? 'bg-gray-200 text-gray-600 border border-dashed' : mine ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
                          <p>{recalled ? 'Tin nhắn đã thu hồi' : msg.message}</p>
                        </div>

                        {hasReactions && (
                          <div className={`mt-1 bg-white border rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-1 text-xs whitespace-nowrap ${mine ? 'self-end' : 'self-start'}`}>
                            {reactionEntries.map(([icon, count]) => (
                              <span key={`${msg.id}-reaction-${icon}`}>
                                {icon}{count > 1 ? ` ${count}` : ''}
                              </span>
                            ))}
                          </div>
                        )}

                        {canRecall && (
                          <div className="mt-1 flex items-center justify-end gap-1 relative self-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecallMenuMessageId((prev) => (prev === msg.id ? null : msg.id));
                                setReactionMenuMessageId(null);
                              }}
                              className="w-6 h-6 rounded-full border bg-white text-gray-600 text-sm leading-5 hover:bg-gray-100 shadow"
                              title="Tùy chọn tin nhắn"
                            >
                              ...
                            </button>

                            {Number(recallMenuMessageId) === Number(msg.id) && (
                              <div className="absolute right-0 bottom-full mb-2 w-44 rounded border bg-white shadow-lg z-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRecallMessage(msg.id, 'all');
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b"
                                >
                                  Thu hồi cả 2 phía
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRecallMessage(msg.id, 'self');
                                  }}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
                                >
                                  Thu hồi bên mình
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {canReact && (
                          <div className="mt-1 flex items-center gap-2 relative self-start">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setReactionMenuMessageId((prev) => (prev === msg.id ? null : msg.id));
                                setRecallMenuMessageId(null);
                              }}
                              className="w-7 h-7 rounded-full border bg-white text-gray-600 text-xs hover:bg-gray-100 shadow"
                              title="Thả cảm xúc"
                            >
                              👍
                            </button>

                            {Number(reactionMenuMessageId) === Number(msg.id) && (
                              <div className="absolute left-0 bottom-full mb-2 rounded-full border bg-white shadow-lg px-2 py-1 z-20 flex items-center gap-1">
                                {REACTIONS.map((icon) => {
                                  const selected = currentUserReactionSet.has(icon);
                                  return (
                                    <button
                                      key={`${msg.id}-${icon}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReactMessage(msg.id, icon);
                                      }}
                                      className={`text-lg hover:scale-110 transition ${selected ? 'opacity-100' : 'opacity-75'}`}
                                    >
                                      {icon}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-2 border-t flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border rounded px-2 py-1 text-sm"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 rounded text-sm hover:bg-blue-700"
              disabled={!selectedUserId || !messageInput.trim()}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
