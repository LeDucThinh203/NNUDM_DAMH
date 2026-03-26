import * as categoryRepo from '../repositories/categoryRepository.js';
import { created, notFound, ok, serverError } from '../utils/response.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryRepo.getAllCategories();
    return ok(res, categories);
  } catch (err) {
    return serverError(res, err);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await categoryRepo.getCategoryById(req.params.id);
    if (!category) return notFound(res, 'danh muc khong ton tai');
    return ok(res, category);
  } catch (err) {
    return serverError(res, err);
  }
};

export const createCategory = async (req, res) => {
  try {
    const id = await categoryRepo.createCategory(req.body);
    return created(res, { id });
  } catch (err) {
    return serverError(res, err);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const affectedRows = await categoryRepo.updateCategory(req.params.id, req.body);
    if (affectedRows === 0) return notFound(res, 'danh muc khong ton tai');
    const updated = await categoryRepo.getCategoryById(req.params.id);
    return ok(res, updated);
  } catch (err) {
    return serverError(res, err);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const affectedRows = await categoryRepo.deleteCategory(req.params.id);
    if (affectedRows === 0) return notFound(res, 'danh muc khong ton tai');
    return ok(res, { message: 'xoa thanh cong' });
  } catch (err) {
    return serverError(res, err);
  }
};
