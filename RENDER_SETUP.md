# FULATAN COMMUNICATION — Render setup

## 1. Create PostgreSQL
Create a Render PostgreSQL database and copy its **Internal Database URL** into the API service as `DATABASE_URL`.

## 2. Create Web Service
Use the repository/project root and `render.yaml`, or configure manually:
- Root directory: `backend`
- Build: `npm install`
- Start: `npm start`
- Health check: `/health`

## 3. Environment variables
Set `DATABASE_URL`, a strong random `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
For production phone-image storage, set the three Cloudinary variables. Without them, Render's local disk is only a temporary fallback.

## 4. Initialize database
After the service can reach PostgreSQL, run:
`npm run db:migrate`
then:
`npm run db:seed`

## 5. Expo app
Copy `.env.example` to `.env` and set:
`EXPO_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com`

Then run Expo and test registration/login, admin phone publishing, customer listing, and chat.
