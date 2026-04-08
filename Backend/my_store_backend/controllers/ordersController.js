import * as ordersRepo from '../repositories/ordersRepository.js';
import { badRequest, forbidden, notFound, serverError, success } from '../utils/response.js';

export const getAllOrders = async (req, res) => {
  try {
    const orders = await ordersRepo.getAllOrders();
    success(res, orders);
  } catch (err) {
    serverError(res, err);
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await ordersRepo.getOrderById(req.params.id);
    if (!order) return notFound(res, 'Đơn hàng không tồn tại');
    success(res, order);
  } catch (err) {
    serverError(res, err);
  }
};

export const createOrder = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name || name.trim() === '') {
      return badRequest(res, 'Tên người nhận là bắt buộc');
    }
    if (!phone || phone.trim() === '') {
      return badRequest(res, 'Số điện thoại người nhận là bắt buộc');
    }
    if (!address || address.trim() === '') {
      return badRequest(res, 'Địa chỉ người nhận là bắt buộc');
    }

    const id = await ordersRepo.createOrder({
      ...req.body,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim()
    });
    success(res, { id, message: 'Tạo đơn hàng thành công' }, 201);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const existing = await ordersRepo.getOrderById(req.params.id);
    if (!existing) return notFound(res, 'Đơn hàng không tồn tại');

    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return badRequest(res, `Trạng thái không hợp lệ. Chỉ chấp nhận: ${validStatuses.join(', ')}`);
    }

    await ordersRepo.updateOrderStatus(req.params.id, req.body);
    success(res, { message: 'Cập nhật trạng thái đơn hàng thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';

    const order = await ordersRepo.getOrderById(orderId);
    if (!order) {
      return notFound(res, 'Đơn hàng không tồn tại');
    }

    if (!isAdmin && order.account_id !== userId) {
      return forbidden(res, 'Không có quyền hủy đơn hàng này');
    }

    if (!isAdmin && order.status !== 'pending') {
      return forbidden(res, 'Chỉ có thể hủy đơn hàng đang chờ xử lý');
    }

    await ordersRepo.deleteOrder(orderId);
    success(res, { message: 'Xóa đơn hàng thành công' });
  } catch (err) {
    serverError(res, err);
  }
};
