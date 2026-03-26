export const ok = (res, data) => res.status(200).json(data);

export const created = (res, data) => res.status(201).json(data);

export const fail = (res, status, message) => res.status(status).json({ message });

export const unauthorized = (res, message = 'ban chua dang nhap') =>
  fail(res, 403, message);

export const forbidden = (res, message = 'ban khong co quyen') =>
  fail(res, 403, message);

export const notFound = (res, message = 'id not found') =>
  fail(res, 404, message);

export const serverError = (res, error) =>
  fail(res, 500, error?.message || 'internal server error');
