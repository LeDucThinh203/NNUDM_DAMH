import * as productSizesRepo from '../repositories/productSizesRepository.js';
import { created, notFound, ok, serverError } from '../utils/response.js';

export const getAllProductSizes = async (req, res) => {
  try {
    const productSizes = await productSizesRepo.getAllProductSizes();
    return ok(res, productSizes);
  } catch (err) {
    return serverError(res, err);
  }
};

export const getProductSizeById = async (req, res) => {
  try {
    const productSize = await productSizesRepo.getProductSizeById(req.params.id);
    if (!productSize) return notFound(res, 'product_size khong ton tai');
    return ok(res, productSize);
  } catch (err) {
    return serverError(res, err);
  }
};

export const createProductSize = async (req, res) => {
  try {
    const id = await productSizesRepo.createProductSize(req.body);
    return created(res, { id });
  } catch (err) {
    return serverError(res, err);
  }
};

export const updateProductSize = async (req, res) => {
  try {
    const affectedRows = await productSizesRepo.updateProductSize(req.params.id, req.body);
    if (affectedRows === 0) return notFound(res, 'product_size khong ton tai');
    const updated = await productSizesRepo.getProductSizeById(req.params.id);
    return ok(res, updated);
  } catch (err) {
    return serverError(res, err);
  }
};

export const deleteProductSize = async (req, res) => {
  try {
    const affectedRows = await productSizesRepo.deleteProductSize(req.params.id);
    if (affectedRows === 0) return notFound(res, 'product_size khong ton tai');
    return ok(res, { message: 'xoa thanh cong' });
  } catch (err) {
    return serverError(res, err);
  }
};
