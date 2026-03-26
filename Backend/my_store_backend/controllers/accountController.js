import * as accountRepo from '../repositories/accountRepository.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { generateToken } from '../middleware/auth.js';
import { created, fail, notFound, ok, serverError } from '../utils/response.js';

const buildForgotPasswordEmail = ({ username, resetLink }) => {
  const safeName = username || 'bạn';
  return {
    text: `MY STORE | KHÔI PHỤC MẬT KHẨU\n\nXin chào ${safeName},\nBạn đã yêu cầu đặt lại mật khẩu.\nMở link sau để đặt lại mật khẩu (hiệu lực 10 phút):\n${resetLink}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`,
    html: `
      <div style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 12px 30px rgba(17,24,39,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0f172a,#0b5ad7 70%);padding:22px 24px;color:#ffffff;">
                    <div style="font-size:12px;letter-spacing:1px;font-weight:700;text-transform:uppercase;opacity:0.92;">My Store Football</div>
                    <h2 style="margin:6px 0 0 0;font-size:24px;line-height:1.25;">Khôi phục mật khẩu</h2>
                    <p style="margin:8px 0 0 0;font-size:14px;opacity:0.95;">Yêu cầu đặt lại mật khẩu cho tài khoản của bạn</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:26px 24px;color:#111827;">
                    <p style="margin:0 0 12px 0;font-size:15px;line-height:1.65;">Xin chào <strong>${safeName}</strong>,</p>
                    <p style="margin:0 0 16px 0;font-size:15px;line-height:1.72;">Hệ thống vừa nhận yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn nút bên dưới để tiếp tục.</p>
                    <p style="margin:0 0 18px 0;">
                      <a href="${resetLink}" style="display:inline-block;background:#0b5ad7;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;font-size:14px;">Đặt lại mật khẩu</a>
                    </p>
                    <div style="margin:0 0 14px 0;padding:12px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;">
                      <p style="margin:0;font-size:13px;line-height:1.7;color:#1e3a8a;">Lưu ý: Link chỉ có hiệu lực trong <strong>10 phút</strong>.</p>
                    </div>
                    <p style="margin:0 0 8px 0;font-size:13px;line-height:1.7;color:#4b5563;">Nếu nút không bấm được, sao chép link bên dưới:</p>
                    <p style="margin:0 0 16px 0;font-size:12px;line-height:1.7;word-break:break-all;color:#1d4ed8;">${resetLink}</p>
                    <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này để bảo mật tài khoản.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                    <p style="margin:0;font-size:12px;line-height:1.7;color:#6b7280;">Email tự động từ hệ thống My Store Football. Vui lòng không trả lời email này.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `
  };
};

const toPublicUser = (account) => {
  if (!account) return null;
  return {
    id: account.id,
    email: account.email,
    username: account.username,
    role: account.role,
    created_at: account.created_at,
    updated_at: account.updated_at
  };
};

/** ================= Đăng ký tài khoản ================= */
export const register = async (req, res) => {
  const { email, username, password, role } = req.body;

  try {
    const existingByEmail = await accountRepo.getAccountByEmail(email);
    if (existingByEmail) {
      return res.status(400).json({
        message: 'đăng ký thất bại',
        errors: [
          {
            field: 'email',
            code: 'EMAIL_EXISTS',
            message: 'email đã tồn tại'
          }
        ]
      });
    }

    const existingByUsername = await accountRepo.getAccountByUsername(username);
    if (existingByUsername) {
      return res.status(400).json({
        message: 'đăng ký thất bại',
        errors: [
          {
            field: 'username',
            code: 'USERNAME_EXISTS',
            message: 'username đã tồn tại'
          }
        ]
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await accountRepo.createAccount({ email, username, password: hashedPassword, role: role || 'user' });

    const userRole = role || 'user';
    const token = generateToken({ id, email, username, role: userRole });

    return created(res, {
      id, 
      email, 
      username, 
      role: userRole,
      token 
    });
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      let field = 'unknown';
      if (String(err.message || '').includes('email')) field = 'email';
      if (String(err.message || '').includes('username')) field = 'username';

      return res.status(400).json({
        message: 'đăng ký thất bại',
        errors: [
          {
            field,
            code: 'DUPLICATE_VALUE',
            message: `${field} đã tồn tại`
          }
        ]
      });
    }

    return serverError(res, err);
  }
};

/** ================= Đăng nhập ================= */
export const login = async (req, res) => {
  const { email, username, password } = req.body;

  try {
    let account = null;
    if (email) {
      account = await accountRepo.getAccountByEmail(email);
    }
    if (!account && username) {
      account = await accountRepo.getAccountByUsername(username);
    }

    if (!account) {
      return fail(res, 403, 'tài khoản không tồn tại');
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return fail(res, 403, 'thông tin đăng nhập không đúng');
    }

    const token = generateToken({
      id: account.id,
      email: account.email,
      username: account.username,
      role: account.role
    });

    return ok(res, {
      id: account.id,
      username: account.username,
      role: account.role,
      email: account.email,
      token
    });
  } catch (err) {
    return serverError(res, err);
  }
};

/** ================= Lấy profile từ token ================= */
export const me = async (req, res) => {
  try {
    const account = await accountRepo.getAccountById(req.user.id);
    if (!account) {
      return notFound(res, 'tài khoản không tồn tại');
    }

    return ok(res, toPublicUser(account));
  } catch (err) {
    return serverError(res, err);
  }
};

/** ================= Lấy tất cả tài khoản ================= */
export const getAllAccounts = async (req, res) => {
  try {
    const accounts = await accountRepo.getAllAccounts();
    return ok(res, accounts.map(toPublicUser));
  } catch (err) {
    return serverError(res, err);
  }
};

/** ================= Lấy account theo ID ================= */
export const getAccountById = async (req, res) => {
  try {
    const account = await accountRepo.getAccountById(req.params.id);
    if (!account) {
      return notFound(res, 'tài khoản không tồn tại');
    }

    return ok(res, toPublicUser(account));
  } catch (err) {
    return serverError(res, err);
  }
};

/** ================= Cập nhật account ================= */
export const updateAccount = async (req, res) => {
  try {
    await accountRepo.updateAccount(req.params.id, req.body);
    const updated = await accountRepo.getAccountById(req.params.id);
    return ok(res, toPublicUser(updated));
  } catch (err) {
    if (err.message === 'Account không tồn tại') {
      return notFound(res, 'tài khoản không tồn tại');
    }
    return serverError(res, err);
  }
};

/** ================= Xóa account ================= */
export const deleteAccount = async (req, res) => {
  try {
    const affectedRows = await accountRepo.deleteAccount(req.params.id);
    if (affectedRows === 0) {
      return notFound(res, 'tài khoản không tồn tại');
    }
    return ok(res, { message: 'xóa thành công' });
  } catch (err) {
    return serverError(res, err);
  }
};

/** ================= Đổi mật khẩu ================= */
export const changePassword = async (req, res) => {
  try {
    const account = await accountRepo.getAccountByEmail(req.user.email);
    if (!account) {
      return notFound(res, 'tài khoản không tồn tại');
    }

    const matched = await bcrypt.compare(req.body.oldPassword, account.password);
    if (!matched) {
      return fail(res, 400, 'mật khẩu cũ không đúng');
    }

    const newHashedPassword = await bcrypt.hash(req.body.newPassword, 10);
    await accountRepo.updateAccountPassword(account.id, newHashedPassword);

    return ok(res, { message: 'đã đổi mật khẩu' });
  } catch (err) {
    return serverError(res, err);
  }
};

/** ================= Logout ================= */
export const logout = async (req, res) => {
  return ok(res, { message: 'logout' });
};

/** ================= Tạo account bởi admin ================= */
export const createAccount = register;

/** ================= Quên mật khẩu ================= */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const genericMessage = 'nếu email tồn tại, hệ thống đã gửi hướng dẫn khôi phục mật khẩu';

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return fail(res, 400, 'email không được để trống');
  }

  try {
    const account = await accountRepo.getAccountByEmail(email);

    // Không lộ thông tin tồn tại email, giống tinh thần flow cũ
    if (!account) {
      return ok(res, { message: genericMessage });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000);
    await accountRepo.saveResetToken(account.id, token, expiryDate);

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return fail(res, 500, 'hệ thống chưa cấu hình gửi email');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailContent = buildForgotPasswordEmail({
      username: account.username,
      resetLink
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Khôi phục mật khẩu',
      text: mailContent.text,
      html: mailContent.html
    });

    return ok(res, { message: genericMessage });
  } catch (err) {
    return serverError(res, err);
  }
};

/** ================= Đặt lại mật khẩu ================= */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, newPassword } = req.body;
  const finalPassword = newPassword || password;

  if (!finalPassword || typeof finalPassword !== 'string' || finalPassword.trim().length === 0) {
    return fail(res, 400, 'mật khẩu mới không được để trống');
  }

  try {
    const account = await accountRepo.getAccountByResetToken(token);
    if (!account) {
      return fail(res, 404, 'token sai');
    }

    if (new Date(account.reset_token_expiry) <= new Date()) {
      return fail(res, 400, 'token hết hạn');
    }

    const hashed = await bcrypt.hash(finalPassword, 10);
    await accountRepo.updateAccountPassword(account.id, hashed);

    return ok(res, { message: 'đặt lại mật khẩu thành công' });
  } catch (err) {
    return serverError(res, err);
  }
};

