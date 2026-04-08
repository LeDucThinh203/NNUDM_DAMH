import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Session from '../../Session/session';
import { getChatUsers, getConversationMessages, uploadChatFile } from '../../api';
import { connectChatSocket, disconnectChatSocket } from '../../socket/chatSocket';

export default function ChatPage() {
  const currentUser = useMemo(() => Session.getUser(), []);
  const token = useMemo(() => Session.getToken(), []);

  const [chatUsers, setChatUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  const [recallMenuMessageId, setRecallMenuMessageId] = useState(null);

  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const users = await getChatUsers();
        setChatUsers(users || []);

        if (users?.length) {
          setSelectedUserId(users[0].id);
        }
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách người dùng');
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUserId) return;

      try {
        setLoadingMessages(true);
        const rows = await getConversationMessages(selectedUserId);
        setMessages(rows || []);
      } catch (err) {
        setError(err.message || 'Không thể tải lịch sử tin nhắn');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedUserId]);

  const applyRecallToLocalMessages = useCallback((payload) => {
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
  }, [currentUser?.id]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = connectChatSocket(token);
    if (!socket) return undefined;

    const handleIncomingMessage = (message) => {
      const inCurrentConversation =
        Number(message.sender_id) === Number(selectedUserId) ||
        Number(message.receiver_id) === Number(selectedUserId);

      const relatedToCurrentUser =
        Number(message.sender_id) === Number(currentUser?.id) ||
        Number(message.receiver_id) === Number(currentUser?.id);

      if (inCurrentConversation && relatedToCurrentUser) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleOnlineUsers = (userIds) => {
      setOnlineUsers(Array.isArray(userIds) ? userIds.map(Number) : []);
    };

    const handleMessageRecalled = (payload) => {
      applyRecallToLocalMessages(payload);
    };

    socket.on('chat:message', handleIncomingMessage);
    socket.on('chat:online-users', handleOnlineUsers);
    socket.on('chat:message-recalled', handleMessageRecalled);

    return () => {
      socket.off('chat:message', handleIncomingMessage);
      socket.off('chat:online-users', handleOnlineUsers);
      socket.off('chat:message-recalled', handleMessageRecalled);
      disconnectChatSocket();
    };
  }, [token, selectedUserId, currentUser?.id, applyRecallToLocalMessages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const selectedUser = chatUsers.find((u) => Number(u.id) === Number(selectedUserId));

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

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setAttachedFile(file);
  };

  const sendMessage = async () => {
    const content = messageInput.trim();
    if (!selectedUserId || (!content && !attachedFile)) return;

    const socket = connectChatSocket(token);
    if (!socket) {
      setError('Không thể kết nối socket');
      return;
    }

    let uploadResult = null;

    try {
      if (attachedFile) {
        setIsUploading(true);
        console.info('[chat-page] uploading file', {
          name: attachedFile.name,
          size: attachedFile.size,
          type: attachedFile.type || 'unknown'
        });
        uploadResult = await uploadChatFile(attachedFile);
      }
    } catch (uploadError) {
      setIsUploading(false);
      console.error('[chat-page] upload failed:', uploadError.message);
      setError(uploadError.message || 'Không thể upload file');
      return;
    }

    setIsUploading(false);

    socket.emit(
      'chat:send',
      {
        toUserId: selectedUserId,
        content,
        filePath: uploadResult?.filePath || null,
        fileName: uploadResult?.fileName || attachedFile?.name || null
      },
      (response) => {
        if (!response?.ok) {
          setError(response?.error || 'Không thể gửi tin nhắn');
          return;
        }
        setMessageInput('');
        setAttachedFile(null);
      }
    );
  };

  const isOnline = (userId) => onlineUsers.includes(Number(userId));

  const handleRecallMessage = (messageId, mode) => {
    const confirmed = window.confirm('Bạn có muốn chắc sẽ thu hồi ?');
    if (!confirmed) {
      return;
    }

    const socket = connectChatSocket(token);
    if (!socket) {
      window.alert('Không thể kết nối socket');
      return;
    }

    socket.emit('chat:recall', { messageId, mode }, (response) => {
      if (!response?.ok) {
        window.alert(response?.error || 'Thu hồi thất bại');
        return;
      }
      applyRecallToLocalMessages(response.data);
      setRecallMenuMessageId(null);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Chat real-time giữa người dùng</h1>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[72vh]">
        <div className="md:col-span-1 bg-white border rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">Người dùng</div>

          <div className="overflow-y-auto flex-1">
            {loadingUsers && <p className="px-4 py-3 text-sm text-gray-500">Đang tải user...</p>}

            {!loadingUsers && !chatUsers.length && (
              <p className="px-4 py-3 text-sm text-gray-500">Chưa có người dùng nào để chat</p>
            )}

            {chatUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                  Number(selectedUserId) === Number(user.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{user.username}</span>
                  <span className={`text-xs ${isOnline(user.id) ? 'text-green-600' : 'text-gray-400'}`}>
                    {isOnline(user.id) ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 bg-white border rounded-lg overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b">
            {selectedUser ? (
              <div>
                <p className="font-semibold text-gray-800">Đang chat với: {selectedUser.username}</p>
                <p className="text-xs text-gray-500">{selectedUser.email}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chọn một người dùng để bắt đầu chat</p>
            )}
          </div>

          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loadingMessages ? (
              <p className="text-sm text-gray-500">Đang tải tin nhắn...</p>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => {
                  const mine = Number(msg.sender_id) === Number(currentUser?.id);
                  const isAllRecalled = Boolean(msg.recalled_for_all_at);
                  const isSenderHidden = mine && Boolean(msg.sender_hidden_at);
                  const displayText = isAllRecalled || isSenderHidden ? 'Tin nhắn đã thu hồi' : msg.message;
                  const isRecalled = isAllRecalled || isSenderHidden;
                  const hasAttachment = Boolean(msg.file_path) && !isRecalled;
                  const attachmentUrl = getAttachmentUrl(msg);
                  const downloadUrl = getDownloadUrl(msg);

                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className="flex items-start gap-2 max-w-[80%]">
                        {mine && !isRecalled && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setRecallMenuMessageId((prev) => (prev === msg.id ? null : msg.id))
                              }
                              className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-100"
                              title="Thu hồi"
                            >
                              Thu hồi
                            </button>

                            {Number(recallMenuMessageId) === Number(msg.id) && (
                              <div className="absolute left-0 mt-1 w-52 rounded border bg-white shadow-lg z-20">
                                <button
                                  onClick={() => handleRecallMessage(msg.id, 'all')}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b"
                                >
                                  Thu hồi cả 2 phía
                                </button>
                                <button
                                  onClick={() => handleRecallMessage(msg.id, 'self')}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                  Thu hồi bên mình
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                            isRecalled
                              ? 'bg-gray-200 text-gray-600 border border-dashed'
                              : mine
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border text-gray-800'
                          }`}
                        >
                          <p>{displayText}</p>
                          {hasAttachment && (
                            <div className="mt-2 space-y-2">
                              {isImageAttachment(msg) ? (
                                <div className="space-y-2">
                                  <a href={attachmentUrl} target="_blank" rel="noreferrer" className="block">
                                    <img
                                      src={attachmentUrl}
                                      alt={getAttachmentName(msg)}
                                      className="max-h-56 rounded border object-contain bg-white"
                                    />
                                  </a>
                                  <a
                                    href={downloadUrl}
                                    download={getAttachmentName(msg)}
                                    className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-medium ${mine ? 'border-blue-300 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                                  >
                                    <span>⬇</span>
                                    <span>Tải xuống</span>
                                  </a>
                                </div>
                              ) : (
                                <a
                                  href={downloadUrl}
                                  download={getAttachmentName(msg)}
                                  className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-xs font-medium ${mine ? 'border-blue-300 bg-blue-500 text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                                >
                                  <span>⬇</span>
                                  <span className="max-w-[220px] truncate">{getAttachmentName(msg)}</span>
                                </a>
                              )}
                            </div>
                          )}
                          <p className={`mt-1 text-[11px] ${isRecalled ? 'text-gray-500' : mine ? 'text-blue-100' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 border-t space-y-2">
            {attachedFile && (
              <div className="flex items-center justify-between rounded border bg-blue-50 px-3 py-2 text-xs text-blue-700">
                <span className="truncate">Đã chọn: {attachedFile.name}</span>
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label className="inline-flex cursor-pointer items-center rounded border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                📎
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
              <button
                onClick={sendMessage}
                disabled={!selectedUserId || (!messageInput.trim() && !attachedFile) || isUploading}
                className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {isUploading ? 'Đang gửi...' : 'Gửi'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
