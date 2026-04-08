import * as accountRepo from '../repositories/accountRepository.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { generateToken } from '../middleware/auth.js';
import { badRequest, unauthorized, notFound, serverError, success } from '../utils/response.js';

export const register = async (req, res) => {
  const { email, username, password, role } = req.body;
  if (!email || !username || !password) {
    return badRequest(res, 'Email, username và password là bắt buộc');
  }

  try {
    const existing = await accountRepo.getAccountByEmail(email);
    if (existing) return badRequest(res, 'Email đã tồn tại');

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await accountRepo.createAccount({ email, username, password: hashedPassword, role: role || 'user' });

    const userRole = role || 'user';
    const token = generateToken({ id, email, username, role: userRole });

    success(res, { id, email, username, role: userRole, token }, 201);
  } catch (err) {
    serverError(res, err);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return badRequest(res, 'Email và password là bắt buộc');
  }

  try {
    const account = await accountRepo.getAccountByEmail(email);
    if (!account) return unauthorized(res, 'Email không tồn tại');

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return unauthorized(res, 'Mật khẩu không đúng');

    const token = generateToken({
      id: account.id,
      email: account.email,
      username: account.username,
      role: account.role
    });

    success(res, {
      id: account.id,
      username: account.username,
      role: account.role,
      email: account.email,
      token
    });
  } catch (err) {
    serverError(res, err);
  }
};

export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await accountRepo.getAllAccounts();
    success(res, accounts);
  } catch (err) {
    serverError(res, err);
  }
};

export const getAccountById = async (req, res) => {
  try {
    const account = await accountRepo.getAccountById(req.params.id);
    if (!account) return notFound(res, 'Tài khoản không tồn tại');
    success(res, account);
  } catch (err) {
    serverError(res, err);
  }
};

export const updateAccount = async (req, res) => {
  try {
    const existing = await accountRepo.getAccountById(req.params.id);
    if (!existing) return notFound(res, 'Tài khoản không tồn tại');

    await accountRepo.updateAccount(req.params.id, req.body);
    success(res, { message: 'Cập nhật tài khoản thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const existing = await accountRepo.getAccountById(req.params.id);
    if (!existing) return notFound(res, 'Tài khoản không tồn tại');

    await accountRepo.deleteAccount(req.params.id);
    success(res, { message: 'Xóa tài khoản thành công' });
  } catch (err) {
    serverError(res, err);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return badRequest(res, 'Vui lòng nhập email');

  try {
    const account = await accountRepo.getAccountByEmail(email);
    if (!account) return notFound(res, 'Email không tồn tại');

    const token = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000);

    await accountRepo.saveResetToken(account.id, token, expiryDate);

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; text-align:center; padding:30px; background-color:#f9f9f9;">
        <h2 style="color:#1E40AF;">CoolShop - Khôi phục mật khẩu</h2>
        <p>Xin chào <strong>${account.username}</strong>,</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
        <a href="${resetLink}"
          style="display:inline-block; padding:12px 24px; margin:20px 0;
                 background-color:#1E40AF; color:white; text-decoration:none;
                 font-weight:bold; border-radius:6px;">
          Đặt lại mật khẩu
        </a>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        <small style="color:#6B7280;">Liên kết chỉ có hiệu lực trong 15 phút.</small>
      </div>
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Khôi phục mật khẩu CoolShop',
      html: emailHtml,
    });

    success(res, { message: 'Email khôi phục mật khẩu đã gửi. Vui lòng kiểm tra hộp thư.' });
  } catch (err) {
    serverError(res, err);
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    return badRequest(res, 'Token và mật khẩu mới là bắt buộc');
  }

  try {
    const account = await accountRepo.getAccountByResetToken(token);
    if (!account) return badRequest(res, 'Token không hợp lệ hoặc đã hết hạn');

    if (new Date() > new Date(account.reset_token_expiry)) {
      return badRequest(res, 'Token đã hết hạn');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await accountRepo.updateAccountPassword(account.id, hashed);

    success(res, { message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    serverError(res, err);
  }
};
