import * as orderDetailsRepo from '../repositories/orderDetailsRepository.js';
import { created, notFound, ok, serverError } from '../utils/response.js';

export const getAllOrderDetails = async (req, res) => {
  try {
    const orderDetails = await orderDetailsRepo.getAllOrderDetails();
    return ok(res, orderDetails);
  } catch (err) {
    return serverError(res, err);
  }
};

export const getOrderDetailById = async (req, res) => {
  try {
    const orderDetail = await orderDetailsRepo.getOrderDetailById(req.params.id);
    if (!orderDetail) return notFound(res, 'chi tiet don hang khong ton tai');
    return ok(res, orderDetail);
  } catch (err) {
    return serverError(res, err);
  }
};

export const createOrderDetail = async (req, res) => {
  try {
    const id = await orderDetailsRepo.createOrderDetail(req.body);
    return created(res, { id });
  } catch (err) {
    return serverError(res, err);
  }
};

export const updateOrderDetail = async (req, res) => {
  try {
    const affectedRows = await orderDetailsRepo.updateOrderDetail(req.params.id, req.body);
    if (affectedRows === 0) return notFound(res, 'chi tiet don hang khong ton tai');
    const updated = await orderDetailsRepo.getOrderDetailById(req.params.id);
    return ok(res, updated);
  } catch (err) {
    return serverError(res, err);
  }
};

export const deleteOrderDetail = async (req, res) => {
  try {
    const affectedRows = await orderDetailsRepo.deleteOrderDetail(req.params.id);
    if (affectedRows === 0) return notFound(res, 'chi tiet don hang khong ton tai');
    return ok(res, { message: 'xoa thanh cong' });
  } catch (err) {
    return serverError(res, err);
  }
};
