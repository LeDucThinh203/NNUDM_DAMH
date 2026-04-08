import * as categoryRepo from '../repositories/categoryRepository.js';
import { badRequest, notFound, serverError, success } from '../utils/response.js';

export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryRepo.getAllCategories();
    success(res, categories);
  } catch (err) {
    serverError(res, err);
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await categoryRepo.getCategoryById(req.params.id);
    if (!category) return notFound(res, 'Danh mục không tồn tại');
    success(res, category);
  } catch (err) {
    serverError(res, err);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return badRequest(res, 'Tên danh mục là bắt buộc');
    }

    const { description } = req.body;
    const id = await categoryRepo.createCategory({ name: name.trim(), description });
    success(res, { id, message: 'Tạo danh mục thành công' }, 201);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
      return badRequest(res, 'Tên danh mục là bắt buộc');
    }

    const existing = await categoryRepo.getCategoryById(req.params.id);
    if (!existing) return notFound(res, 'Danh mục không tồn tại');

    await categoryRepo.updateCategory(req.params.id, { name: name.trim(), description });
    success(res, { message: 'Cập nhật danh mục thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const existing = await categoryRepo.getCategoryById(req.params.id);
    if (!existing) return notFound(res, 'Danh mục không tồn tại');

    await categoryRepo.deleteCategory(req.params.id);
    success(res, { message: 'Xóa danh mục thành công' });
  } catch (err) {
    serverError(res, err);
  }
};
