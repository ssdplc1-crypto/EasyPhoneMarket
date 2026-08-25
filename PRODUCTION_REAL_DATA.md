# FULATAN COMMUNICATION — Production Data Rules

This build intentionally has no mock/demo data fallbacks.

## Required production services
- PostgreSQL: `DATABASE_URL`
- JWT: `JWT_SECRET`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Flutterwave: `FLW_SECRET_KEY`, `FLW_REDIRECT_URL`, `FLW_WEBHOOK_HASH`

## Real data behavior
- Registration creates a real PostgreSQL user and a unique referral code.
- Referral code entered during registration links the new customer to the referrer.
- Admin statistics are queried from PostgreSQL; there are no hard-coded user/order/revenue numbers.
- Phone prices and referral commission settings are stored in PostgreSQL.
- Orders are stored in PostgreSQL.
- Referral commissions are calculated from the actual phone commission setting and quantity.
- Commission becomes credited only when an admin marks the order `completed`.
- If a completed order is moved back to another status, the credited commission is reversed.
- Phone images require Cloudinary in production; no Render ephemeral image storage fallback is used.
- Online payments require Flutterwave credentials; there is no fake/test payment fallback.
- Customers cannot use admin endpoints because backend authorization checks the JWT role.
