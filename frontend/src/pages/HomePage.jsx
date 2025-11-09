import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { getImageUrl } from '../utils/imageUtils';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [allProductsResponse, featuredResponse] = await Promise.all([
          getProducts(),
          getProducts({ featured: 'true' })
        ]);
        setProducts(allProductsResponse.data);
        setFeaturedProducts(featuredResponse.data.slice(0, 6));
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <div className="hero">
        <h1>Welcome to Our Store</h1>
        <p>Shop the best products with Cash on Delivery</p>
        <Link to="/products" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
          Shop Now
        </Link>
      </div>

      {featuredProducts.length > 0 && (
        <section className="featured-section" style={{ marginBottom: '40px' }}>
          <div className="section-header">
            <h2>🔥 Featured Products</h2>
            <Link to="/products" className="view-all">View All →</Link>
          </div>
          <div className="grid">
            {featuredProducts.map((product) => {
              const originalPrice = product.originalPrice || (product.price && product.discount > 0 ? (product.price / (1 - product.discount / 100)) : null);
              const discount = product.discount || 0;
              return (
                <div key={product._id} className="card">
                  <Link to={`/products/${product._id}`} className="card-link">
                    <div className="card-image-wrapper">
                      {product.image ? (
                        <img src={getImageUrl(product.image)} alt={product.name} />
                      ) : (
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%', 
                          background: '#f0f0f0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#999'
                        }}>
                          No Image
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="discount-badge">-{discount}%</div>
                      )}
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{product.name}</h3>
                      <div className="card-price-section">
                        <span className="price">Rs {product.price ? product.price.toFixed(0) : '0'}</span>
                        {originalPrice && originalPrice > product.price && (
                          <span className="price-original">Rs {originalPrice.toFixed(0)}</span>
                        )}
                      </div>
                      {product.stock === 0 ? (
                        <span className="stock-badge out-of-stock">Out of Stock</span>
                      ) : (
                        <span className="stock-badge in-stock">In Stock</span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="all-products-section">
        <div className="section-header">
          <h2>🛍️ All Products</h2>
        </div>
        {products.length > 0 ? (
          <div className="grid">
            {products.map((product) => {
              const originalPrice = product.originalPrice || (product.price && product.discount > 0 ? (product.price / (1 - product.discount / 100)) : null);
              const discount = product.discount || 0;
              return (
                <div key={product._id} className="card">
                  <Link to={`/products/${product._id}`} className="card-link">
                    <div className="card-image-wrapper">
                      {product.image ? (
                        <img src={getImageUrl(product.image)} alt={product.name} />
                      ) : (
                        <div style={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          width: '100%', 
                          height: '100%', 
                          background: '#f0f0f0', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#999'
                        }}>
                          No Image
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="discount-badge">-{discount}%</div>
                      )}
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">{product.name}</h3>
                      <p className="card-description">
                        {product.description ? product.description.substring(0, 60) + '...' : ''}
                      </p>
                      <div className="card-price-section">
                        <span className="price">Rs {product.price ? product.price.toFixed(0) : '0'}</span>
                        {originalPrice && originalPrice > product.price && (
                          <span className="price-original">Rs {originalPrice.toFixed(0)}</span>
                        )}
                      </div>
                      {product.stock === 0 ? (
                        <span className="stock-badge out-of-stock">Out of Stock</span>
                      ) : (
                        <span className="stock-badge in-stock">In Stock</span>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No products available</h3>
            <p>Check back soon for new products!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;

