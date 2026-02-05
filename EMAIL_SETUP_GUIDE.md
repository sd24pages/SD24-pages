# 📧 Email Setup & Troubleshooting Guide

## 🔴 Issues Fixed

### Issue 1: Sign up fails with "Sign up failed. Please try again."
**Cause:** Firebase config has placeholder values or Cloud Functions not deployed

**Solution:** See setup section below

### Issue 2: Welcome email not received
**Cause:** Gmail credentials not configured in Cloud Functions environment

**Solution:** Follow the Gmail setup steps below

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Set Your Firebase Config
Edit `public/auth.html` line 424-431:

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

**Where to find these values:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ Settings → Project Settings
4. Copy the config values from "Web apps" section

### Step 2: Set Gmail Credentials

#### 2a. Create Gmail App Password
1. Go to [Google Account](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password (with spaces)

#### 2b. Set Environment Variables

**For Firebase Functions**, set these environment variables:

```bash
# Deploy to Firebase and set variables
firebase functions:config:set gmail.user="your-email@gmail.com" gmail.password="your-app-password"
```

**Or locally in `functions/.env`:**

```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=abcd efgh ijkl mnop
```

### Step 3: Deploy Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
npm install

# Deploy to Firebase
firebase deploy --only functions

# Check deployment
firebase functions:log
```

### Step 4: Test Sign Up

1. Go to `public/auth.html` in your website
2. Create a new account with test email
3. Check browser console for errors (F12)
4. Check Gmail inbox for welcome email

---

## ✅ Verification Checklist

| Item | Status | How to Check |
|------|--------|-------------|
| **Firebase Config** | ⭐ | Navigate to auth page, no console errors |
| **Gmail Credentials** | ⭐ | `firebase functions:log` shows no auth errors |
| **Cloud Functions Deployed** | ⭐ | `firebase functions:list` shows 5+ functions |
| **Email Service Ready** | ⭐ | Create test account, check inbox in 2-5 seconds |

---

## 🐛 Troubleshooting

### Problem: Sign up page shows error
**Error:** "Sign up failed. Please try again."

**Solution:**
1. Open browser console (F12 → Console tab)
2. Look for red errors
3. Check:
   - Is Firebase config correct?
   - Are Cloud Functions deployed?
   - Check `firebase functions:log` for errors

### Problem: Welcome email not received
**Scenario:** Account created but no email arrives

**Causes & Fixes:**

**Cause 1: Gmail credentials not set**
```bash
# Check if credentials are set
firebase functions:config:get gmail

# Output should show user and password, NOT blank
```

**Fix:**
```bash
firebase functions:config:set gmail.user="your-email@gmail.com" gmail.password="your-app-password"
firebase deploy --only functions
```

**Cause 2: Using regular Gmail password (not App Password)**
- Gmail blocks "less secure apps"
- Must use **App Password**, not regular password
- App Password is 16 characters with spaces

**Fix:**
1. Enable 2-Step Verification in Google Account
2. Generate new App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Set the App Password in Firebase

**Cause 3: Email goes to spam**
- Check spam/junk folder
- Gmail may flag automated emails initially
- Whitelist support email in email client

**Cause 4: Cloud Functions not deployed**
```bash
# Check if functions exist
firebase functions:list

# Should show:
# sendWelcomeEmail
# sendVerificationEmail
# sendLoginOTP
# verifyLoginOTP
# sendEmailVerificationLink
```

**Fix:** Deploy functions
```bash
firebase deploy --only functions
```

### Problem: "Email service is not configured" error

**Cause:** Gmail credentials not set in Cloud Functions environment

**Fix:**
```bash
# Set credentials
firebase functions:config:set gmail.user="your@gmail.com" gmail.password="your-app-password"

# Redeploy
firebase deploy --only functions
```

### Problem: Can't find App Password in Google Account

**Cause:** 2-Step Verification not enabled

**Fix:**
1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Follow the setup process
4. Then go to [App Passwords](https://myaccount.google.com/apppasswords)

---

## 📊 Email Flow Diagram

```
User clicks "Sign Up"
        ↓
Enter name, email, password
        ↓
Click "Sign Up" button
        ↓
Firebase Auth creates user
        ↓
Cloud Function triggered: sendWelcomeEmail()
        ↓
Gmail credentials validated
        ↓
Nodemailer sends HTML email
        ↓
User receives "Welcome to SD24 LIB" email
        ↓
showVerificationEmail function called
        ↓
Send verification email with link
        ↓
User clicks link in email to verify
        ↓
Account fully activated!
```

---

## 🔧 Configuration Files

### `functions/.env` (Local Development)

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=abcd efgh ijkl mnop

# Firebase (optional, auto-configured)
FIREBASE_PROJECT_ID=your-project-id
```

⚠️ **Never commit .env to Git!** Add to `.gitignore`

### `functions/index.js` (Cloud Function Config)

The code automatically:
- Checks if Gmail credentials are set
- Logs warnings if email service is unavailable
- Sends detailed error messages to console
- Gracefully handles email failures

---

## 📧 Email Templates

### Welcome Email (Sent on signup)
- From: Your Gmail address
- Subject: "Welcome to SD24 LIB - Your Digital Library"
- Contains: Account details, call to action

### Verification Email (Sent on signup)
- From: Your Gmail address
- Subject: "Verify Your SD24 LIB Account"
- Contains: Verification link, email address

### OTP Email (Sent on login)
- From: Your Gmail address
- Subject: "Your SD24 LIB Login Code"
- Contains: 6-digit code with expiry time

---

## 🚨 Common Error Messages & Fixes

| Error Message | Cause | Fix |
|---------------|-------|-----|
| "Email service is not configured" | Gmail credentials missing | Run `firebase functions:config:set` |
| "Invalid credentials" | Wrong Gmail/App Password | Use correct App Password (16 chars) |
| "SMTP connection failed" | Gmail account issue | Enable 2-Step Verification |
| "Email not sent" | Firestore/Firebase issue | Check Firebase project setup |
| "Function not found" | Cloud Functions not deployed | Run `firebase deploy --only functions` |

---

## 🔍 Debug Mode

### Enable Detailed Logging

**In browser console (F12):**
```javascript
// See all Firebase operations
firebase.auth().onAuthStateChanged(user => {
    console.log('Auth state:', user);
});

// See all function calls
console.log('Calling sendVerificationEmail...');
```

**In Cloud Functions (Terminal):**
```bash
# View live logs
firebase functions:log

# View logs from last 24 hours
firebase functions:log --limit 50
```

---

## ✨ Best Practices

### 1. **Use App Passwords, Not Regular Passwords**
- Regular password = Gmail blocks it
- App Password = Secure, auto-generated for apps

### 2. **Store Gmail Credentials Securely**
- Never hardcode in source files
- Use Firebase Environment Config
- Add .env to .gitignore

### 3. **Test Signup Flow Regularly**
- Create test accounts
- Check for welcome emails
- Monitor Cloud Function logs

### 4. **Monitor Email Delivery**
- Set up email delivery alerts
- Check spam folder regularly
- Test across different email providers

### 5. **Have Fallback Plan**
- If emails fail, show user clear message
- Account still created (user can verify later)
- Provide contact support option

---

## 📞 Support & Help

### Still Having Issues?

1. **Check Firebase Project Setup**
   - Authentication enabled ✓
   - Firestore enabled ✓
   - Cloud Functions API enabled ✓

2. **Verify Cloud Functions**
   ```bash
   firebase functions:list
   firebase functions:log
   ```

3. **Test Email Sending**
   ```bash
   firebase deploy --only functions
   # Create test account on website
   # Check function logs for errors
   ```

4. **Check Gmail Configuration**
   - [Gmail Security Settings](https://myaccount.google.com/security)
   - [App Passwords Page](https://myaccount.google.com/apppasswords)

---

## 🎓 Next Steps

After setting up emails:

1. ✅ Test sign up with multiple accounts
2. ✅ Verify welcome emails are received
3. ✅ Test email verification link
4. ✅ Test OTP login flow
5. ✅ Deploy to production
6. ✅ Monitor Cloud Function logs

---

**Status:** ✅ Email system ready for production when configured

**Last Updated:** February 5, 2026
