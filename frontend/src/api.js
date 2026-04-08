// ================= Base =================
import Session from './Session/session';

// API Base URL - Tự động lấy từ backend config
let API_BASE_URL = "";
let isConfigLoaded = false;

// Lấy config từ backend để biết URL đúng (localhost hay ngrok)
const fetchBackendConfig = async () => {
  if (isConfigLoaded) return;

  const host = window.location.hostname;
  const isLocalDev = host === 'localhost' || host === '127.0.0.1';

  if (isLocalDev) {
    API_BASE_URL = ''; // Dùng CRA proxy trong local để tránh lệch ngrok/local.
    isConfigLoaded = true;
    console.log('🔧 Local development mode: use relative API paths via proxy');
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3006/api/config`);
    if (response.ok) {
      const config = await response.json();
      API_BASE_URL = config.apiUrl;
      isConfigLoaded = true;
      console.log(`✅ Backend Config Loaded:`, config);
      console.log(`🔗 API URL: ${API_BASE_URL}`);
      console.log(`🌐 Mode: ${config.useNgrok ? 'NGROK' : 'LOCALHOST'}`);
    }
  } catch (error) {
    console.warn('⚠️ Không thể kết nối backend config, sử dụng proxy');
    API_BASE_URL = ""; // Empty = dùng proxy trong package.json
    isConfigLoaded = true;
  }
};

// Tự động gọi khi app khởi động
fetchBackendConfig();

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

const normalizeToken = (rawToken) => {
  if (typeof rawToken !== 'string') return '';

  // Chuẩn hoá token từ localStorage để tránh ký tự lạ làm fetch ném TypeError.
  let token = rawToken.trim();

  if (!token) return '';

  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1);
  }

  if (token.startsWith('{') && token.endsWith('}')) {
    try {
      const parsed = JSON.parse(token);
      if (typeof parsed?.token === 'string') {
        token = parsed.token;
      }
    } catch {
      // Không phải JSON hợp lệ, giữ token hiện tại.
    }
  }

  token = token
    .replace(/^Bearer\s+/i, '')
    .replace(/\s+/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '');

  const jwtMatch = token.match(/[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/);
  return jwtMatch ? jwtMatch[0] : '';
};

const parseUploadResponse = async (res) => {
  const contentType = String(res.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    return await safeJson(res);
  }

  try {
    const text = await res.text();
    return { error: text || `HTTP ${res.status}` };
  } catch {
    return { error: `HTTP ${res.status}` };
  }
};

/**
 * Helper function để tạo headers với JWT token
 */
const getAuthHeaders = () => {
  const headers = {
    "Content-Type": "application/json"
  };
  
  const token = normalizeToken(Session.getToken());
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
};

const getMultipartAuthHeaders = () => {
  const headers = {};

  const token = normalizeToken(Session.getToken());
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const getUploadApiUrl = () => {
  const host = window.location.hostname;
  const isLocalDev = host === 'localhost' || host === '127.0.0.1';

  // Khi chạy local FE (:3000), ưu tiên đi qua proxy để tránh lỗi CORS/ngrok ở browser.
  if (isLocalDev) {
    return '/upload/chat';
  }

  return `${API_BASE_URL}/upload/chat`;
};

const getUploadApiCandidates = () => {
  const host = window.location.hostname;
  const origin = window.location.origin;
  const isLocalDev = host === 'localhost' || host === '127.0.0.1';
  const candidates = [];

  if (isLocalDev) {
    candidates.push(`${origin}/upload/chat`);
    candidates.push('/upload/chat');
    candidates.push('http://localhost:3006/upload/chat');
    candidates.push('http://127.0.0.1:3006/upload/chat');
  }

  const dynamicUrl = getUploadApiUrl();
  if (dynamicUrl) {
    candidates.push(dynamicUrl);
  }

  return [...new Set(candidates)];
};

// ================= Product API =================
const PRODUCT_API_URL = `${API_BASE_URL}/product`;

export const getAllProducts = async () => {
  const res = await fetch(PRODUCT_API_URL);
  if (!res.ok) throw new Error("Lấy sản phẩm thất bại");
  return await safeJson(res);
};

export const getProductById = async (id) => {
  const res = await fetch(`${PRODUCT_API_URL}/${id}`);
  if (!res.ok) throw new Error("Lấy sản phẩm thất bại");
  return await safeJson(res);
};

export const createProduct = async (data) => {
  const res = await fetch(PRODUCT_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await safeJson(res);
    throw new Error(errorData.error || "Tạo sản phẩm thất bại");
  }
  return await safeJson(res);
};

export const updateProduct = async (id, data) => {
  const res = await fetch(`${PRODUCT_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật sản phẩm thất bại");
  return await safeJson(res);
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${PRODUCT_API_URL}/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Xóa sản phẩm thất bại");
  return true;
};

// ================= Category API =================
const CATEGORY_API_URL = `${API_BASE_URL}/category`;

export const getAllCategories = async () => {
  const res = await fetch(CATEGORY_API_URL);
  if (!res.ok) throw new Error("Lấy danh mục thất bại");
  return await safeJson(res);
};

export const getCategoryById = async (id) => {
  const res = await fetch(`${CATEGORY_API_URL}/${id}`);
  if (!res.ok) throw new Error("Lấy danh mục thất bại");
  return await safeJson(res);
};

export const createCategory = async (data) => {
  const res = await fetch(CATEGORY_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Tạo danh mục thất bại");
  return await safeJson(res);
};

export const updateCategory = async (id, data) => {
  const res = await fetch(`${CATEGORY_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật danh mục thất bại");
  return await safeJson(res);
};

export const deleteCategory = async (id) => {
  const res = await fetch(`${CATEGORY_API_URL}/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Xóa danh mục thất bại");
  return true;
};

// ================= Size API =================
const SIZE_API_URL = `${API_BASE_URL}/sizes`;

export const getAllSizes = async () => {
  const res = await fetch(SIZE_API_URL);
  if (!res.ok) throw new Error("Lấy size thất bại");
  return await safeJson(res);
};

export const getSizeById = async (id) => {
  const res = await fetch(`${SIZE_API_URL}/${id}`);
  if (!res.ok) throw new Error("Lấy size thất bại");
  return await safeJson(res);
};

export const createSize = async (data) => {
  const res = await fetch(SIZE_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Tạo size thất bại");
  return await safeJson(res);
};

export const updateSize = async (id, data) => {
  const res = await fetch(`${SIZE_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật size thất bại");
  return await safeJson(res);
};

export const deleteSize = async (id) => {
  const res = await fetch(`${SIZE_API_URL}/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Xóa size thất bại");
  return true;
};

// ================= Account API =================
const ACCOUNT_API_URL = `${API_BASE_URL}/account`;

export const login = async ({ email, password }) => {
  const res = await fetch(`${ACCOUNT_API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || "Email hoặc mật khẩu không đúng");
  return data;
};

export const register = async ({ email, username, password, role = "user" }) => {
  const res = await fetch(`${ACCOUNT_API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password, role }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || "Đăng ký thất bại");
  return data;
};

export const getAllAccounts = async () => {
  const res = await fetch(ACCOUNT_API_URL, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Lấy danh sách tài khoản thất bại");
  return await safeJson(res);
};

export const getAccountById = async (id) => {
  const res = await fetch(`${ACCOUNT_API_URL}/${id}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Lấy thông tin tài khoản thất bại");
  return await safeJson(res);
};

export const updateAccount = async (id, data) => {
  const res = await fetch(`${ACCOUNT_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật tài khoản thất bại");
  return await safeJson(res);
};

export const deleteAccount = async (id) => {
  const res = await fetch(`${ACCOUNT_API_URL}/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Xóa tài khoản thất bại");
  return true;
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${ACCOUNT_API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || "Không thể gửi email khôi phục mật khẩu");
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const res = await fetch(`${ACCOUNT_API_URL}/reset-password/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || "Đặt lại mật khẩu thất bại");
  return data;
};

// ================= Address API =================
const ADDRESS_API_URL = `${API_BASE_URL}/address`;

export const getAllAddresses = async () => {
  const res = await fetch(ADDRESS_API_URL);
  if (!res.ok) throw new Error("Lấy danh sách địa chỉ thất bại");
  return await safeJson(res);
};

export const getAddressById = async (id) => {
  const res = await fetch(`${ADDRESS_API_URL}/${id}`);
  if (!res.ok) throw new Error("Lấy địa chỉ thất bại");
  return await safeJson(res);
};

export const createAddress = async (data) => {
  const res = await fetch(ADDRESS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Tạo địa chỉ thất bại");
  return await safeJson(res);
};

export const updateAddress = async (id, data) => {
  const res = await fetch(`${ADDRESS_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật địa chỉ thất bại");
  return await safeJson(res);
};

export const deleteAddress = async (id) => {
  const res = await fetch(`${ADDRESS_API_URL}/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Xóa địa chỉ thất bại");
  return true;
};


// ================= Cart API =================
const CART_API_URL = `${API_BASE_URL}/cart`;

export const getMyCart = async () => {
  const res = await fetch(`${CART_API_URL}/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Lấy giỏ hàng thất bại");
  return await safeJson(res);
};

export const syncGuestCart = async (items) => {
  const res = await fetch(`${CART_API_URL}/sync`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ items }),
  });
  
  const data = await safeJson(res);
  
  if (!res.ok) {
    const errorMsg = data.error || "Đồng bộ giỏ hàng thất bại";
    throw new Error(errorMsg);
  }
  
  // Kiểm tra xem có partial sync failures không
  if (data._metadata?.failedCount > 0) {
    console.warn(`⚠️ ${data._metadata.failedCount} items could not be synced:`, data._metadata.errors);
  }
  
  return data;
};

export const addCartItem = async ({ product_id, size, quantity = 1 }) => {
  const res = await fetch(`${CART_API_URL}/items`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ product_id, size, quantity }),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data.error || "Thêm vào giỏ hàng thất bại");
  }
  return await safeJson(res);
};

export const updateCartItem = async ({ product_id, size, quantity }) => {
  const res = await fetch(`${CART_API_URL}/items`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ product_id, size, quantity }),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data.error || "Cập nhật giỏ hàng thất bại");
  }
  return await safeJson(res);
};

export const removeCartItem = async ({ product_id, size }) => {
  const res = await fetch(`${CART_API_URL}/items`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({ product_id, size }),
  });
  if (!res.ok) {
    const data = await safeJson(res);
    throw new Error(data.error || "Xóa khỏi giỏ hàng thất bại");
  }
  return await safeJson(res);
};


// ================= ProductSize API =================
const PRODUCT_SIZE_API_URL = `${API_BASE_URL}/product_sizes`;

export const getAllProductSizes = async () => {
  const res = await fetch(PRODUCT_SIZE_API_URL);
  if (!res.ok) throw new Error("Lấy product sizes thất bại");
  return await safeJson(res);
};

export const createProductSize = async (data) => {
  const res = await fetch(PRODUCT_SIZE_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Tạo product size thất bại");
  return await safeJson(res);
};

export const updateProductSize = async (id, data) => {
  const res = await fetch(`${PRODUCT_SIZE_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật product size thất bại");
  return await safeJson(res);
};

export const deleteProductSize = async (id) => {
  const res = await fetch(`${PRODUCT_SIZE_API_URL}/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Xóa product size thất bại");
  return true;
};

// ================= Order API =================
const ORDER_API_URL = `${API_BASE_URL}/orders`;

export const createOrder = async (data) => {
  console.log("📤 createOrder API call with data:", data);
  
  const res = await fetch(ORDER_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  console.log("📥 createOrder response status:", res.status, res.statusText);
  
  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
      console.error("❌ Server error response:", errorData);
    } catch (e) {
      const text = await res.text();
      console.error("❌ Server error text:", text);
      throw new Error(`Tạo đơn hàng thất bại (${res.status}): ${text}`);
    }
    throw new Error(errorData.error || errorData.message || "Tạo đơn hàng thất bại");
  }
  
  const result = await safeJson(res);
  console.log("✅ createOrder success:", result);
  return result;
};

export const getAllOrders = async () => {
  const res = await fetch(ORDER_API_URL);
  if (!res.ok) throw new Error("Lấy danh sách đơn hàng thất bại");
  return await safeJson(res);
};

export const getOrderById = async (id) => {
  const res = await fetch(`${ORDER_API_URL}/${id}`);
  if (!res.ok) throw new Error("Lấy thông tin đơn hàng thất bại");
  return await safeJson(res);
};

export const updateOrderStatus = async (id, data) => {
  const res = await fetch(`${ORDER_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật trạng thái đơn hàng thất bại");
  return await safeJson(res);
};

// Hàm xóa đơn hàng mới - xóa order_details trước rồi mới xóa orders
export const deleteOrder = async (id) => {
  try {
    console.log(`🔄 Bắt đầu xóa đơn hàng ID: ${id}`);
    
    // Bước 1: Lấy thông tin đơn hàng để có danh sách order_details
    console.log(`📥 Lấy thông tin đơn hàng ${id}...`);
    const order = await getOrderById(id);
    
    if (!order) {
      throw new Error("Đơn hàng không tồn tại");
    }
    
    console.log(`📋 Đơn hàng có ${order.order_details?.length || 0} chi tiết`);

    // Bước 2: Xóa tất cả order_details của đơn hàng này
    if (order.order_details && order.order_details.length > 0) {
      console.log(`🗑️ Đang xóa ${order.order_details.length} chi tiết đơn hàng...`);
      
      for (const detail of order.order_details) {
        try {
          // Xóa từng order_detail
          const deleteDetailRes = await fetch(`${ORDER_DETAILS_API_URL}/${detail.order_detail_id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
          });
          
          if (!deleteDetailRes.ok) {
            console.warn(`⚠️ Không thể xóa order_detail ${detail.order_detail_id}`);
          } else {
            console.log(`✅ Đã xóa order_detail ${detail.order_detail_id}`);
          }
        } catch (detailError) {
          console.warn(`⚠️ Lỗi khi xóa order_detail ${detail.order_detail_id}:`, detailError);
        }
      }
    }

    // Bước 3: Xóa đơn hàng chính
    console.log(`🗑️ Đang xóa đơn hàng chính ${id}...`);
    const deleteOrderRes = await fetch(`${ORDER_API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });
    
    console.log(`📊 Response status: ${deleteOrderRes.status} ${deleteOrderRes.statusText}`);
    
    if (!deleteOrderRes.ok) {
      let errorData = {};
      try {
        errorData = await deleteOrderRes.json();
      } catch (jsonError) {
        // Ignore JSON parse error
      }
      
      if (deleteOrderRes.status === 404) {
        throw new Error("Đơn hàng không tồn tại");
      } else if (deleteOrderRes.status === 500) {
        throw new Error("Lỗi server khi xóa đơn hàng");
      } else {
        throw new Error(errorData.error || `Xóa đơn hàng thất bại (${deleteOrderRes.status})`);
      }
    }
    
    console.log('✅ Xóa đơn hàng thành công');
    return true;
    
  } catch (error) {
    console.error('❌ Lỗi trong hàm deleteOrder:', error);
    throw error;
  }
};

// ================= Order Details API =================
const ORDER_DETAILS_API_URL = `${API_BASE_URL}/order_details`;

export const getAllOrderDetails = async () => {
  const res = await fetch(ORDER_DETAILS_API_URL);
  if (!res.ok) throw new Error("Lấy danh sách chi tiết đơn hàng thất bại");
  return await safeJson(res);
};

export const getOrderDetailById = async (id) => {
  const res = await fetch(`${ORDER_DETAILS_API_URL}/${id}`);
  if (!res.ok) throw new Error("Lấy thông tin chi tiết đơn hàng thất bại");
  return await safeJson(res);
};

export const createOrderDetail = async (data) => {
  const res = await fetch(ORDER_DETAILS_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Tạo chi tiết đơn hàng thất bại");
  return await safeJson(res);
};

export const updateOrderDetail = async (id, data) => {
  const res = await fetch(`${ORDER_DETAILS_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật chi tiết đơn hàng thất bại");
  return await safeJson(res);
};

export const deleteOrderDetail = async (id) => {
  const res = await fetch(`${ORDER_DETAILS_API_URL}/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Xóa chi tiết đơn hàng thất bại");
  return true;
};

// ================= Rating API =================
const RATING_API_URL = `${API_BASE_URL}/rating`;

export const getAllRatings = async () => {
  const res = await fetch(RATING_API_URL);
  if (!res.ok) throw new Error("Lấy danh sách đánh giá thất bại");
  return await safeJson(res);
};

export const getRatingById = async (id) => {
  const res = await fetch(`${RATING_API_URL}/${id}`);
  if (!res.ok) throw new Error("Lấy thông tin đánh giá thất bại");
  return await safeJson(res);
};

export const createRating = async (data) => {
  const res = await fetch(RATING_API_URL, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Tạo đánh giá thất bại");
  return await safeJson(res);
};

export const updateRating = async (id, data) => {
  const res = await fetch(`${RATING_API_URL}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Cập nhật đánh giá thất bại");
  return await safeJson(res);
};

export const deleteRating = async (id) => {
  const res = await fetch(`${RATING_API_URL}/${id}`, { 
    method: "DELETE",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Xóa đánh giá thất bại");
  return true;
};


// ================= VNPay API =================
const VNPAY_API_URL = `${API_BASE_URL}/vnpay`;

export const createVNPayPaymentUrl = async (data) => {
  const res = await fetch(`${VNPAY_API_URL}/create_payment_url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Tạo link thanh toán VNPay thất bại");
  return await safeJson(res);
};

export const verifyVNPayReturn = async (queryParams) => {
  const queryString = new URLSearchParams(queryParams).toString();
  const res = await fetch(`${VNPAY_API_URL}/vnpay_return?${queryString}`);
  if (!res.ok) throw new Error("Xác thực thanh toán VNPay thất bại");
  return await safeJson(res);
};

export const updateOrderPaymentStatus = async (orderId, isPaid, paymentInfo) => {
  const res = await fetch(`${VNPAY_API_URL}/update_payment_status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      is_paid: isPaid,
      payment_info: paymentInfo
    }),
  });
  if (!res.ok) throw new Error("Cập nhật trạng thái thanh toán thất bại");
  return await safeJson(res);
};

// ================= Chat API =================
const CHAT_API_URL = `${API_BASE_URL}/chat`;

export const getChatUsers = async () => {
  const res = await fetch(`${CHAT_API_URL}/users`, {
    headers: getAuthHeaders()
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Không thể lấy danh sách user chat');
  return data;
};

export const getConversationMessages = async (userId, limit = 100) => {
  const res = await fetch(`${CHAT_API_URL}/messages/${userId}?limit=${limit}`, {
    headers: getAuthHeaders()
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data.error || 'Không thể lấy lịch sử tin nhắn');
  return data;
};

export const uploadChatFile = async (file) => {
  if (!file) {
    throw new Error('Vui lòng chọn file để upload');
  }

  if (file.size > 25 * 1024 * 1024) {
    throw new Error('File vượt quá 25MB');
  }

  let lastNetworkError = null;
  const attemptedEndpoints = [];
  const token = normalizeToken(Session.getToken());

  if (!token) {
    throw new Error('Token đăng nhập không hợp lệ. Vui lòng đăng nhập lại');
  }

  for (const endpoint of getUploadApiCandidates()) {
    attemptedEndpoints.push(endpoint);
    const formData = new FormData();
    formData.append('file', file);

    console.info(`[chat-upload] try endpoint: ${endpoint}`);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await parseUploadResponse(res);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          console.warn(`[chat-upload] auth error ${res.status} at ${endpoint}`, data);
          throw new Error(data.error || `Lỗi xác thực (${res.status}). Vui lòng đăng nhập lại`);
        }

        if (res.status === 400 || res.status === 413 || res.status === 415) {
          console.warn(`[chat-upload] payload error ${res.status} at ${endpoint}`, data);
          throw new Error(data.error || `File không hợp lệ (${res.status})`);
        }

        console.warn(`[chat-upload] http error ${res.status} at ${endpoint}`, data);
        throw new Error(data.error || 'Không thể upload file chat');
      }

      console.info(`[chat-upload] success at ${endpoint}`);

      return data;
    } catch (error) {
      const isNetworkError = error instanceof TypeError;
      if (!isNetworkError) {
        throw error;
      }

      console.error(`[chat-upload] network error at ${endpoint}:`, error.message);
      lastNetworkError = error;
    }
  }

  const networkMessage = lastNetworkError?.message || 'Không thể kết nối upload service';
  throw new Error(`${networkMessage}. Endpoint đã thử: ${attemptedEndpoints.join(', ')}`);
};

