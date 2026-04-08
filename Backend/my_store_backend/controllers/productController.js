import * as productRepo from '../repositories/productRepository.js';
import { badRequest, notFound, serverError, success } from '../utils/response.js';

export const getAllProducts = async (req, res) => {
  try {
    const products = await productRepo.getAllProducts();
    success(res, products);
  } catch (err) {
    serverError(res, err);
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productRepo.getProductById(req.params.id);
    if (!product) return notFound(res, 'Sản phẩm không tồn tại');
    success(res, product);
  } catch (err) {
    serverError(res, err);
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category_id, discount_percent } = req.body;
    if (!name || name.trim() === '') {
      return badRequest(res, 'Tên sản phẩm là bắt buộc');
    }
    if (price === undefined || price === null) {
      return badRequest(res, 'Giá sản phẩm là bắt buộc');
    }

    const p = Number(price);
    if (p < 0) {
      return badRequest(res, 'Giá sản phẩm không được âm');
    }

    const discount = discount_percent !== undefined ? Number(discount_percent) : 0;
    if (discount < 0 || discount > 100) {
      return badRequest(res, 'Giảm giá phải từ 0 đến 100 phần trăm');
    }

    const id = await productRepo.createProduct({
      name: name.trim(),
      description,
      price: p,
      image,
      category_id,
      discount_percent: discount
    });
    success(res, { id, message: 'Tạo sản phẩm thành công' }, 201);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const existing = await productRepo.getProductById(req.params.id);
    if (!existing) return notFound(res, 'Sản phẩm không tồn tại');

    const { name, price, discount_percent } = req.body;
    if (name !== undefined && name.trim() === '') {
      return badRequest(res, 'Tên sản phẩm là bắt buộc');
    }
    if (price !== undefined) {
      const p = Number(price);
      if (p < 0) {
        return badRequest(res, 'Giá sản phẩm không được âm');
      }
    }
    if (discount_percent !== undefined) {
      const discount = Number(discount_percent);
      if (discount < 0 || discount > 100) {
        return badRequest(res, 'Giảm giá phải từ 0 đến 100 phần trăm');
      }
    }

    const updateData = { ...req.body };
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = Number(price);
    if (discount_percent !== undefined) updateData.discount_percent = Number(discount_percent);

    await productRepo.updateProduct(req.params.id, updateData);
    success(res, { message: 'Cập nhật sản phẩm thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const existing = await productRepo.getProductById(req.params.id);
    if (!existing) return notFound(res, 'Sản phẩm không tồn tại');

    await productRepo.deleteProduct(req.params.id);
    success(res, { message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    serverError(res, err);
  }
};
