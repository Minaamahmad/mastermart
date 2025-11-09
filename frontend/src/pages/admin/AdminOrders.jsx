import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setError(null);
      const response = await getOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load orders';
      setError(errorMessage);
      // If it's an auth error, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setError(null);
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update order status';
      setError(errorMessage);
      // If it's an auth error, redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Pending': 'badge-pending',
      'Confirmed': 'badge-confirmed',
      'Out for Delivery': 'badge-delivery',
      'Delivered': 'badge-delivered',
      'Cancelled': 'badge-cancelled'
    };
    return statusMap[status] || '';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Manage Orders</h1>
        <button 
          onClick={fetchOrders} 
          className="btn-secondary"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>
      
      {error && (
        <div className="error" style={{ marginBottom: '20px' }}>
          {error}
          <button 
            onClick={() => setError(null)} 
            style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '12px' }}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {orders.length === 0 && !loading ? (
        <p>No orders yet.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {orders.map((order) => (
            <div key={order._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h3>Order #{order._id.slice(-8)}</h3>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span className={`badge ${getStatusBadgeClass(order.status)}`}>{order.status}</span></p>
                </div>
                <div>
                  <h2 className="price">Rs {order.totalAmount.toFixed(2)}</h2>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <p><strong>Customer:</strong> {order.customerName}</p>
                <p><strong>Phone:</strong> {order.customerPhone}</p>
                <p><strong>Address:</strong> {order.customerAddress}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h4>Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', paddingLeft: '20px' }}>
                    <span>{item.product?.name || 'Product'} x {item.quantity}</span>
                    <span>Rs {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div>
                <label>Update Status:</label>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  style={{ marginTop: '10px' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

