/**
 * Shared response helpers for all controllers.
 * Đảm bảo định dạng response nhất quán: { error }, { message }, hoặc data.
 */

export const badRequest = (res, message) =>
  res.status(400).json({ error: message });

export const unauthorized = (res, message = 'Không được phép truy cập') =>
  res.status(401).json({ error: message });

export const forbidden = (res, message = 'Không có quyền thực hiện hành động này') =>
  res.status(403).json({ error: message });

export const notFound = (res, message = 'Không tìm thấy tài nguyên') =>
  res.status(404).json({ error: message });

export const serverError = (res, err) => {
  console.error(err);
  res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
};

export const success = (res, data, status = 200) =>
  res.status(status).json(data);
