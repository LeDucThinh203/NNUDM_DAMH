import * as sizeRepo from '../repositories/sizeRepository.js';
import { created, notFound, ok, serverError } from '../utils/response.js';

export const getAllSizes = async (req, res) => {
  try {
    const sizes = await sizeRepo.getAllSizes();
    return ok(res, sizes);
  } catch (err) {
    return serverError(res, err);
  }
};

export const getSizeById = async (req, res) => {
  try {
    const size = await sizeRepo.getSizeById(req.params.id);
    if (!size) return notFound(res, 'size khong ton tai');
    return ok(res, size);
  } catch (err) {
    return serverError(res, err);
  }
};

export const createSize = async (req, res) => {
  try {
    const id = await sizeRepo.createSize(req.body);
    return created(res, { id });
  } catch (err) {
    return serverError(res, err);
  }
};

export const updateSize = async (req, res) => {
  try {
    const affectedRows = await sizeRepo.updateSize(req.params.id, req.body);
    if (affectedRows === 0) return notFound(res, 'size khong ton tai');
    const updated = await sizeRepo.getSizeById(req.params.id);
    return ok(res, updated);
  } catch (err) {
    return serverError(res, err);
  }
};

export const deleteSize = async (req, res) => {
  try {
    const affectedRows = await sizeRepo.deleteSize(req.params.id);
    if (affectedRows === 0) return notFound(res, 'size khong ton tai');
    return ok(res, { message: 'xoa thanh cong' });
  } catch (err) {
    return serverError(res, err);
  }
};
