import multer from 'multer';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadRoot = join(__dirname, '..', 'uploads');
const chatUploadDir = join(uploadRoot, 'chat');

mkdirSync(chatUploadDir, { recursive: true });

const looksLikeMojibake = (value) => /Ã.|á»|Ä.|Â.|Ð|Ñ|Æ/.test(value);

const repairOriginalFileName = (name) => {
	if (typeof name !== 'string') return 'file';

	let normalized = name.trim();
	if (!normalized) return 'file';

	if (looksLikeMojibake(normalized)) {
		try {
			normalized = Buffer.from(normalized, 'latin1').toString('utf8');
		} catch {
			// Nếu decode thất bại thì giữ nguyên chuỗi hiện tại.
		}
	}

	return normalized.normalize('NFC');
};

const toSafeDiskFileName = (name) => {
	const repaired = repairOriginalFileName(name);
	const safeName = repaired
		.replace(/[<>:"/\\|?*\x00-\x1F]+/g, '_')
		.replace(/\s+/g, ' ')
		.trim();

	return safeName || 'file';
};

const storage = multer.diskStorage({
	destination: (_req, _file, callback) => {
		callback(null, chatUploadDir);
	},
	filename: (_req, file, callback) => {
		file.originalname = repairOriginalFileName(file.originalname);
		const safeName = toSafeDiskFileName(file.originalname);
		const uniquePrefix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		callback(null, `${uniquePrefix}-${safeName}`);
	}
});

const fileFilter = (_req, file, callback) => {
	if (!file?.originalname) {
		callback(new Error('File không hợp lệ'), false);
		return;
	}

	file.originalname = repairOriginalFileName(file.originalname);

	callback(null, true);
};

export const uploadChatFile = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 25 * 1024 * 1024
	}
});

export const getChatUploadDir = () => chatUploadDir;
