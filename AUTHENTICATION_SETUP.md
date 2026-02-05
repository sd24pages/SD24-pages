# SD24 LIB - Authentication System Setup Guide

## Features Implemented

✅ **Welcome Email** - Automatically sent when new user registers  
✅ **Email Verification** - Users receive verification link after signup  
✅ **OTP Login** - Existing users receive 6-digit OTP code for login  
✅ **Password Strength Checker** - Real-time password validation  
✅ **Beautiful UI** - Dark theme with gradient effects  
✅ **Error Handling** - Comprehensive error messages  
✅ **Rate Limiting** - Cooldown timers for resending codes  

---

## Setup Instructions

### 1. Firebase Project Configuration

Update the Firebase config in `public/auth.html` (line ~500):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 2. Cloud Functions Setup

#### Install Dependencies:
```bash
cd functions
npm install
```

#### Set Environment Variables:

Create `.env` file in `functions/` directory:
```
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

**Note**: Use [Gmail App Password](https://myaccount.google.com/apppasswords), not your regular password.

#### Deploy Functions:
```bash
firebase deploy --only functions
```

### 3. Firestore Rules

Set up security rules in Firebase Console (Firestore > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow create: if request.auth.uid != null;
    }
    
    // OTP collection
    match /otps/{email} {
      allow read, write, delete: if request.auth != null;
    }
  }
}
```

### 4. Firebase Authentication Settings

1. Go to Firebase Console > Authentication
2. Enable:
   - Email/Password
   - Email Link Authentication (optional)
3. Configure Email Templates (optional):
   - Customize welcome emails in Authentication > Templates

---

## User Flow

### Registration Flow:
1. User fills signup form
2. Account created in Firebase Auth
3. Welcome email sent automatically
4. Verification email sent with link
5. User verifies email via link
6. Account fully activated

### Login Flow:
1. User enters email and password
2. System sends OTP to email
3. User enters 6-digit OTP
4. If valid, user logged in
5. OTP expires in 5 minutes
6. Max 3 attempts per OTP

---

## Email Templates

### Welcome Email
- Sent immediately after registration
- Contains user greeting
- Lists account details

### Verification Email
- Contains verification link
- Link expires in 24 hours
- Clickable button + manual link

### Login OTP Email
- 6-digit code formatted for easy reading
- Code expires in 5 minutes
- Security warning included

---

## Frontend Integration

### Session Management

After successful OTP verification, localStorage stores:
```javascript
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('userEmail', 'user@email.com');
```

### Redirect Logic

After login, users are redirected to:
- `library.html` (default)
- `category.html?type=...` (if coming from category page)

---

## Troubleshooting

### Emails not sending?
- Check Gmail credentials in .env
- Verify "Less secure app access" is enabled
- Use Gmail App Password instead of regular password

### OTP not received?
- Check spam/promotions folder
- Verify Firestore is accessible
- Check Cloud Function logs: `firebase functions:log`

### Users can't verify email?
- Check verification link in email
- Ensure Firebase Auth is enabled
- Check security rules are correct

---

## Environment Variables (.env format)

```
GMAIL_USER=your-app@gmail.com
GMAIL_PASSWORD=abcd efgh ijkl mnop
NODE_ENV=production
```

---

## Security Notes

- OTPs are deleted after verification
- Passwords are never stored in Firestore (handled by Firebase Auth)
- Email verification links expire after 24 hours
- OTP max attempts: 3 before expiry
- All sensitive operations use HTTPS only

---

## File Structure

```
public/
  └─ auth.html (Enhanced authentication UI)
functions/
  ├─ index.js (Cloud Functions)
  └─ package.json (Dependencies)
```

---

## Testing Email Sending

Test Cloud Functions locally:
```bash
firebase emulators:start --only functions
```

Then test the functions using Firebase Console or the emulator UI.

---

## Next Steps

1. Update Firebase config in auth.html
2. Set up Cloud Functions with Gmail credentials
3. Deploy functions to Firebase
4. Configure Firestore security rules
5. Test registration and login flows
6. Customize email templates in Firebase Console

