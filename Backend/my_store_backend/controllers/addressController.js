import * as addressRepo from '../repositories/addressRepository.js';
import { created, notFound, ok, serverError } from '../utils/response.js';

export const getAllAddresses = async (req, res) => {
  try {
    const addresses = await addressRepo.getAllAddresses();
    return ok(res, addresses);
  } catch (err) {
    return serverError(res, err);
  }
};

export const getAddressById = async (req, res) => {
  try {
    const address = await addressRepo.getAddressById(req.params.id);
    if (!address) return notFound(res, 'dia chi khong ton tai');
    return ok(res, address);
  } catch (err) {
    return serverError(res, err);
  }
};

export const createAddress = async (req, res) => {
  try {
    const id = await addressRepo.createAddress(req.body);
    return created(res, { id });
  } catch (err) {
    return serverError(res, err);
  }
};

export const updateAddress = async (req, res) => {
  try {
    const affectedRows = await addressRepo.updateAddress(req.params.id, req.body);
    if (affectedRows === 0) return notFound(res, 'dia chi khong ton tai');
    const updated = await addressRepo.getAddressById(req.params.id);
    return ok(res, updated);
  } catch (err) {
    return serverError(res, err);
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const affectedRows = await addressRepo.deleteAddress(req.params.id);
    if (affectedRows === 0) return notFound(res, 'dia chi khong ton tai');
    return ok(res, { message: 'xoa thanh cong' });
  } catch (err) {
    return serverError(res, err);
  }
};
