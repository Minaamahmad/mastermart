# E-commerce Store - MERN Stack

A simple e-commerce platform for small businesses with Cash on Delivery functionality.

## Features

- **Customer Features:**
  - Browse products
  - View product details
  - Shopping cart
  - Checkout with Cash on Delivery
  - Order confirmation

- **Admin Features:**
  - Product management (CRUD)
  - Image upload for products
  - Order management
  - Order status updates

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Authentication:** JWT

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb:
JWT_SECRET=your_secret_key_here_change_in_production
PORT=5000
```

4. Start MongoDB (make sure MongoDB is running on your system)

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```
VITE_API_URL=
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `

## Initial Admin Setup

To create an admin account, you can use the registration endpoint:

```bash
curl -X POST
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'
```

Or use Postman/Thunder Client to make the request.

**Note:** In production, you should remove or protect the registration endpoint and create admin accounts directly in the database.

## Project Structure

```
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── uploads/         # Product images
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── utils/       # API utilities
    │   └── App.jsx      # Main app component
    └── vite.config.js   # Vite configuration
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get single order (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

### Auth
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `GET /api/auth/verify` - Verify token

## License

MIT

