# Verdant — Monolithic Architecture

A single Express backend, a single MongoDB database, and a single React
frontend — the classic three-tier app. One process handles products,
carts, accounts and checkout together; one codebase, one deploy.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express (one server, all routes)
- **Database:** MongoDB (Mongoose) — one database, four collections
  (`products`, `carts`, `orders`, `users`)
- **Auth:** bcryptjs password hashing + JSON Web Tokens (JWT)

## Run it locally

You need MongoDB running first (see the main repo README for install
steps).

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

`npm run seed` also creates the admin account
`admin@verdant.com` / `admin123`.

Visit `http://localhost:5173`.

## Features to try

- Register / log in (Navbar) — checkout and *My orders* need a login
- Add to cart as a guest, then log in at checkout; cart is kept
- Pay with `4242 4242 4242 4242`, then open **My orders**
- Log in as admin → **Add product** appears in the Navbar; a normal user
  who opens `/admin/add-product` sees "Admins only"

API routes: `/api/auth/*`, `/api/products`, `/api/cart`, `/api/checkout`, `/api/orders/mine`.

## What "monolithic" means here

Every request — browsing products, updating a cart, checking out — is
handled by the same Node process, reading and writing the same MongoDB
connection. There's no network hop between "services" because there are
no separate services: `routes/auth.js`, `routes/products.js`, `routes/cart.js`, and
`routes/checkout.js` are just files in one Express app, and they read
each other's Mongoose models directly (e.g. `checkout.js` imports the
`Cart` model straight from `models/Cart.js` — no HTTP call needed).

Compare this to `../microservices`, where the equivalent logic is split
across five independent processes that only ever talk to each other over
HTTP.
