# FULATAN Communication API

Node.js/Express backend for the FULATAN mobile marketplace.

### Endpoints included
- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/categories`
- `GET /api/phones`
- `GET /api/admin/phones` (admin)
- `POST /api/phones` (admin + images)
- `PATCH /api/phones/:id` (admin)
- `DELETE /api/phones/:id` (admin)
- `POST /api/orders`
- `POST /api/chats`
- `GET /api/chats/:id/messages`
- `POST /api/chats/:id/messages`
- `GET /api/settings/contact`
- `PUT /api/settings/contact` (admin)

Run migrations and seed the first admin after creating PostgreSQL:
`npm run db:migrate`
`npm run db:seed`
