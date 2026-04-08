import * as ratingRepo from '../repositories/ratingRepository.js';
import { badRequest, notFound, serverError, success } from '../utils/response.js';

export const getAllRatings = async (req, res) => {
  try {
    const ratings = await ratingRepo.getAllRatings();
    success(res, ratings);
  } catch (err) {
    serverError(res, err);
  }
};

export const getRatingById = async (req, res) => {
  try {
    const rating = await ratingRepo.getRatingById(req.params.id);
    if (!rating) return notFound(res, 'Đánh giá không tồn tại');
    success(res, rating);
  } catch (err) {
    serverError(res, err);
  }
};

export const createRating = async (req, res) => {
  try {
    const { rating_value, comment, order_detail_id } = req.body;
    if (rating_value === undefined || rating_value === null) {
      return badRequest(res, 'Số sao đánh giá là bắt buộc');
    }
    if (!order_detail_id) {
      return badRequest(res, 'Mã chi tiết đơn hàng là bắt buộc');
    }

    const rating = Number(rating_value);
    if (rating < 1 || rating > 5) {
      return badRequest(res, 'Số sao phải từ 1 đến 5');
    }

    const id = await ratingRepo.createRating({ rating_value: rating, comment, order_detail_id });
    success(res, { id, message: 'Tạo đánh giá thành công' }, 201);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateRating = async (req, res) => {
  try {
    const existing = await ratingRepo.getRatingById(req.params.id);
    if (!existing) return notFound(res, 'Đánh giá không tồn tại');

    const { rating_value } = req.body;
    if (rating_value !== undefined) {
      const rating = Number(rating_value);
      if (rating < 1 || rating > 5) {
        return badRequest(res, 'Số sao phải từ 1 đến 5');
      }
    }

    await ratingRepo.updateRating(req.params.id, req.body);
    success(res, { message: 'Cập nhật đánh giá thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const deleteRating = async (req, res) => {
  try {
    const existing = await ratingRepo.getRatingById(req.params.id);
    if (!existing) return notFound(res, 'Đánh giá không tồn tại');

    await ratingRepo.deleteRating(req.params.id);
    success(res, { message: 'Xóa đánh giá thành công' });
  } catch (err) {
    serverError(res, err);
  }
};
