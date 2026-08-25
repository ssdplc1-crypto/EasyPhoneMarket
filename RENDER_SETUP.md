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


## Customer OTP configuration
Customer registration will not complete until the OTP provider is configured. Choose either Email or SMS in the registration screen.

### Email OTP (Gmail recipients)
Set:
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL` (a sender address/domain verified in Resend)

The customer's Gmail address is simply the destination; they do not need a Gmail API account.

### SMS OTP (SIM)
Set:
- `TERMII_API_KEY`
- `TERMII_SENDER_ID`
- `TERMII_CHANNEL=generic` (or the channel enabled for your Termii account)

### Payment
Also set the real Flutterwave variables:
- `FLW_SECRET_KEY`
- `FLW_REDIRECT_URL`
- `FLW_WEBHOOK_HASH`

Do not put any of these secret values inside the Expo app.
