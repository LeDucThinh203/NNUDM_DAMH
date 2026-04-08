import * as sizeRepo from '../repositories/sizeRepository.js';
import { badRequest, notFound, serverError, success } from '../utils/response.js';

export const getAllSizes = async (req, res) => {
  try {
    const sizes = await sizeRepo.getAllSizes();
    success(res, sizes);
  } catch (err) {
    serverError(res, err);
  }
};

export const getSizeById = async (req, res) => {
  try {
    const size = await sizeRepo.getSizeById(req.params.id);
    if (!size) return notFound(res, 'Size không tồn tại');
    success(res, size);
  } catch (err) {
    serverError(res, err);
  }
};

export const createSize = async (req, res) => {
  try {
    const { size } = req.body;
    if (!size || String(size).trim() === '') {
      return badRequest(res, 'Tên size là bắt buộc');
    }

    const id = await sizeRepo.createSize({ size: String(size).trim() });
    success(res, { id, message: 'Tạo size thành công' }, 201);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateSize = async (req, res) => {
  try {
    const { size } = req.body;
    if (!size || String(size).trim() === '') {
      return badRequest(res, 'Tên size là bắt buộc');
    }

    const existing = await sizeRepo.getSizeById(req.params.id);
    if (!existing) return notFound(res, 'Size không tồn tại');

    await sizeRepo.updateSize(req.params.id, { size: String(size).trim() });
    success(res, { message: 'Cập nhật size thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const deleteSize = async (req, res) => {
  try {
    const existing = await sizeRepo.getSizeById(req.params.id);
    if (!existing) return notFound(res, 'Size không tồn tại');

    await sizeRepo.deleteSize(req.params.id);
    success(res, { message: 'Xóa size thành công' });
  } catch (err) {
    serverError(res, err);
  }
};
