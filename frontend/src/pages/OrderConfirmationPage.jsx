import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../utils/api';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrder(orderId);
        setOrder(response.data);
      } catch (err) {
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !order) return <div className="error">{error || 'Order not found'}</div>;

  return (
    <div className="container">
      <div className="success" style={{ textAlign: 'center', padding: '30px' }}>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your order. We will contact you soon.</p>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2>Order Details</h2>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Customer Name:</strong> {order.customerName}</p>
        <p><strong>Phone:</strong> {order.customerPhone}</p>
        <p><strong>Address:</strong> {order.customerAddress}</p>
        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
        
        <h3 style={{ marginTop: '20px' }}>Items:</h3>
        {order.items.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
            <div>
              <p><strong>{item.product?.name || 'Product'}</strong></p>
              <p>Quantity: {item.quantity}</p>
            </div>
            <p>Rs {(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
        
        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #333' }}>
          <h2>Total: Rs {order.totalAmount.toFixed(2)}</h2>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link to="/products" className="btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

