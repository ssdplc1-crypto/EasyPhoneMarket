# FULATAN COMMUNICATION Security

- Authentication is handled by the Render API using JWT and bcrypt password hashing.
- Admin-only operations are enforced on the server, not only in the mobile UI.
- Never put `JWT_SECRET`, database credentials, Cloudinary secret, Flutterwave secret keys, or admin passwords in the Expo app.
- Use HTTPS for the Render API in production.
- Configure Cloudinary for durable production image storage; Render web-service disk is ephemeral.
- Keep `CORS_ORIGIN` restricted to trusted origins when a web admin dashboard is introduced.
- Rotate production secrets if they are ever exposed.
