import * as cartRepo from '../repositories/cartRepository.js';

export const getMyCart = async (req, res) => {
  try {
    const cart = await cartRepo.getCartByAccountId(req.user.id);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const syncMyCart = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    const cart = await cartRepo.syncCartItems(req.user.id, items);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const addItem = async (req, res) => {
  try {
    const cart = await cartRepo.addCartItem(req.user.id, req.body);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const cart = await cartRepo.updateCartItem(req.user.id, req.body);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const removeItem = async (req, res) => {
  try {
    const cart = await cartRepo.removeCartItem(req.user.id, req.body);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const clearMyCart = async (req, res) => {
  try {
    const cart = await cartRepo.clearCart(req.user.id);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
