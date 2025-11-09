import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../utils/api';
import { getImageUrl } from '../utils/imageUtils';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = category ? { category } : {};
        const response = await getProducts(params);
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  useEffect(() => {
    if (search.trim()) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [search, products]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const categories = ['All Categories', 'Electronics', 'Clothing', 'Food', 'General'];

  return (
    <div className="container">
      <div className="section-header">
        <h1>All Products</h1>
      </div>

      <div className="category-badges">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-badge ${category === (cat === 'All Categories' ? '' : cat) ? 'active' : ''}`}
            onClick={() => setCategory(cat === 'All Categories' ? '' : cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearchParams(value ? { search: value } : {});
          }}
        />
        {search && (
          <button 
            onClick={() => setSearchParams({})}
            className="search-button"
            style={{ right: search ? '80px' : '8px' }}
          >
            Clear
          </button>
        )}
      </div>

      {search && (
        <p style={{ marginBottom: '20px', color: '#666', textAlign: 'center', fontSize: '16px' }}>
          Showing <strong>{filteredProducts.length}</strong> result(s) for "<strong>{search}</strong>"
        </p>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid">
          {filteredProducts.map((product) => {
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
          <h3>{search ? `No products found for "${search}"` : 'No products available'}</h3>
          <p>{search ? 'Try a different search term or browse all categories' : 'Check back soon for new products!'}</p>
          {search && (
            <button 
              onClick={() => setSearchParams({})}
              className="btn-primary"
              style={{ marginTop: '20px' }}
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

