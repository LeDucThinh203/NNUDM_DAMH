import * as ratingRepo from '../repositories/ratingRepository.js';
import { created, notFound, ok, serverError } from '../utils/response.js';

export const getAllRatings = async (req, res) => {
  try {
    const ratings = await ratingRepo.getAllRatings();
    return ok(res, ratings);
  } catch (err) {
    return serverError(res, err);
  }
};

export const getRatingById = async (req, res) => {
  try {
    const rating = await ratingRepo.getRatingById(req.params.id);
    if (!rating) return notFound(res, 'danh gia khong ton tai');
    return ok(res, rating);
  } catch (err) {
    return serverError(res, err);
  }
};

export const createRating = async (req, res) => {
  try {
    const id = await ratingRepo.createRating(req.body);
    return created(res, { id });
  } catch (err) {
    return serverError(res, err);
  }
};

export const updateRating = async (req, res) => {
  try {
    const affectedRows = await ratingRepo.updateRating(req.params.id, req.body);
    if (affectedRows === 0) return notFound(res, 'danh gia khong ton tai');
    const updated = await ratingRepo.getRatingById(req.params.id);
    return ok(res, updated);
  } catch (err) {
    return serverError(res, err);
  }
};

export const deleteRating = async (req, res) => {
  try {
    const affectedRows = await ratingRepo.deleteRating(req.params.id);
    if (affectedRows === 0) return notFound(res, 'danh gia khong ton tai');
    return ok(res, { message: 'xoa thanh cong' });
  } catch (err) {
    return serverError(res, err);
  }
};
