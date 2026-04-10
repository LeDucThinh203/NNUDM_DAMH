import * as cartRepo from '../repositories/cartRepository.js';
import { badRequest, serverError, success } from '../utils/response.js';

export const getMyCart = async (req, res) => {
  try {
    const cart = await cartRepo.getCartByAccountId(req.user.id);
    success(res, cart);
  } catch (err) {
    serverError(res, err);
  }
};

export const syncMyCart = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const cart = await cartRepo.syncCartItems(req.user.id, items);
    success(res, cart);
  } catch (err) {
    serverError(res, err);
  }
};

export const addItem = async (req, res) => {
  try {
    const { product_size_id, quantity } = req.body;
    if (!product_size_id) {
      return badRequest(res, 'Mã product size là bắt buộc');
    }
    if (quantity === undefined || quantity === null) {
      return badRequest(res, 'Số lượng là bắt buộc');
    }

    const qty = Number(quantity);
    if (qty < 1) {
      return badRequest(res, 'Số lượng phải lớn hơn 0');
    }

    const cart = await cartRepo.addCartItem(req.user.id, { product_size_id, quantity: qty });
    success(res, cart);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity !== undefined) {
      const qty = Number(quantity);
      if (qty < 0) {
        return badRequest(res, 'Số lượng không được âm');
      }
    }

    const cart = await cartRepo.updateCartItem(req.user.id, req.body);
    success(res, cart);
  } catch (err) {
    serverError(res, err);
  }
};

export const removeItem = async (req, res) => {
  try {
    const cart = await cartRepo.removeCartItem(req.user.id, req.body);
    success(res, cart);
  } catch (err) {
    serverError(res, err);
  }
};

export const clearMyCart = async (req, res) => {
  try {
    const cart = await cartRepo.clearCart(req.user.id);
    success(res, cart);
  } catch (err) {
    serverError(res, err);
  }
};
