import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <div className="grid" style={{ marginTop: '30px' }}>
        <Link to="/admin/products" className="card">
          <h2>Manage Products</h2>
          <p>Add, edit, or delete products</p>
        </Link>
        <Link to="/admin/orders" className="card">
          <h2>Manage Orders</h2>
          <p>View and update order status</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

