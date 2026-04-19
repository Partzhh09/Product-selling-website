# HOFO - Premium Wooden Products

HOFO is a full-stack ecommerce app for wooden products.

It includes:

- Customer storefront (React + Vite)
- Product API and order API (Express + MongoDB)
- Admin panel for product and order management

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express, MongoDB
- Admin: React UI + admin API

## Prerequisites

- Node.js 18 or higher
- npm
- MongoDB (local or MongoDB Atlas)

## Quick Start (Recommended)

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment file

```powershell
Copy-Item .env.example .env
```

Update `.env` values if needed.

Important variables:

- `MONGODB_URI`: MongoDB connection string
- `ADMIN_API_KEY`: password for admin login
- `PORT`: product API port (default `5000`)
- `ADMIN_PORT`: admin API port (default `5001`)
- `VITE_API_BASE_URL`: keep empty in local development (Vite proxy is used)

### 3) Start everything

```bash
npm run dev
```

This starts:

- Frontend at `http://localhost:3000`
- Product API at `http://localhost:5000`
- Admin API at `http://localhost:5001`

### 4) Open the app

- Storefront: `http://localhost:3000`
- Admin orders: `http://localhost:3000/admin`
- Admin products: `http://localhost:3000/admin/products`

### 5) Login to admin

Use the value of `ADMIN_API_KEY` from your `.env` file.

If you use `.env.example` without changes, the password is:

- `admin@12345`

## Useful Commands

- `npm run dev`: run frontend + both backend servers together
- `npm run dev:client`: run only frontend
- `npm run dev:server`: run only product API
- `npm run dev:admin-server`: run only admin API
- `npm run build`: build frontend for production
- `npm run preview`: preview production frontend build
- `npm run lint`: run TypeScript check

## Health Checks

- Product API: `GET http://localhost:5000/api/health`
- Admin API: `GET http://localhost:5001/api/admin/health`

## Project Structure (Simplified)

- `frontend/`: all frontend files (Vite app)
- `backend/`: all backend code (routes, models, middleware, services)
- `.env.example`: sample environment variables

## Notes

- On first backend start, if products collection is empty, seed products are inserted automatically.
- Product changes from admin panel are stored in MongoDB.
