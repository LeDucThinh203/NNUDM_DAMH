import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Session from "../../Session/session";
import { getAllProductSizes, getAllSizes, getMyCart, updateCartItem, removeCartItem, syncGuestCart } from "../../api";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [sizes, setSizes] = useState([]);
  const [productSizes, setProductSizes] = useState([]);
  const [syncError, setSyncError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  // Thử sync lại giỏ hàng từ localStorage
  const retrySyncCart = async () => {
    setIsSyncing(true);
    try {
      const guestCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (guestCart.length === 0) {
        setSyncError(null);
        return;
      }

      console.log("🔄 Retrying cart sync...", guestCart);
      const syncResult = await syncGuestCart(guestCart);
      console.log("✅ Cart retry sync successful:", syncResult);
      
      // Sync thành công, xóa localStorage và error
      localStorage.removeItem("cart");
      localStorage.removeItem("cart-sync-error");
      setSyncError(null);
      
      // Reload giỏ hàng từ DB
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      console.error("❌ Cart retry sync failed:", err);
      setSyncError(err.message || "Không thể đồng bộ giỏ hàng. Vui lòng thử lại.");
    } finally {
      setIsSyncing(false);
    }
  };

  const loadCart = async () => {
    // Kiểm tra xem user vừa đăng nhập và có sync error không
    const cartSyncError = localStorage.getItem("cart-sync-error");
    
    if (Session.isLoggedIn()) {
      try {
        const data = await getMyCart();
        setCart(data.items || []);
        
        // Nếu DB rỗng và có localStorage + sync error, cho biết user
        if ((data.items || []).length === 0 && cartSyncError) {
          const errorData = JSON.parse(cartSyncError);
          setSyncError(`⚠️ Không thể đồng bộ ${errorData.itemCount} sản phẩm từ giỏ hàng trước đó. Nhấp "Thử lại" để đồng bộ.`);
        } else {
          setSyncError(null);
        }
        return;
      } catch (err) {
        console.error("Error loading cart from DB:", err);
        setCart([]);
        setSyncError("Không thể tải giỏ hàng. Vui lòng làm mới trang.");
        return;
      }
    }

    // Nếu chưa đăng nhập, tải từ localStorage
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
    setSyncError(null);
  };

  useEffect(() => {
    loadCart().catch((e) => {
      console.error("Không thể tải giỏ hàng:", e);
      setCart([]);
    });

    (async () => {
      try {
        const [sizesData, psData] = await Promise.all([
          getAllSizes(),
          getAllProductSizes()
        ]);
        setSizes(sizesData);
        setProductSizes(psData);
      } catch (e) {
        console.error("Không thể tải tồn kho:", e);
      }
    })();
    const handleCartUpdated = () => {
      loadCart().catch((e) => {
        console.error("Không thể tải lại giỏ hàng:", e);
      });
    };

    window.addEventListener("cart-updated", handleCartUpdated);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated);
    };
  }, []);

  const handleRemove = async (id, size = "") => {
    try {
      if (Session.isLoggedIn()) {
        await removeCartItem({ product_id: id, size });
        window.dispatchEvent(new Event("cart-updated"));
        return;
      }

      const newCart = cart.filter((item) => 
        !(item.id === id && item.size === size)
      );
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Không thể xóa sản phẩm khỏi giỏ:", error);
      alert(error.message || "Không thể xóa sản phẩm khỏi giỏ hàng");
    }
  };

  const handleQuantityChange = async (id, size, delta) => {
    try {
      const item = cart.find((cartItem) => cartItem.id === id && cartItem.size === size);
      if (!item) return;

      const stock = getStockForItem(item);
      const newQuantity = item.quantity + delta;
      const finalQuantity = Math.max(1, Math.min(newQuantity, stock));

      if (Session.isLoggedIn()) {
        await updateCartItem({ product_id: id, size, quantity: finalQuantity });
        window.dispatchEvent(new Event("cart-updated"));
        return;
      }

      const newCart = cart.map((cartItem) => {
        if (cartItem.id === id && cartItem.size === size) {
          return { ...cartItem, quantity: finalQuantity };
        }
        return cartItem;
      });
      setCart(newCart);
      localStorage.setItem("cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Không thể cập nhật số lượng:", error);
      alert(error.message || "Không thể cập nhật số lượng giỏ hàng");
    }
  };

  const getStockForItem = (item) => {
    const matched = productSizes.find(ps => ps.product_id === item.id && (sizes.find(s => s.id === ps.size_id)?.size === (item.size || '')));
    return Number(matched?.stock ?? 0);
  };

  const isOutOfStock = (item) => getStockForItem(item) <= 0;

  const purchasableItems = cart.filter(i => !isOutOfStock(i));

  const handleCheckout = () => {
    if (purchasableItems.length === 0) {
      alert("Giỏ hàng chỉ toàn sản phẩm hết hàng. Vui lòng xóa hoặc chọn sản phẩm khác.");
      return;
    }
    localStorage.setItem("checkout_items", JSON.stringify(purchasableItems));
    navigate("/checkout");
  };

  const totalPrice = purchasableItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const visibleCart = cart.slice(0, visibleCount);

  const handleLoadMore = () => setVisibleCount((prev) => prev + 10);

  // Nhóm sản phẩm theo id và size để hiển thị
  const groupedCart = visibleCart.reduce((acc, item) => {
    const key = `${item.id}-${item.size || 'no-size'}`;
    if (!acc[key]) {
      acc[key] = { ...item };
    } else {
      acc[key].quantity += item.quantity;
    }
    return acc;
  }, {});

  const groupedCartArray = Object.values(groupedCart);

  if (cart.length === 0)
    return (
      <div className="max-w-5xl mx-auto p-8 text-center">
        <div className="mt-20 text-gray-500">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-xl mb-4">Giỏ hàng trống.</p>
          
          {/* Hiển thị lỗi sync nếu có */}
          {syncError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-yellow-800 font-medium mb-3">{syncError}</p>
              <button
                onClick={retrySyncCart}
                disabled={isSyncing}
                className={`px-4 py-2 rounded font-medium transition ${
                  isSyncing
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {isSyncing ? '⏳ Đang đồng bộ...' : '🔄 Thử lại đồng bộ'}
              </button>
            </div>
          )}
          
          <Link to="/" className="text-blue-600 hover:underline">Quay lại mua sắm</Link>
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Giỏ hàng của bạn</h1>
      
      {/* Hiển thị lỗi sync cart nếu có */}
      {syncError && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="text-yellow-800 font-medium">{syncError}</p>
              <button
                onClick={retrySyncCart}
                disabled={isSyncing}
                className={`mt-2 px-4 py-2 rounded font-medium transition ${
                  isSyncing
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {isSyncing ? '⏳ Đang đồng bộ...' : '🔄 Thử lại'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {groupedCartArray.map((item) => {
          const out = isOutOfStock(item);
          return (
          <div
            key={`${item.id}-${item.size || 'no-size'}`}
            className={`flex flex-col sm:flex-row items-center gap-4 bg-white p-6 rounded-lg shadow-md border border-gray-200 ${out ? 'opacity-60' : ''}`}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-lg"
            />
            
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-lg text-gray-900 mb-2">
                {item.name}
              </h2>
              
              {/* Hiển thị size giống như trong ảnh */}
              {item.size && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Size: </span>
                  <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded border">
                    {item.size}
                  </span>
                  {out && (
                    <span className="ml-2 text-xs font-semibold text-red-600">Hết hàng</span>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Đơn giá:</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${out ? 'text-gray-500' : 'text-red-600'}`}>
                      {Number(item.price).toLocaleString()} ₫
                    </span>
                    {item.original_price && item.original_price !== item.price && (
                      <>
                        <span className="text-sm text-gray-400 line-through">
                          {Number(item.original_price).toLocaleString()} ₫
                        </span>
                        {item.discount_percent > 0 && (
                          <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                            -{item.discount_percent}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                  <div className={`flex items-center gap-2 border border-gray-300 rounded-lg ${out ? 'opacity-50' : ''}`}>
                    <button
                      onClick={() => !out && handleQuantityChange(item.id, item.size, -1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition rounded-l"
                      disabled={out}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 min-w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => !out && handleQuantityChange(item.id, item.size, 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition rounded-r"
                      disabled={out}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 min-w-[120px]">
              <div className="text-right">
                <span className="text-sm font-medium text-gray-700">Tổng:</span>
                <p className={`text-lg font-bold ${out ? 'text-gray-500' : 'text-red-600'}`}>
                  {((out ? 0 : item.price * item.quantity)).toLocaleString()} ₫
                </p>
              </div>
              
              <button
                onClick={() => handleRemove(item.id, item.size)}
                className="text-red-600 font-medium hover:text-red-800 transition flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa
              </button>
            </div>
          </div>
        );
        })}
      </div>

      {visibleCount < cart.length && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
          >
            Xem thêm sản phẩm ▼
          </button>
        </div>
      )}

      {/* Tổng tiền */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-semibold text-gray-900">Tổng tiền:</span>
          <span className="text-2xl font-bold text-red-600">
            {Number(totalPrice).toLocaleString()} ₫
          </span>
        </div>
        
        <div className="flex justify-between flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
          <Link
            to="/"
            className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition font-medium text-center"
          >
            ← Tiếp tục mua sắm
          </Link>
          <button
            onClick={handleCheckout}
            className={`px-8 py-3 rounded-lg transition font-medium text-center ${purchasableItems.length === 0 ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
            disabled={purchasableItems.length === 0}
          >
            Thanh toán sản phẩm đã chọn →
          </button>
        </div>
        {cart.length > 0 && purchasableItems.length < cart.length && (
          <p className="mt-3 text-sm text-gray-500">Một số sản phẩm đã hết hàng và sẽ không được thanh toán.</p>
        )}
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        © 2025 Quản lý sản phẩm. All rights reserved.
      </div>
    </div>
  );
}