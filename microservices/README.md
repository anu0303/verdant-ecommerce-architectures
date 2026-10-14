# Verdant — Microservices Architecture

The same store as the monolith, split into independent services that
communicate over HTTP. The frontend is byte-for-byte identical to the
monolith's — it only ever talks to the API Gateway on `http://localhost:4000`,
exactly like it talked to the single backend before, so it has no idea it's
now facing five separate processes.

## Services

| Service | Port | Owns | Talks to |
|---|---|---|---|
| **api-gateway** | 4000 | Nothing (stateless router) | All four services below |
| **product-service** | 4001 | Product catalog (`verdant_products` DB) | Nobody |
| **cart-service** | 4002 | Shopping carts (`verdant_carts` DB) | product-service (to fetch product details) |
| **order-service** | 4003 | Orders (`verdant_orders` DB) | cart-service (to read + clear the cart) |
| **user-service** | 4004 | Accounts, login, JWT issuing (`verdant_users` DB) | Nobody |

```
Browser → API Gateway (:4000) → product-service (:4001)
                                → cart-service   (:4002) → product-service
                                → order-service  (:4003) → cart-service
                                → user-service   (:4004)
```

**Authentication across services:** user-service signs a JWT at login.
The browser sends it as `Authorization: Bearer …`; the gateway passes it
through, and product-service (admin-only *Add product*) and order-service
(checkout, *My orders*) each verify it themselves with the shared
`JWT_SECRET` — they never call user-service or read its database.
Orders store only the user's id.

Each service has **its own database** and knows nothing about the others'
internal data models — that's what makes this microservices rather than
just a folder split. Services only ever talk to each other through their
public HTTP APIs, the same way the gateway talks to them.

The gateway resolves the shopper's `cartId` cookie once, at the edge, and
forwards it to every service as an `x-cart-id` header — so only the
gateway needs to know about cookies at all.

## Run it locally (without Docker)

You need MongoDB running locally first (see the main repo README for
install steps), then start the services, each in its own terminal:

```bash
# Terminal 1
cd product-service
npm install
cp .env.example .env
npm run seed
npm run dev

# Terminal 2
cd cart-service
npm install
cp .env.example .env
npm run dev

# Terminal 3
cd order-service
npm install
cp .env.example .env
npm run dev

# Terminal 4
cd user-service
npm install
cp .env.example .env
npm run dev          # also creates admin@verdant.com / admin123

# Terminal 5
cd api-gateway
npm install
cp .env.example .env
npm run dev

# Terminal 6 - the frontend, same as the monolith
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`. Under the hood every request is now
fanning out across five processes instead of one.

## Run it with Docker (all backend services in one command)

```bash
docker compose up --build
```

This starts MongoDB and all five backend services together. Then, separately:

```bash
cd frontend
npm install
npm run dev
```

(The frontend isn't containerized here since you're actively developing
against it — but a `Dockerfile` for it would be trivial to add.)

## Proving it's actually distributed

A few ways to demonstrate this to your professor, beyond just "it works":

1. **Check each service's own health endpoint** — `curl http://localhost:4001/health`,
   `:4002/health`, `:4003/health`, `:4004/health`, `:4000/api/health` — each replies independently
   and reports its own service name.
2. **Stop one service and watch the blast radius.** Kill `product-service`
   (Ctrl+C in its terminal) and try browsing `/shop` — it fails, because
   the catalog is unavailable. Now try `/cart` on an item already in the
   cart — cart-service is still up and serves what it can, though product
   details will be missing for items whose product-service lookup failed.
   This is the real, honest behavior of a distributed system: partial
   failure, not total failure.
3. **Look at MongoDB directly** — connect with `mongosh` or MongoDB Compass
   and you'll see four separate databases (`verdant_products`,
   `verdant_carts`, `verdant_orders`, `verdant_users`), proving no shared schema.
4. **Stop user-service** — login/register stop working, but browsing the
   shop and the cart keep working for everyone.
5. **Watch the gateway logs** — every request logged there shows it being
   proxied to a specific downstream service and port.
