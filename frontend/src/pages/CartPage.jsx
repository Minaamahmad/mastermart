import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Start shopping to add items to your cart!</p>
          <button className="btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '24px' }}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1>Shopping Cart</h1>
        <span style={{ color: '#666', fontSize: '16px' }}>{cart.length} item(s)</span>
      </div>
      
      <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
        {cart.map((item) => (
          <div 
            key={item.productId} 
            className="card" 
            style={{ 
              display: 'flex', 
              gap: '20px', 
              alignItems: 'center',
              padding: '20px'
            }}
          >
            {item.image && (
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '12px', 
                overflow: 'hidden',
                flexShrink: 0
              }}>
                <img 
                  src={getImageUrl(item.image)} 
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#333' }}>{item.name}</h3>
              <p style={{ color: '#666', marginBottom: '12px' }}>
                Rs <strong>{item.price.toFixed(0)}</strong> each
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid #e0e0e0', borderRadius: '8px', padding: '4px' }}>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#f0f0f0',
                      color: '#333',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#ff4757';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = '#f0f0f0';
                      e.target.style.color = '#333';
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#f0f0f0',
                      color: '#333',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#ff4757';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = '#f0f0f0';
                      e.target.style.color = '#333';
                    }}
                  >
                    +
                  </button>
                </div>
                <button 
                  className="btn-danger" 
                  onClick={() => removeItem(item.productId)}
                  style={{ 
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '8px'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: '100px' }}>
              <p className="price" style={{ fontSize: '24px', fontWeight: 700 }}>
                Rs {(item.price * item.quantity).toFixed(0)}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="card" style={{ 
        marginTop: '30px', 
        padding: '30px',
        background: 'linear-gradient(135deg, #ff4757 0%, #ff6348 100%)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', color: 'white', margin: 0 }}>Total Amount</h2>
          <h2 style={{ fontSize: '32px', color: 'white', margin: 0, fontWeight: 800 }}>
            Rs {totalAmount.toFixed(0)}
          </h2>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => navigate('/checkout')} 
          style={{ 
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: 700,
            background: 'white',
            color: '#ff4757',
            marginTop: '20px'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'scale(1.02)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
};

export default CartPage;

