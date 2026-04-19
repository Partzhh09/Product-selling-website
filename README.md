# HOFO - Premium Wooden Products

HOFO is a full-stack wooden products storefront with:

- React + Vite frontend
- Express + MongoDB backend
- Admin panel for product management

## Prerequisites

- Node.js 18+
- npm
- MongoDB (local or Atlas)

## 1) Install Dependencies

```bash
npm install
```

## 2) Configure Environment

Create a `.env` file from `.env.example` and update values:

```powershell
Copy-Item .env.example .env
```

Required values:

- `MONGODB_URI` - MongoDB connection string
- `ADMIN_API_KEY` - password used to log into the admin panel
- `PORT` - backend API port (default: `5000`)
- `ADMIN_PORT` - admin API port (default: `5001`)
- `VITE_API_BASE_URL` - keep empty for local dev with Vite proxy

Default admin password in `.env.example`:

- `admin@12345`

## 3) Run Product Backend (MongoDB API)

```bash
npm run dev:server
```

Product backend runs on `http://localhost:5000`.

Notes:

- On startup, if the products collection is empty, seed products are inserted automatically.
- Health check: `GET /api/health`

## 4) Run Admin Backend

In a second terminal:

```bash
npm run dev:admin-server
```

Admin backend runs on `http://localhost:5001`.

Admin health check: `GET /api/admin/health`

## 5) Run Frontend

In a third terminal:

```bash
npm run dev
```

Frontend runs on `http://localhost:3000`.

## 6) Admin Panel

Open:

- `http://localhost:3000/admin`

Login password is the value of `ADMIN_API_KEY`.

If you used `.env.example` as-is, the password is:

- `admin@12345`

From the admin panel, you can:

- Create products
- Edit products
- Delete products

All product changes are saved in MongoDB.
