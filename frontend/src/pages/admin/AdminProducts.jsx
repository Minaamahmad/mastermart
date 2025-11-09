import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../utils/api';
import { getImageUrl } from '../../utils/imageUtils';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: 'General',
    stock: '',
    featured: false,
    image: null
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setError(null);
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load products';
      setError(errorMessage);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, image: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      setSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      setError('Product description is required');
      setSubmitting(false);
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      setSubmitting(false);
      return;
    }
    if (formData.stock === '' || parseInt(formData.stock) < 0) {
      setError('Valid stock quantity is required');
      setSubmitting(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name.trim());
    data.append('description', formData.description.trim());
    data.append('price', parseFloat(formData.price));
    if (formData.originalPrice && formData.originalPrice.trim()) {
      data.append('originalPrice', parseFloat(formData.originalPrice));
    }
    if (formData.discount && formData.discount.trim()) {
      data.append('discount', parseFloat(formData.discount));
    }
    data.append('category', formData.category);
    data.append('stock', parseInt(formData.stock));
    data.append('featured', formData.featured);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, data);
      } else {
        await createProduct(data);
      }
      resetForm();
      await fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save product';
      setError(errorMessage);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      discount: product.discount || '',
      category: product.category,
      stock: product.stock,
      featured: product.featured,
      image: null
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setError(null);
      await deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete product';
      setError(errorMessage);
      if (err.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      discount: '',
      category: 'General',
      stock: '',
      featured: false,
      image: null
    });
    setEditingProduct(null);
    setShowForm(false);
  };
  
  const handleDiscountChange = (e) => {
    const discountValue = parseFloat(e.target.value) || 0;
    
    // Auto-calculate originalPrice if discount is set and price exists
    if (formData.price && discountValue > 0 && discountValue <= 100) {
      const calculatedOriginalPrice = (parseFloat(formData.price) / (1 - discountValue / 100)).toFixed(2);
      setFormData(prev => ({ ...prev, discount: e.target.value, originalPrice: calculatedOriginalPrice }));
    } else if (discountValue === 0) {
      setFormData(prev => ({ ...prev, discount: e.target.value, originalPrice: '' }));
    } else {
      setFormData(prev => ({ ...prev, discount: e.target.value }));
    }
  };
  
  const handleOriginalPriceChange = (e) => {
    const originalPriceValue = parseFloat(e.target.value) || 0;
    
    // Auto-calculate discount if originalPrice is set and price exists
    if (formData.price && originalPriceValue > parseFloat(formData.price)) {
      const calculatedDiscount = Math.round(((originalPriceValue - parseFloat(formData.price)) / originalPriceValue) * 100);
      setFormData(prev => ({ ...prev, originalPrice: e.target.value, discount: calculatedDiscount }));
    } else if (originalPriceValue === 0 || !e.target.value) {
      setFormData(prev => ({ ...prev, originalPrice: e.target.value, discount: '' }));
    } else {
      setFormData(prev => ({ ...prev, originalPrice: e.target.value }));
    }
  };

  // Show error state if failed to load and no products
  if (error && !loading && products.length === 0) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <div className="error">
          <h2>Error Loading Products</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={fetchProducts} style={{ marginTop: '10px' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px', minHeight: '400px' }}>
      {loading ? (
        <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Loading products...</h2>
          <p>Please wait while we fetch the products.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1>Manage Products</h1>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Add New Product'}
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

      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Price (Selling Price) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label>Original Price (Optional)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleOriginalPriceChange}
                  step="0.01"
                  min="0"
                  placeholder="Enter original price"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Discount will be calculated automatically
                </small>
              </div>
              <div className="form-group">
                <label>Discount % (Optional)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleDiscountChange}
                  min="0"
                  max="100"
                  placeholder="Enter discount percentage"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Original price will be calculated automatically
                </small>
              </div>
            </div>
            {(formData.originalPrice || formData.discount) && (
              <div style={{ 
                padding: '12px', 
                background: '#e8f5e9', 
                borderRadius: '8px', 
                marginBottom: '20px',
                fontSize: '14px',
                color: '#2e7d32'
              }}>
                <strong>Preview:</strong> {
                  formData.originalPrice && formData.price ? (
                    <>
                      Original: Rs {parseFloat(formData.originalPrice).toFixed(0)} → 
                      Sale: Rs {parseFloat(formData.price).toFixed(0)} 
                      ({formData.discount || Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.price)) / parseFloat(formData.originalPrice)) * 100)}% off)
                    </>
                  ) : formData.discount ? (
                    <>
                      Discount: {formData.discount}% → 
                      Original: Rs {formData.originalPrice ? parseFloat(formData.originalPrice).toFixed(0) : 'Calculated'} | 
                      Sale: Rs {parseFloat(formData.price).toFixed(0)}
                    </>
                  ) : null
                }
              </div>
            )}
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="General">General</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                Featured Product
              </label>
            </div>
            <div className="form-group">
              <label>Product Image {editingProduct && '(Leave empty to keep current image)'}</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
              />
            </div>
            {editingProduct && editingProduct.image && (
              <div style={{ marginBottom: '15px' }}>
                <p>Current Image:</p>
                <img src={getImageUrl(editingProduct.image)} alt="Current" style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
              </div>
            )}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product')}
            </button>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '8px', marginTop: '20px' }}>
          <h2>No Products Found</h2>
          <p>Start by adding your first product!</p>
          <button className="btn-primary" onClick={() => setShowForm(true)} style={{ marginTop: '20px' }}>
            Add First Product
          </button>
        </div>
      ) : (
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Original Price</th>
                <th>Discount</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
              <tr key={product._id}>
                <td>
                  {product.image ? (
                    <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', background: '#ddd' }}></div>
                  )}
                </td>
                <td>{product.name || 'N/A'}</td>
                <td>Rs {product.price ? product.price.toFixed(0) : '0'}</td>
                <td>
                  {product.originalPrice ? (
                    <span style={{ textDecoration: 'line-through', color: '#999' }}>
                      Rs {product.originalPrice.toFixed(0)}
                    </span>
                  ) : (
                    <span style={{ color: '#999' }}>—</span>
                  )}
                </td>
                <td>
                  {product.discount > 0 ? (
                    <span style={{ color: '#ff4757', fontWeight: 600 }}>
                      {product.discount}%
                    </span>
                  ) : (
                    <span style={{ color: '#999' }}>—</span>
                  )}
                </td>
                <td>{product.stock !== undefined ? product.stock : 0}</td>
                <td>{product.category || 'General'}</td>
                <td>{product.featured ? 'Yes' : 'No'}</td>
                <td>
                  <button className="btn-secondary" onClick={() => handleEdit(product)} style={{ marginRight: '10px' }}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default AdminProducts;

