// src/view/Admin/OrderManager.js
import React, { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus, getAllAccounts, deleteOrder } from "../../api";

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all"); // all, bank, cod
  const [searchTerm, setSearchTerm] = useState("");
  const [updateModal, setUpdateModal] = useState({ show: false, order: null, newStatus: "" });
  const [visibleCountBank, setVisibleCountBank] = useState(5);
  const [visibleCountCOD, setVisibleCountCOD] = useState(5);

  useEffect(() => {
    fetchOrdersAndAccounts();
  }, []);

  const fetchOrdersAndAccounts = async () => {
    try {
      setLoading(true);
      const [allOrders, allAccounts] = await Promise.all([
        getAllOrders(),
        getAllAccounts()
      ]);

      // Sắp xếp đơn hàng mới nhất lên đầu
      const sortedOrders = allOrders.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setOrders(sortedOrders);
      setAccounts(allAccounts);
      
      // Reset bộ lọc về mặc định
      setFilterStatus("all");
      setFilterPayment("all");
    } catch (err) {
      setError("Lỗi khi tải danh sách đơn hàng");
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!updateModal.order || !updateModal.newStatus) {
      alert("Vui lòng chọn trạng thái mới!");
      return;
    }

    try {
      // Nếu chuyển từ pending sang received và là COD, tự động đánh dấu đã thanh toán
      const updateData = { status: updateModal.newStatus };
      if (updateModal.order.status === 'pending' && 
          updateModal.newStatus === 'received' && 
          updateModal.order.payment_method === 'cod') {
        updateData.is_paid = true;
      }

      await updateOrderStatus(updateModal.order.id, updateData);
      alert("Cập nhật trạng thái thành công!");
      
      // Cập nhật local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updateModal.order.id ? { 
            ...order, 
            status: updateModal.newStatus,
            is_paid: updateData.is_paid !== undefined ? updateData.is_paid : order.is_paid
          } : order
        )
      );
      
      // Đóng modal
      setUpdateModal({ show: false, order: null, newStatus: "" });
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái: " + (err.message || "Vui lòng thử lại!"));
      console.error("Lỗi:", err);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.")) {
      return;
    }

    try {
      await deleteOrder(orderId);
      alert("Xóa đơn hàng thành công!");
      fetchOrdersAndAccounts(); // Refresh danh sách
    } catch (err) {
      alert("Lỗi khi xóa đơn hàng: " + (err.message || "Vui lòng thử lại!"));
      console.error("Lỗi:", err);
    }
  };

  const openUpdateModal = (order) => {
    setUpdateModal({
      show: true,
      order: order,
      newStatus: order.status // Mặc định chọn trạng thái hiện tại
    });
  };

  const closeUpdateModal = () => {
    setUpdateModal({ show: false, order: null, newStatus: "" });
  };

  // Kiểm tra trạng thái thanh toán (nếu đã nhận hàng và COD thì coi như đã thanh toán)
  const getPaymentStatus = (order) => {
    // Đã thanh toán qua VNPay (hoặc đã chọn VNPay)
    if (order.payment_method === 'vnpay') {
      return { text: 'Đã TT', color: 'text-green-600' };
    }
    // Đã thanh toán (is_paid = 1) hoặc thanh toán qua bank
    if (order.is_paid || order.payment_method === 'bank') {
      return { text: 'Đã TT', color: 'text-green-600' };
    }
    // COD và đã nhận hàng
    if (order.status === 'received' && order.payment_method === 'cod') {
      return { text: 'Đã TT', color: 'text-green-600' };
    }
    return { text: 'Chưa TT', color: 'text-red-600' };
  };

  // Hàm lấy thông tin ngân hàng từ payment_info
  const getBankCode = (order) => {
    if ((order.payment_method !== 'bank' && order.payment_method !== 'vnpay') || !order.payment_info) {
      return null;
    }
    try {
      const paymentInfo = JSON.parse(order.payment_info);
      return paymentInfo.bankCode || paymentInfo.vnpay_bank_code || null;
    } catch (error) {
      console.error('Error parsing payment_info:', error);
      return null;
    }
  };

  // Lọc đơn hàng theo trạng thái và từ khóa tìm kiếm
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesPayment = filterPayment === "all" || 
      (filterPayment === "bank" && (order.payment_method === 'bank' || order.payment_method === 'vnpay')) ||
      (filterPayment === "cod" && order.payment_method === 'cod');
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone?.includes(searchTerm) ||
      order.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accounts.find(acc => acc.id === order.account_id)?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPayment && matchesSearch;
  });

  // Tách đơn hàng theo phương thức thanh toán
  const bankOrders = filteredOrders.filter(order => order.payment_method === 'bank' || order.payment_method === 'vnpay');
  const codOrders = filteredOrders.filter(order => order.payment_method === 'cod');

  const visibleBankOrders = bankOrders.slice(0, visibleCountBank);
  const visibleCODOrders = codOrders.slice(0, visibleCountCOD);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'received': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'received': return 'Đã nhận hàng';
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getUsername = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.username : 'Không xác định';
  };

  const getTotalItems = (order) => {
    return order.order_details?.reduce((total, detail) => total + detail.quantity, 0) || 0;
  };

  // Thống kê số lượng đơn hàng theo trạng thái
  const getOrderStats = () => {
    const stats = {
      all: orders.length,
      pending: orders.filter(order => order.status === 'pending').length,
      received: orders.filter(order => order.status === 'received').length,
      bank: orders.filter(order => order.payment_method === 'bank' || order.payment_method === 'vnpay').length,
      cod: orders.filter(order => order.payment_method === 'cod').length
    };
    return stats;
  };

  const orderStats = getOrderStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h2>
        <div className="text-sm text-gray-500">
          Tổng số: {filteredOrders.length} đơn hàng
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <button
          onClick={() => {
            if (filterStatus === "all" && filterPayment === "all") {
              // Nếu đang ở trạng thái all, không làm gì
              return;
            }
            setFilterStatus("all");
            setFilterPayment("all");
          }}
          className={`p-4 rounded-lg shadow-lg border-2 transition-all duration-300 transform hover:scale-105 ${
            filterStatus === "all" && filterPayment === "all"
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 border-blue-700 shadow-blue-300 text-white'
              : 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-blue-200'
          }`}
        >
          <div className={`text-2xl font-bold ${filterStatus === "all" && filterPayment === "all" ? 'text-white' : 'text-blue-600'}`}>
            {orderStats.all}
          </div>
          <div className={`text-sm ${filterStatus === "all" && filterPayment === "all" ? 'text-blue-100' : 'text-gray-600'}`}>
            Tổng đơn hàng
          </div>
        </button>
        
        <button
          onClick={() => {
            if (filterStatus === "pending") {
              // Nếu đã chọn pending, bỏ chọn
              setFilterStatus("all");
            } else {
              setFilterStatus("pending");
            }
          }}
          className={`p-4 rounded-lg shadow-lg border-2 transition-all duration-300 transform hover:scale-105 ${
            filterStatus === "pending"
              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-700 shadow-yellow-300 text-white'
              : 'bg-white border-yellow-200 hover:border-yellow-400 hover:shadow-yellow-200'
          }`}
        >
          <div className={`text-2xl font-bold ${filterStatus === "pending" ? 'text-white' : 'text-yellow-600'}`}>
            {orderStats.pending}
          </div>
          <div className={`text-sm ${filterStatus === "pending" ? 'text-yellow-100' : 'text-gray-600'}`}>
            Chờ xác nhận
          </div>
        </button>
        
        <button
          onClick={() => {
            if (filterStatus === "received") {
              // Nếu đã chọn received, bỏ chọn
              setFilterStatus("all");
            } else {
              setFilterStatus("received");
            }
          }}
          className={`p-4 rounded-lg shadow-lg border-2 transition-all duration-300 transform hover:scale-105 ${
            filterStatus === "received"
              ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-700 shadow-green-300 text-white'
              : 'bg-white border-green-200 hover:border-green-400 hover:shadow-green-200'
          }`}
        >
          <div className={`text-2xl font-bold ${filterStatus === "received" ? 'text-white' : 'text-green-600'}`}>
            {orderStats.received}
          </div>
          <div className={`text-sm ${filterStatus === "received" ? 'text-green-100' : 'text-gray-600'}`}>
            Đã nhận hàng
          </div>
        </button>
        
        <button
          onClick={() => {
            if (filterPayment === "bank") {
              // Nếu đã chọn bank, bỏ chọn
              setFilterPayment("all");
            } else {
              setFilterPayment("bank");
            }
          }}
          className={`p-4 rounded-lg shadow-lg border-2 transition-all duration-300 transform hover:scale-105 ${
            filterPayment === "bank"
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-800 shadow-blue-400 text-white'
              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:border-blue-400 hover:shadow-blue-200'
          }`}
        >
          <div className={`text-2xl font-bold ${filterPayment === "bank" ? 'text-white' : 'text-blue-700'}`}>
            {orderStats.bank}
          </div>
          <div className={`text-sm font-medium ${filterPayment === "bank" ? 'text-blue-100' : 'text-blue-600'}`}>
            Bank Transfer
          </div>
        </button>
        
        <button
          onClick={() => {
            if (filterPayment === "cod") {
              // Nếu đã chọn cod, bỏ chọn
              setFilterPayment("all");
            } else {
              setFilterPayment("cod");
            }
          }}
          className={`p-4 rounded-lg shadow-lg border-2 transition-all duration-300 transform hover:scale-105 ${
            filterPayment === "cod"
              ? 'bg-gradient-to-r from-green-600 to-green-700 border-green-800 shadow-green-400 text-white'
              : 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:border-green-400 hover:shadow-green-200'
          }`}
        >
          <div className={`text-2xl font-bold ${filterPayment === "cod" ? 'text-white' : 'text-green-700'}`}>
            {orderStats.cod}
          </div>
          <div className={`text-sm font-medium ${filterPayment === "cod" ? 'text-green-100' : 'text-green-600'}`}>
            COD
          </div>
        </button>
      </div>

      {/* Bộ lọc và tìm kiếm */}
      <div className="bg-white p-4 rounded-lg shadow border">
        {/* Hiển thị bộ lọc đang áp dụng */}
        {(filterStatus !== "all" || filterPayment !== "all" || searchTerm) && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-600">Đang lọc:</span>
            {filterStatus !== "all" && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Trạng thái: {getStatusText(filterStatus)}
                <button
                  onClick={() => setFilterStatus("all")}
                  className="ml-2 hover:text-yellow-900"
                >
                  ×
                </button>
              </span>
            )}
            {filterPayment !== "all" && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                filterPayment === "bank" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
              }`}>
                {filterPayment === "bank" ? "Bank Transfer" : "COD"}
                <button
                  onClick={() => setFilterPayment("all")}
                  className={filterPayment === "bank" ? "ml-2 hover:text-blue-900" : "ml-2 hover:text-green-900"}
                >
                  ×
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Tìm kiếm: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 hover:text-gray-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo ID, tên, SĐT, địa chỉ, username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="received">Đã nhận hàng</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lọc theo thanh toán
            </label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả phương thức</option>
              <option value="bank">Bank Transfer</option>
              <option value="cod">COD (Tiền mặt)</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("all");
                setFilterPayment("all");
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex-1"
            >
              Xóa bộ lọc
            </button>
            <button
              onClick={fetchOrdersAndAccounts}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1"
            >
              Làm mới
            </button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow border">
          <p className="text-gray-500 text-lg">Không tìm thấy đơn hàng nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Cột Bank Transfer */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg shadow border border-blue-200 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-blue-700 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Bank Transfer
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-700">{bankOrders.length}</div>
                  <div className="text-xs text-blue-600">đơn hàng</div>
                </div>
              </div>
            </div>

            {bankOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow border">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p className="text-gray-400">Không có đơn hàng Bank</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {visibleBankOrders.map((order) => {
                    const paymentStatus = getPaymentStatus(order);
                    return (
                      <div key={order.id} className="bg-white rounded-lg shadow border border-blue-100 hover:border-blue-300 transition-all overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                              <div className="text-xs text-gray-500">{formatDateTime(order.created_at)}</div>
                              <div className="text-xs text-blue-600 font-medium mt-1">
                                {order.payment_method === 'vnpay' 
                                  ? (getBankCode(order) ? `VNPay - ${getBankCode(order)}` : 'VNPay') 
                                  : (getBankCode(order) ? `Bank - ${getBankCode(order)}` : 'Bank')}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                              <span className={`text-xs font-medium ${paymentStatus.color}`}>
                                {paymentStatus.text}
                              </span>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-100 pt-3 mb-3">
                            <div className="text-sm font-medium text-gray-900">{order.name}</div>
                            <div className="text-xs text-gray-500">{order.phone}</div>
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{order.address}</div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <div className="text-lg font-bold text-blue-600">
                              {Number(order.total_amount).toLocaleString()} ₫
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openUpdateModal(order)}
                                className={`text-white px-3 py-1 rounded text-xs transition-colors ${
                                  order.status === 'pending' 
                                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                                    : 'bg-green-500 hover:bg-green-600'
                                }`}
                              >
                                Cập nhật
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Nút xem thêm/thu gọn Bank */}
                {bankOrders.length > 5 && (
                  <div className="flex justify-center gap-3">
                    {visibleCountBank < bankOrders.length && (
                      <button
                        onClick={() => setVisibleCountBank(prev => prev + 5)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        ↓ Xem thêm 5
                      </button>
                    )}
                    {visibleCountBank > 5 && (
                      <button
                        onClick={() => setVisibleCountBank(5)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        ↑ Thu gọn
                      </button>
                    )}
                  </div>
                )}
                <p className="text-center text-xs text-gray-500">
                  Hiển thị {visibleBankOrders.length} / {bankOrders.length} đơn
                </p>
              </>
            )}
          </div>

          {/* Cột COD */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg shadow border border-green-200 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-green-700 flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  COD (Tiền mặt)
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-700">{codOrders.length}</div>
                  <div className="text-xs text-green-600">đơn hàng</div>
                </div>
              </div>
            </div>

            {codOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow border">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-gray-400">Không có đơn hàng COD</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {visibleCODOrders.map((order) => {
                    const paymentStatus = getPaymentStatus(order);
                    return (
                      <div key={order.id} className="bg-white rounded-lg shadow border border-green-100 hover:border-green-300 transition-all overflow-hidden">
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                              <div className="text-xs text-gray-500">{formatDateTime(order.created_at)}</div>
                              <div className="text-xs text-green-600 font-medium mt-1">
                                COD - Thanh toán khi nhận hàng
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                              <span className={`text-xs font-medium ${paymentStatus.color}`}>
                                {paymentStatus.text}
                              </span>
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-100 pt-3 mb-3">
                            <div className="text-sm font-medium text-gray-900">{order.name}</div>
                            <div className="text-xs text-gray-500">{order.phone}</div>
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{order.address}</div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <div className="text-lg font-bold text-green-600">
                              {Number(order.total_amount).toLocaleString()} ₫
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openUpdateModal(order)}
                                className={`text-white px-3 py-1 rounded text-xs transition-colors ${
                                  order.status === 'pending' 
                                    ? 'bg-yellow-500 hover:bg-yellow-600' 
                                    : 'bg-green-500 hover:bg-green-600'
                                }`}
                              >
                                Cập nhật
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Nút xem thêm/thu gọn COD */}
                {codOrders.length > 5 && (
                  <div className="flex justify-center gap-3">
                    {visibleCountCOD < codOrders.length && (
                      <button
                        onClick={() => setVisibleCountCOD(prev => prev + 5)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        ↓ Xem thêm 5
                      </button>
                    )}
                    {visibleCountCOD > 5 && (
                      <button
                        onClick={() => setVisibleCountCOD(5)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        ↑ Thu gọn
                      </button>
                    )}
                  </div>
                )}
                <p className="text-center text-xs text-gray-500">
                  Hiển thị {visibleCODOrders.length} / {codOrders.length} đơn
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal cập nhật trạng thái */}
      {updateModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Cập nhật trạng thái đơn hàng</h3>
            
            {updateModal.order && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="font-semibold">Đơn hàng #{updateModal.order.id}</p>
                  <p className="text-sm text-gray-600">Khách hàng: {updateModal.order.name}</p>
                  <p className="text-sm text-gray-600">Tổng tiền: {Number(updateModal.order.total_amount).toLocaleString()} ₫</p>
                  <p className="text-sm text-gray-600">Phương thức: {
                    updateModal.order.payment_method === 'cod' 
                      ? 'COD' 
                      : getBankCode(updateModal.order) 
                        ? `Bank (${getBankCode(updateModal.order)})` 
                        : 'Bank'
                  }</p>
                  <p className="text-sm text-gray-600">
                    Trạng thái hiện tại: 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(updateModal.order.status)}`}>
                      {getStatusText(updateModal.order.status)}
                    </span>
                  </p>
                  {updateModal.order.payment_method === 'cod' && updateModal.newStatus === 'received' && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      ⓘ Khi chuyển sang "Đã nhận hàng", đơn hàng COD sẽ tự động được đánh dấu là "Đã thanh toán"
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn trạng thái mới:
                  </label>
                  <select
                    value={updateModal.newStatus}
                    onChange={(e) => setUpdateModal(prev => ({ ...prev, newStatus: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Chờ xác nhận</option>
                    <option value="received">Đã nhận hàng</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={closeUpdateModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xác nhận cập nhật
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}