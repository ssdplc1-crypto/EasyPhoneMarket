# FULATAN COMMUNICATION — Production Security

- Customer registration requires a one-time verification code by **email** or **SMS** before an account is created.
- Email OTP can be delivered to Gmail/Google Workspace addresses through the configured email provider.
- SMS OTP uses the configured Termii account.
- OTPs are hashed, expire after 10 minutes, and are limited to 5 verification attempts. Resend is throttled to one request per 60 seconds and registration requests are limited per contact.
- Email addresses are normalized and phone numbers are normalized to the Nigerian +234 format before uniqueness checks. PostgreSQL UNIQUE constraints enforce one account per email and one account per phone number.
- Passwords are stored only as bcrypt hashes.
- Customer login is allowed only after verification.
- Admin authorization is enforced by the backend, not only by the mobile UI.
- Order customer identity is checked against the verified account before an order is created. Delivery state, LGA, address and landmark are stored with the order.
- Referral commission is created from the actual order item and only credited when the admin marks the order **completed**. Reversing a completed order reverses its credited commission.
- Flutterwave payments are verified server-side; never trust a client-side payment-success message.
- Never put `JWT_SECRET`, database credentials, Cloudinary secrets, Flutterwave secrets, Termii keys, Resend keys, or admin passwords in the Expo/mobile app.
- Use HTTPS for the Render API.
- Use Cloudinary for durable phone-image storage because Render service disk is ephemeral.
- Keep production secrets in Render Environment Variables and rotate any secret that is exposed.
