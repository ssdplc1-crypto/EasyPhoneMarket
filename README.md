# FULATAN COMMUNICATION

Production marketplace foundation for buying and selling phones (iPhone, Samsung, Tecno, Infinix and more).

## Architecture
- Mobile: Expo + React Native
- Backend: Node.js + Express
- Database: PostgreSQL on Render
- Auth: JWT + bcrypt
- Images: Cloudinary (recommended)
- Admin: server-enforced role authorization

See `RENDER_SETUP.md` for deployment.

# FULATAN COMMUNICATION

Buy · Sell · Upgrade — Expo Go mobile marketplace for phones and accessories.

## Current app design
- FULATAN COMMUNICATION branded home screen
- Search, brand categories and hot deals
- Product details with admin-controlled Call, WhatsApp and Chat
- Cart and secure checkout flow
- Favorites and profile
- Admin-only product management
- Admin contact controls for Call / WhatsApp / Live Chat
- Admin dashboard with products, contact controls, activity overview and security notes
- Firebase Auth / Firestore / Storage integration hooks
- Expo SDK 54 so the project remains compatible with the Expo Go setup already tested on the target Android phone

## Admin security
The mobile UI is not the security boundary. Production admin access must be granted with Firebase Authentication custom claims (`admin: true`). Firestore and Storage rules in this project check the claim before allowing admin writes.

Do not put Flutterwave secret keys, Firebase Admin SDK credentials, service-account JSON, or admin passwords inside the Expo app.

## Start

```bash
npm install
npx expo start --tunnel -c
```

Scan the QR code with the compatible Expo Go app.

## Firebase
Copy `.env.example` to `.env` and add the Expo public Firebase configuration. Then deploy `firestore.rules` and `storage.rules` from a trusted development environment.

For real production administration, create the first admin through a trusted backend/Cloud Function that sets the Firebase custom claim. Never let the client app assign its own admin claim.

## Payments
Checkout is prepared for a secure Flutterwave backend integration. Keep Flutterwave secret keys on the server only.
