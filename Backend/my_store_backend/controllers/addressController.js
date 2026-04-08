import * as addressRepo from '../repositories/addressRepository.js';
import { badRequest, notFound, serverError, success } from '../utils/response.js';

export const getAllAddresses = async (req, res) => {
  try {
    const addresses = await addressRepo.getAllAddresses();
    success(res, addresses);
  } catch (err) {
    serverError(res, err);
  }
};

export const getAddressById = async (req, res) => {
  try {
    const address = await addressRepo.getAddressById(req.params.id);
    if (!address) return notFound(res, 'Địa chỉ không tồn tại');
    success(res, address);
  } catch (err) {
    serverError(res, err);
  }
};

export const createAddress = async (req, res) => {
  try {
    const { account_id, name, phone, address_detail } = req.body;
    if (!name || name.trim() === '') {
      return badRequest(res, 'Tên người nhận là bắt buộc');
    }
    if (!address_detail || address_detail.trim() === '') {
      return badRequest(res, 'Địa chỉ chi tiết là bắt buộc');
    }

    const id = await addressRepo.createAddress(req.body);
    success(res, { id, message: 'Tạo địa chỉ thành công' }, 201);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateAddress = async (req, res) => {
  try {
    const existing = await addressRepo.getAddressById(req.params.id);
    if (!existing) return notFound(res, 'Địa chỉ không tồn tại');

    const { name, address_detail } = req.body;
    if (name !== undefined && name.trim() === '') {
      return badRequest(res, 'Tên người nhận là bắt buộc');
    }
    if (address_detail !== undefined && address_detail.trim() === '') {
      return badRequest(res, 'Địa chỉ chi tiết là bắt buộc');
    }

    await addressRepo.updateAddress(req.params.id, req.body);
    success(res, { message: 'Cập nhật địa chỉ thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const existing = await addressRepo.getAddressById(req.params.id);
    if (!existing) return notFound(res, 'Địa chỉ không tồn tại');

    await addressRepo.deleteAddress(req.params.id);
    success(res, { message: 'Xóa địa chỉ thành công' });
  } catch (err) {
    serverError(res, err);
  }
};
