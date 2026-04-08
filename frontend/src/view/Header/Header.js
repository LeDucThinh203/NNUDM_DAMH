import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Session from "../../Session/session";
import { getMyCart } from "../../api";

export default function Header({ user: initialUser, handleLogout: onLogout }) {
  const [user, setUser] = useState(initialUser || null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(initialUser || null);
  }, [initialUser]);

  const updateCartCount = async () => {
    if (Session.isLoggedIn()) {
      try {
        const data = await getMyCart();
        setCartCount(Number(data.totalQuantity || 0));
        return;
      } catch (error) {
        console.error("Không thể tải số lượng giỏ hàng:", error);
        setCartCount(0);
        return;
      }
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(totalItems);
  };

  useEffect(() => {
    updateCartCount();

    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        updateCartCount();
      }
    };

    const handleCartUpdated = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart-updated', handleCartUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart-updated', handleCartUpdated);
    };
  }, [user?.id, user?.role]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      Session.logout();
    }
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-blue-700 tracking-wide">
          CoolShop
        </Link>

        {/* Menu */}
        <div className="flex space-x-4 text-gray-700 font-medium items-center relative flex-shrink-0">
          <Link to="/cart" className="relative hover:text-yellow-500 transition">
            🛒 Giỏ hàng
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-1 hover:text-blue-500 transition font-medium"
              >
                <span>Xin chào, {user.username}</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-md py-2 z-50">
                  {user.role === "admin" && (
                    <>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        🛠 Thông tin tài khoản quản trị viên
                      </Link>
                    </>
                  )}

                  {user.role === "user" && (
                    <>
                      <Link
                        to="/user"
                        className="block px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        👤 Thông tin tài khoản người dùng
                      </Link>
                      <Link
                        to="/chat"
                        className="block px-4 py-2 hover:bg-gray-100 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        💬 Chat real-time
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-500 transition">
                Login
              </Link>
              <Link to="/register" className="hover:text-green-500 transition">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
