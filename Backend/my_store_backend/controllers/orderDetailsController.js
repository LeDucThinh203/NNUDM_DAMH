import * as orderDetailsRepo from '../repositories/orderDetailsRepository.js';
import { badRequest, notFound, serverError, success } from '../utils/response.js';

export const getAllOrderDetails = async (req, res) => {
  try {
    const orderDetails = await orderDetailsRepo.getAllOrderDetails();
    success(res, orderDetails);
  } catch (err) {
    serverError(res, err);
  }
};

export const getOrderDetailById = async (req, res) => {
  try {
    const orderDetail = await orderDetailsRepo.getOrderDetailById(req.params.id);
    if (!orderDetail) return notFound(res, 'Chi tiết đơn hàng không tồn tại');
    success(res, orderDetail);
  } catch (err) {
    serverError(res, err);
  }
};

export const createOrderDetail = async (req, res) => {
  try {
    const { order_id, product_sizes_id, quantity, price } = req.body;
    if (!order_id || !product_sizes_id) {
      return badRequest(res, 'Mã đơn hàng và mã product size là bắt buộc');
    }
    if (quantity === undefined || quantity === null) {
      return badRequest(res, 'Số lượng là bắt buộc');
    }
    if (price === undefined || price === null) {
      return badRequest(res, 'Giá là bắt buộc');
    }

    const qty = Number(quantity);
    const p = Number(price);
    if (qty < 1) {
      return badRequest(res, 'Số lượng phải lớn hơn 0');
    }
    if (p < 0) {
      return badRequest(res, 'Giá không được âm');
    }

    const id = await orderDetailsRepo.createOrderDetail({ order_id, product_sizes_id, quantity: qty, price: p });
    success(res, { id, message: 'Tạo chi tiết đơn hàng thành công' }, 201);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateOrderDetail = async (req, res) => {
  try {
    const existing = await orderDetailsRepo.getOrderDetailById(req.params.id);
    if (!existing) return notFound(res, 'Chi tiết đơn hàng không tồn tại');

    const { quantity, price } = req.body;
    const updateData = { ...req.body };

    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (qty < 1) {
        return badRequest(res, 'Số lượng phải lớn hơn 0');
      }
      updateData.quantity = qty;
    }
    if (price !== undefined) {
      const p = Number(price);
      if (p < 0) {
        return badRequest(res, 'Giá không được âm');
      }
      updateData.price = p;
    }

    await orderDetailsRepo.updateOrderDetail(req.params.id, updateData);
    success(res, { message: 'Cập nhật chi tiết đơn hàng thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const deleteOrderDetail = async (req, res) => {
  try {
    const existing = await orderDetailsRepo.getOrderDetailById(req.params.id);
    if (!existing) return notFound(res, 'Chi tiết đơn hàng không tồn tại');

    await orderDetailsRepo.deleteOrderDetail(req.params.id);
    success(res, { message: 'Xóa chi tiết đơn hàng thành công' });
  } catch (err) {
    serverError(res, err);
  }
};
