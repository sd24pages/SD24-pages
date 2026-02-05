# 🚀 Email Setup - Quick Start (5 Steps)

## Step 1: Update Firebase Config ⚙️
**File:** `public/auth.html` (lines 424-431)

Replace placeholder values with your actual Firebase config:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**Get from:** [Firebase Console](https://console.firebase.google.com) → Project Settings

---

## Step 2: Get Gmail App Password 📧

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" (if not done)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password with spaces

**Example:** `abcd efgh ijkl mnop`

---

## Step 3: Set Firebase Credentials 🔐

Run this ONE command in your terminal:

```bash
firebase functions:config:set gmail.user="your-email@gmail.com" gmail.password="your-app-password"
```

Replace:
- `your-email@gmail.com` - Your Gmail address
- `your-app-password` - The 16-character password from Step 2

---

## Step 4: Deploy Cloud Functions 🚀

```bash
firebase deploy --only functions
```

---

## Step 5: Test Sign Up ✅

1. Go to your website `/auth.html`
2. Click "Create Account"
3. Fill in form and click "Sign Up"
4. **Check your email inbox** in 2-5 seconds
5. Should see "Welcome to SD24 LIB" email

---

## 🎯 What Happens Now

| Step | What Happens | Expected Result |
|------|--------------|-----------------|
| User clicks "Sign Up" | Account created in Firebase | No error on screen |
| Cloud Function triggered | Welcome email sent automatically | Email arrives in 2-5 seconds |
| Verification email sent | Email with verification link | Second email arrives |
| User verifies email | Account fully activated | User can now login with OTP |

---

## ⚠️ If Emails Don't Arrive

### Check 1: Gmail Credentials Set?
```bash
firebase functions:config:get gmail
```
Should show user and password. If empty, run Step 3 again.

### Check 2: Cloud Functions Deployed?
```bash
firebase functions:log
```
Should show recent function calls. If empty, run Step 4 again.

### Check 3: Check Spam Folder
Gmail may filter automated emails to spam initially.

### Check 4: Enable 2-Step on Gmail
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Turn ON "2-Step Verification"

---

## 🆘 Error Messages & Fixes

| Error | Fix |
|-------|-----|
| "Email service is not configured" | Run Step 3 again |
| "Invalid credentials" | Check App Password is correct (16 chars) |
| "SMTP connection failed" | Enable 2-Step Verification on Google Account |
| Signup succeeds but no email | Check `firebase functions:log` |
| Email in spam folder | Whitelist in your email client |

---

## ✨ After Setup Works

**Emails will be sent for:**
- ✅ New user signup (Welcome email)
- ✅ Email verification (Verification link)
- ✅ Login attempts (6-digit OTP code)
- ✅ Password reset (If implemented)

**All emails** come from your Gmail address configured in Step 3.

---

## 🔄 Redeploy After Changes

After any code changes to `functions/index.js`:
```bash
firebase deploy --only functions
```

After any changes to `public/auth.html`:
```bash
# No deploy needed - changes go live immediately
```

---

## 📞 Need More Help?

See full guide: **EMAIL_SETUP_GUIDE.md**

Contains:
- Complete troubleshooting section
- Error message reference
- Email flow diagram
- Best practices
- Debug mode instructions

---

**Status:** ✅ Ready to setup in 5 minutes
