import * as productSizesRepo from '../repositories/productSizesRepository.js';
import { badRequest, notFound, serverError, success } from '../utils/response.js';

export const getAllProductSizes = async (req, res) => {
  try {
    const productSizes = await productSizesRepo.getAllProductSizes();
    success(res, productSizes);
  } catch (err) {
    serverError(res, err);
  }
};

export const getProductSizeById = async (req, res) => {
  try {
    const productSize = await productSizesRepo.getProductSizeById(req.params.id);
    if (!productSize) return notFound(res, 'Product size không tồn tại');
    success(res, productSize);
  } catch (err) {
    serverError(res, err);
  }
};

export const createProductSize = async (req, res) => {
  try {
    const { product_id, size_id, stock } = req.body;
    if (!product_id || !size_id) {
      return badRequest(res, 'Mã sản phẩm và mã size là bắt buộc');
    }

    const stockValue = stock !== undefined ? Number(stock) : 0;
    if (stockValue < 0) {
      return badRequest(res, 'Số lượng tồn kho không được âm');
    }

    const id = await productSizesRepo.createProductSize({ product_id, size_id, stock: stockValue });
    success(res, { id, message: 'Tạo product size thành công' }, 201);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateProductSize = async (req, res) => {
  try {
    const existing = await productSizesRepo.getProductSizeById(req.params.id);
    if (!existing) return notFound(res, 'Product size không tồn tại');

    const { stock } = req.body;
    if (stock !== undefined) {
      const stockValue = Number(stock);
      if (stockValue < 0) {
        return badRequest(res, 'Số lượng tồn kho không được âm');
      }
    }

    await productSizesRepo.updateProductSize(req.params.id, req.body);
    success(res, { message: 'Cập nhật product size thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const deleteProductSize = async (req, res) => {
  try {
    const existing = await productSizesRepo.getProductSizeById(req.params.id);
    if (!existing) return notFound(res, 'Product size không tồn tại');

    await productSizesRepo.deleteProductSize(req.params.id);
    success(res, { message: 'Xóa product size thành công' });
  } catch (err) {
    serverError(res, err);
  }
};
