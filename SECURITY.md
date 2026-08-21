# FULATAN COMMUNICATION Security

## Admin authorization
- Client UI checks `user.role === 'admin'` for navigation only.
- Real admin authorization is the Firebase Auth custom claim `admin: true`.
- Firestore and Storage rules reject admin writes without that claim.
- The client never sets its own admin claim.
- `loginUser()` reads the ID token claim before assigning the local admin role.

## Protected operations
- Products: only admin can create, update, publish/hide, or delete.
- App contact settings: only admin can change Call / WhatsApp / Chat controls.
- Phone images: only admin can upload to `phones/**`.
- Orders and payments: user can create/read their own records; admin can manage them.
- Chats: only participants or admin can read/write messages.

## Secrets
Never put these in Expo:
- Flutterwave secret key / webhook secret
- Firebase Admin SDK private key
- service account JSON
- admin passwords

## Production checklist
1. Enable Firebase Email/Password or the chosen authentication method.
2. Create an admin through a trusted server/Cloud Function and set `admin: true` custom claim.
3. Deploy `firestore.rules` and `storage.rules`.
4. Connect the existing FULATAN backend/PostgreSQL for business data as required.
5. Put Flutterwave secret credentials on the backend only.
6. Add App Check and monitoring before production release.
