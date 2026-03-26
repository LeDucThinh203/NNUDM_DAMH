import * as ordersRepo from '../repositories/ordersRepository.js';
import { created, fail, notFound, ok, serverError } from '../utils/response.js';

export const getAllOrders = async (req, res) => {
  try {
    const orders = await ordersRepo.getAllOrders();
    return ok(res, orders);
  } catch (err) {
    return serverError(res, err);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await ordersRepo.getOrderById(req.params.id);
    if (!order) return notFound(res, 'don hang khong ton tai');
    return ok(res, order);
  } catch (err) {
    return serverError(res, err);
  }
};

export const createOrder = async (req, res) => {
  try {
    const id = await ordersRepo.createOrder(req.body);
    return created(res, { id });
  } catch (err) {
    return fail(res, 400, err.message);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const affectedRows = await ordersRepo.updateOrderStatus(req.params.id, req.body);
    if (affectedRows === 0) return notFound(res, 'don hang khong ton tai');
    const updated = await ordersRepo.getOrderById(req.params.id);
    return ok(res, updated);
  } catch (err) {
    return serverError(res, err);
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    // Lấy thông tin đơn hàng
    const order = await ordersRepo.getOrderById(orderId);
    
    if (!order) {
      return notFound(res, 'don hang khong ton tai');
    }

    // Kiểm tra quyền: admin hoặc chủ đơn hàng
    if (!isAdmin && order.account_id !== userId) {
      return fail(res, 403, 'khong co quyen huy don hang nay');
    }

    // User thường chỉ có thể hủy đơn pending
    if (!isAdmin && order.status !== 'pending') {
      return fail(res, 403, 'chi co the huy don hang dang cho xu ly');
    }

    const affectedRows = await ordersRepo.deleteOrder(orderId);
    if (affectedRows === 0) return notFound(res, 'don hang khong ton tai');
    return ok(res, { message: 'xoa thanh cong' });
  } catch (err) {
    return serverError(res, err);
  }
};
