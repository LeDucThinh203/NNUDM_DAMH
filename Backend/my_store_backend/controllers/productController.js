import * as productRepo from '../repositories/productRepository.js';
import { created, notFound, ok, serverError } from '../utils/response.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await productRepo.getAllProducts();
    return ok(res, products);
  } catch (err) {
    return serverError(res, err);
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productRepo.getProductById(req.params.id);
    if (!product) return notFound(res, 'san pham khong ton tai');
    return ok(res, product);
  } catch (err) {
    return serverError(res, err);
  }
};

export const createProduct = async (req, res) => {
  try {
    const id = await productRepo.createProduct(req.body);
    return created(res, { id });
  } catch (err) {
    return serverError(res, err);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const affectedRows = await productRepo.updateProduct(req.params.id, req.body);
    if (affectedRows === 0) return notFound(res, 'san pham khong ton tai');
    const product = await productRepo.getProductById(req.params.id);
    return ok(res, product);
  } catch (err) {
    return serverError(res, err);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const affectedRows = await productRepo.deleteProduct(req.params.id);
    if (affectedRows === 0) return notFound(res, 'san pham khong ton tai');
    return ok(res, { message: 'xoa thanh cong' });
  } catch (err) {
    return serverError(res, err);
  }
};
