import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import './Navbar.css';

const Navbar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();

  useEffect(() => {
    const checkAdminStatus = () => {
      const token = localStorage.getItem('adminToken');
      setIsAdmin(!!token);
    };

    checkAdminStatus();
    
    // Listen for storage changes (when token is set/removed in other tabs)
    window.addEventListener('storage', checkAdminStatus);
    
    return () => {
      window.removeEventListener('storage', checkAdminStatus);
    };
  }, [location]); // Re-check when route changes

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    window.location.href = '/';
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <h2>E-Store</h2>
        </Link>
        <form onSubmit={handleSearch} className="navbar-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">Products</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          {isAuthenticated && (
            <li>
              <span className="user-info">
                {user?.name || user?.email}
              </span>
            </li>
          )}
          {isAuthenticated ? (
            <li>
              <button 
                onClick={() => logout({ returnTo: window.location.origin })} 
                className="btn-logout"
              >
                Logout
              </button>
            </li>
          ) : (
            <li>
              <button 
                onClick={() => loginWithRedirect()} 
                className="btn-primary"
                style={{ marginRight: '10px' }}
              >
                Login
              </button>
            </li>
          )}
          {isAdmin && (
            <>
              <li><Link to="/admin/dashboard">Dashboard</Link></li>
              <li><Link to="/admin/products">Products</Link></li>
              <li><Link to="/admin/orders">Orders</Link></li>
              <li><button onClick={handleLogout} className="btn-logout">Admin Logout</button></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

