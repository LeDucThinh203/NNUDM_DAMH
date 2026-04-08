import * as chatRepository from '../repositories/chatRepository.js';

const getPublicBaseUrl = (req) => {
	const origin = String(req.get('origin') || '').toLowerCase().replace(/\/$/, '');
	const isLocalOrigin = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');

	if (isLocalOrigin) {
		const localHost = req.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost';
		const localPort = process.env.PORT || 3006;
		return `${req.protocol}://${localHost}:${localPort}`;
	}

	if (process.env.USE_NGROK === 'true' && process.env.NGROK_URL) {
		return process.env.NGROK_URL.replace(/\/$/, '');
	}

	return `${req.protocol}://${req.get('host')}`;
};

export const uploadChatFile = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'Vui lòng chọn file để upload' });
		}

		const senderId = Number(req.user?.id);
		const receiverId = Number(req.body?.receiver_id || req.body?.receiverId);
		const message = String(req.body?.message || req.body?.content || '').trim();
		const baseUrl = getPublicBaseUrl(req);
		const publicPath = `/uploads/chat/${req.file.filename}`;
		const filePath = `${baseUrl}${publicPath}`;

		let savedMessage = null;
		if (senderId && receiverId) {
			const receiver = await chatRepository.getChatUserById(receiverId);
			if (!receiver) {
				return res.status(404).json({ error: 'Người nhận không tồn tại' });
			}

			savedMessage = await chatRepository.createMessage({
				senderId,
				receiverId,
				message,
				filePath,
				fileName: req.file.originalname
			});
		}

		return res.status(201).json({
			message: 'Upload file thành công',
			fileName: req.file.originalname,
			filePath,
			publicPath,
			mimeType: req.file.mimetype,
			size: req.file.size,
			savedToDb: Boolean(savedMessage),
			chatMessage: savedMessage
		});
	} catch (error) {
		return res.status(500).json({ error: error.message || 'Không thể upload file' });
	}
};
