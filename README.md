# Zippy | Premium Men's Fashion

Luxury menswear storefront with a professional Express API for catalog, cart, checkout, orders, reviews, and admin.

## Run locally

Prerequisites: Node.js 22+

```bash
# Install frontend dependencies
npm install

# Install API dependencies
cd backend
npm install
cd ..

# Start API (3001), admin console (3002), and storefront (3000)
npm run dev:all
# Or: node start.mjs (Windows / Linux / macOS)
# Or on Linux / macOS: bash start.sh
```

Or run the services separately:

```bash
# API
npm run dev --prefix backend

# Customer storefront
npm run dev

# Admin console (separate port)
npm run dev:admin
```

Storefront: `http://localhost:3000`
Admin console: `http://localhost:3002`
API: `http://localhost:3001`

Both UIs proxy `/api` to the backend.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@zippy.com.bd | admin123 |
| VIP patron | vip@zippy.com.bd | vip123 |
| Customer | tahmid.rahman@example.com | zippy123 |
| Legacy Admin | admin@richmanbd.com | admin123 |

## API

Base URL: `/api`

- `GET /health`
- `GET /products` query: `q`, `category`, `featured`, `onSale`, `newArrival`, `sort`
- `GET /products/:id`
- `POST /products` admin
- `PATCH /products/:id` admin
- `DELETE /products/:id` admin
- `GET /categories`
- `GET /stores`
- `GET /coupons`
- `POST /coupons/validate`
- `POST /checkout`
- `GET /orders/track?q=`
- `POST /auth/login`
- `GET /admin/stats` admin

## Tests

```bash
npm test --prefix backend
```
