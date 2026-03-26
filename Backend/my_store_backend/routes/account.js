import express from 'express';
import * as accountController from '../controllers/accountController.js';
import { checkLogin, CheckPermission, requireSelfOrAdmin } from '../middleware/auth.js';
import {
	changePasswordValidator,
	loginValidator,
	registerValidator
} from '../utils/validator.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Account
 *     description: API quản lý tài khoản
 */

/**
 * @swagger
 * /account:
 *   get:
 *     summary: Lấy tất cả tài khoản
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách tài khoản
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền truy cập
 */
router.get('/', checkLogin, CheckPermission('admin'), accountController.getAllAccounts);

/**
 * @swagger
 * /account/{id}:
 *   get:
 *     summary: Lấy tài khoản theo ID
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Thông tin tài khoản
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền truy cập
 */
router.get('/me', checkLogin, accountController.me);

/**
 * @swagger
 * /account/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 */
router.post('/register', registerValidator, accountController.register);

/**
 * @swagger
 * /account/login:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về thông tin user
 *       400:
 *         description: Email hoặc mật khẩu không đúng
 */
router.post('/login', loginValidator, accountController.login);

router.post('/change-password', checkLogin, changePasswordValidator, accountController.changePassword);

router.post('/logout', checkLogin, accountController.logout);

/**
 * @swagger
 * /account:
 *   post:
 *     summary: Tạo tài khoản mới (CRUD)
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo tài khoản thành công
 */
router.post('/', checkLogin, CheckPermission('admin'), registerValidator, accountController.createAccount);

router.get('/:id', checkLogin, requireSelfOrAdmin, accountController.getAccountById);

/**
 * @swagger
 * /account/{id}:
 *   put:
 *     summary: Cập nhật tài khoản
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền truy cập
 */
router.put('/:id', checkLogin, requireSelfOrAdmin, accountController.updateAccount);

/**
 * @swagger
 * /account/{id}:
 *   delete:
 *     summary: Xóa tài khoản
 *     tags: [Account]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Xóa thành công
 *       401:
 *         description: Chưa xác thực
 *       403:
 *         description: Không có quyền truy cập
 */
router.delete('/:id', checkLogin, CheckPermission('admin'), accountController.deleteAccount);

/**
 * @swagger
 * /account/forgot-password:
 *   post:
 *     summary: Gửi email quên mật khẩu
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email đặt lại mật khẩu đã được gửi
 *       400:
 *         description: Thiếu email
 *       404:
 *         description: Email không tồn tại
 */
router.post('/forgot-password', accountController.forgotPassword);

/**
 * @swagger
 * /account/reset-password/{token}:
 *   post:
 *     summary: Đặt lại mật khẩu bằng token
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đặt lại mật khẩu thành công
 *       400:
 *         description: Token không hợp lệ hoặc hết hạn
 */
router.post('/reset-password/:token', accountController.resetPassword);

export default router;
