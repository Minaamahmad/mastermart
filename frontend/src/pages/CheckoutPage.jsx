import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { createOrder, getUserProfile } from '../utils/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth0();
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      navigate('/cart');
    }
    setCart(savedCart);
  }, [navigate]);

  // Load user data if authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated) {
        try {
          const response = await getUserProfile();
          const userData = response.data;
          
          setFormData(prev => ({
            customerName: prev.customerName || userData.name || user?.name || '',
            customerEmail: prev.customerEmail || userData.email || user?.email || '',
            customerPhone: prev.customerPhone || userData.phone || '',
            customerAddress: prev.customerAddress || (userData.address ? 
              `${userData.address.street || ''}, ${userData.address.city || ''}, ${userData.address.state || ''}, ${userData.address.zipCode || ''}`.replace(/^,\s*|,\s*$/g, '') : '')
          }));
        } catch (error) {
          console.error('Error loading user data:', error);
          // Fallback to Auth0 user data
          if (user) {
            setFormData(prev => ({
              ...prev,
              customerName: prev.customerName || user.name || '',
              customerEmail: prev.customerEmail || user.email || ''
            }));
          }
        }
      }
    };

    loadUserData();
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || null,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await createOrder(orderData);
      localStorage.removeItem('cart');
      navigate(`/order-confirmation/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container">
      <h1>Checkout</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px' }}>
        <div>
          <h2>Order Summary</h2>
          {cart.map((item) => (
            <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #ddd' }}>
              <div>
                <p><strong>{item.name}</strong></p>
                <p>Quantity: {item.quantity}</p>
              </div>
              <p>Rs {(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #333' }}>
            <h2>Total: Rs {totalAmount.toFixed(2)}</h2>
            <p style={{ color: '#666', marginTop: '10px' }}>Payment Method: Cash on Delivery</p>
          </div>
        </div>

        <div>
          <h2>Delivery Information</h2>
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
              />
            </div>
            {isAuthenticated && (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleChange}
                  disabled
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </div>
            )}
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Delivery Address *</label>
              <textarea
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

