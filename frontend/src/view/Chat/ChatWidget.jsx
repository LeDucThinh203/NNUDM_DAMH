import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getChatUsers, getConversationMessages, uploadChatFile } from '../../api';
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
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recallMenuMessageId, setRecallMenuMessageId] = useState(null);
  const [reactionMenuMessageId, setReactionMenuMessageId] = useState(null);

  const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const messagesRef = useRef(null);

  const isImageAttachment = (message) => {
    const attachmentName = String(message?.file_name || message?.file_path || '').toLowerCase();
    return /\.(png|jpe?g|gif|webp|bmp|svg|avif)$/.test(attachmentName);
  };

  const repairAttachmentLabel = (value) => {
    const text = String(value || '').trim();
    if (!text) return '';

    const looksBroken = /Ã.|á»|Ä.|Â.|Ð|Ñ|Æ/.test(text);
    if (!looksBroken) return text;

    try {
      return decodeURIComponent(escape(text));
    } catch {
      return text;
    }
  };

  const getAttachmentName = (message) => {
    if (message?.file_name) return repairAttachmentLabel(message.file_name);
    if (message?.file_path) {
      const fileNameFromPath = String(message.file_path).split('/').pop() || 'Tệp đính kèm';
      return repairAttachmentLabel(fileNameFromPath);
    }
    return 'Tệp đính kèm';
  };

  const getAttachmentUrl = (message) => {
    const rawPath = String(message?.file_path || '').trim();
    if (!rawPath) return '';

    const host = window.location.hostname;
    const isLocalDev = host === 'localhost' || host === '127.0.0.1';
    const backendOrigin = `http://${host}:3006`;

    try {
      const parsed = new URL(rawPath);

      if (isLocalDev) {
        return `${backendOrigin}${parsed.pathname}${parsed.search || ''}`;
      }

      return rawPath;
    } catch {
      if (isLocalDev && rawPath.startsWith('/')) {
        return `${backendOrigin}${rawPath}`;
      }
      return rawPath;
    }
  };

  const getDownloadUrl = (message) => {
    const attachmentUrl = getAttachmentUrl(message);
    if (!attachmentUrl) return '';

    const separator = attachmentUrl.includes('?') ? '&' : '?';
    return `${attachmentUrl}${separator}download=1`;
  };

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

  const sendMessage = async () => {
    const content = messageInput.trim();
    if ((!content && !attachedFile) || !selectedUserId || !token) return;

    const socket = connectChatSocket(token);
    if (!socket) return;

    let uploadResult = null;

    try {
      if (attachedFile) {
        setIsUploading(true);
        console.info('[chat-widget] uploading file', {
          name: attachedFile.name,
          size: attachedFile.size,
          type: attachedFile.type || 'unknown'
        });
        uploadResult = await uploadChatFile(attachedFile);
      }
    } catch (error) {
      console.error('[chat-widget] upload failed:', error.message);
      window.alert(error.message || 'Không thể upload file');
      setIsUploading(false);
      return;
    }

    setIsUploading(false);

    socket.emit('chat:send', {
      toUserId: selectedUserId,
      content,
      filePath: uploadResult?.filePath || null,
      fileName: uploadResult?.fileName || attachedFile?.name || null
    }, (res) => {
      if (!res?.ok) {
        window.alert(res?.error || 'Không gửi được tin nhắn');
        return;
      }
      setMessageInput('');
      setAttachedFile(null);
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
                  const hasAttachment = Boolean(msg.file_path) && !recalled;
                  const attachmentUrl = getAttachmentUrl(msg);
                  const downloadUrl = getDownloadUrl(msg);

                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`relative max-w-[85%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`max-w-[92%] min-w-[120px] text-sm rounded-lg px-2 py-1 ${recalled ? 'bg-gray-200 text-gray-600 border border-dashed' : mine ? 'bg-blue-600 text-white' : 'bg-white border text-gray-800'}`}>
                          <p>{recalled ? 'Tin nhắn đã thu hồi' : msg.message}</p>
                          {hasAttachment && (
                            <div className="mt-2 space-y-2">
                              {isImageAttachment(msg) ? (
                                <div className="space-y-1">
                                  <a href={attachmentUrl} target="_blank" rel="noreferrer" className="block">
                                    <img
                                      src={attachmentUrl}
                                      alt={getAttachmentName(msg)}
                                      className="max-h-44 rounded border object-contain bg-white"
                                    />
                                  </a>
                                  <a
                                    href={downloadUrl}
                                    download={getAttachmentName(msg)}
                                    className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-[11px] font-medium ${mine ? 'border-blue-300 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                                  >
                                    <span>⬇</span>
                                    <span>Tải xuống</span>
                                  </a>
                                </div>
                              ) : (
                                <a
                                  href={downloadUrl}
                                  download={getAttachmentName(msg)}
                                  className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-[11px] font-medium ${mine ? 'border-blue-300 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                                >
                                  <span>⬇</span>
                                  <span className="max-w-[180px] truncate">{getAttachmentName(msg)}</span>
                                </a>
                              )}
                            </div>
                          )}
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

          <div className="p-2 border-t space-y-2">
            {attachedFile && (
              <div className="flex items-center justify-between rounded border bg-blue-50 px-2 py-1 text-[11px] text-blue-700">
                <span className="truncate">{attachedFile.name}</span>
                <button type="button" className="font-semibold hover:underline" onClick={() => setAttachedFile(null)}>
                  Xóa
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border rounded px-2 py-1 text-sm"
              />
              <label className="inline-flex cursor-pointer items-center rounded border px-2 py-1 text-sm text-gray-700 hover:bg-gray-50">
                📎
                <input type="file" className="hidden" onChange={(e) => setAttachedFile(e.target.files?.[0] || null)} />
              </label>
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                disabled={!selectedUserId || (!messageInput.trim() && !attachedFile) || isUploading}
              >
                {isUploading ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
