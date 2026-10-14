# Verdant — E-commerce: Monolith vs. Microservices

Two implementations of the same houseplant e-commerce store, built to
compare architectural styles side by side:

```
ecommerce-architectures/
├── monolith/          One Express backend + one MongoDB database
├── microservices/      Five services (gateway + 4 microservices)
└── screenshots/         Screenshots of both apps running (see below)
```

Both versions share the exact same feature set — product catalog,
search & filters, cart, user accounts (register / login with JWT),
a simulated checkout that requires login, "My Orders", and an
admin-only "Add Product" page — and the exact same
frontend code, so the only thing that differs is how the backend is
structured.

## Quick comparison

| | Monolith | Microservices |
|---|---|---|
| Backend processes | 1 | 5 (gateway, product, cart, order, user) |
| Databases | 1 (`verdant`) | 4 (`verdant_products`, `verdant_carts`, `verdant_orders`, `verdant_users`) |
| Inter-service calls | None (direct function/model calls) | HTTP (cart→product, order→cart); JWT shared via gateway |
| Deploy unit | 1 backend + 1 frontend | 5 independently deployable units |
| Failure behavior | One bug can affect the whole API | A crashed service degrades only its own feature |
| Where to look | `monolith/backend/routes/` | `microservices/*/routes/` + `api-gateway/server.js` |

## Demo accounts

- **Admin:** `admin@verdant.com` / `admin123` (can open *Add product*)
- **Shopper:** register any new account from the Register page
- **Test cards:** `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` is declined

## Running each version

See the README inside each folder for full setup steps:
- [`monolith/README.md`](./monolith/README.md)
- [`microservices/README.md`](./microservices/README.md)

Both need MongoDB running locally (or a MongoDB Atlas connection string).
Only run one architecture's backend at a time if you're reusing the same
ports (`4000` for the monolith's API and the gateway both default there).

## Publishing this to a public GitHub repository

1. Create a new **public** repository on GitHub (no README/license/gitignore
   — this project already has them) — e.g. `verdant-ecommerce-architectures`.
2. From this project's root folder, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: monolith and microservices e-commerce implementations"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
3. Confirm on github.com that `.env` files are **not** present in the
   pushed repo (only `.env.example` should be there) — the included
   `.gitignore` handles this automatically.

## Taking screenshots for submission

For each architecture, run it locally per its README, then capture:
1. Home page
2. Shop page with a search or filter applied
3. Product detail page
4. Login / Register page
5. Cart with items in it
6. Checkout success (order confirmation page)
7. My Orders page
8. Admin "Add product" page

Save them into a `screenshots/monolith/` and `screenshots/microservices/`
folder at the repo root, e.g.:
```
screenshots/
├── monolith/
│   ├── 01-home.png
│   ├── 02-shop-search.png
│   ├── 03-product-detail.png
│   ├── 04-cart.png
│   └── 05-order-confirmation.png
└── microservices/
    ├── 01-home.png
    ├── 02-shop-search.png
    ├── 03-product-detail.png
    ├── 04-cart.png
    ├── 05-order-confirmation.png
    └── 06-terminals-five-services-running.png   ← optional but a strong
                                                      visual proof of the
                                                      architecture: five
                                                      terminal windows
                                                      each showing a
                                                      different service's
                                                      startup log
```
Then commit and push them:
```bash
git add screenshots
git commit -m "Add screenshots of both running applications"
git push
```

For the microservices version specifically, a screenshot of your terminal
showing all five `[service-name] listening on ...` startup logs side by
side is worth including — it's the clearest possible visual evidence that
this is genuinely five separate processes, not just relabeled code.
