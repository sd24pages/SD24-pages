# New User Login Troubleshooting Guide

## The Issue: New Users Can't Login

### Symptoms:
- ❌ User can sign up successfully
- ❌ User tries to login and gets: "Email not verified. Please verify your email first."
- ✅ BUT user never received verification email OR clicked link didn't work

### Root Cause (FIXED):
The old verification system sent users to a custom endpoint (`/verify`) that didn't exist. We've replaced this with Firebase's official verification link system.

---

## Step-by-Step Verification Flow

### Phase 1: Sign Up
```
User Action: Click "Sign Up" button
↓
Backend: Create Firebase Auth user
↓
Backend: Send Welcome Email (informational)
↓
Backend: Send Verification Email (with official Firebase link)
↓
Frontend: Show message "Check your email to verify your account"
```

### Phase 2: Email Verification
```
User Action: Find email from noreply@firebase.google.com
↓
User Action: Click "Verify Email Address" button
↓
Firebase: Automatically sets emailVerified = true
↓
Browser: Redirects to Firebase confirmation page
↓
User Action: Return to login page (manual or auto-redirect)
```

### Phase 3: OTP Login
```
User Action: Enter email + password
↓
Backend: Check if emailVerified = true
↓
IF verified: Send OTP to email
↓
IF NOT verified: Show error "Email not verified"
↓
User Action: Enter 6-digit OTP from email
↓
Backend: Validate OTP
↓
Backend: Create login session
↓
Frontend: Redirect to dashboard
```

---

## Checklist: Is the Fix Working?

### ✅ Check 1: Firebase Console
```
1. Go to: https://console.firebase.google.com
2. Select project: sd24pages-e149c
3. Go to: Authentication → Users
4. Find test user
5. Check: Email Verified = [✓ or ✗]
```

**Expected:** After user clicks verification link, this should show ✓

### ✅ Check 2: Cloud Functions Deployed
```bash
firebase functions:list
```

**Expected output includes:**
```
✔  sendWelcomeEmail
✔  sendVerificationEmail (UPDATED)
✔  sendLoginOTP (UPDATED)
✔  verifyLoginOTP (UPDATED)
✔  resendVerificationEmail (NEW!)
✔  sendEmailVerificationLink
```

### ✅ Check 3: Function Logs
```bash
firebase functions:log
```

**For successful signup → verification → login:**
```
📧 Welcome email sent to: user@example.com
📧 Verification email sent to: user@example.com
[User clicks link in email]
🔑 Login attempt for: user@example.com
👤 User found: user@example.com EmailVerified: true
✓ Email verified for: user@example.com Sending OTP...
📧 Sending OTP email to: user@example.com
✓ OTP email sent to: user@example.com
🔐 OTP verification attempt for: user@example.com
👤 User found: user@example.com EmailVerified: true
✓ OTP verified for: user@example.com
✓ Login token created for: user@example.com
```

**For failures:**
```
⚠️ Email not verified for: user@example.com
❌ Error sending verification email: [reason]
❌ Invalid OTP for user@example.com. Attempts: 1
```

### ✅ Check 4: Test Complete Flow
```
STEP 1: Sign up at https://sd24lib.com/auth.html
  - Email: testuser-001@example.com
  - Password: TestPass123!
  - Expected: Success page with "Check your email" message
  
STEP 2: Check email inbox
  - Look in main inbox (not spam)
  - Look for email from: noreply@firebase.google.com
  - Subject should contain: "Verify your email"
  
STEP 3: Click verification link
  - Click the button or link in email
  - Firebase page should appear
  - Click "Verify Email" again if needed
  
STEP 4: Check Firebase Console
  - Refresh https://console.firebase.google.com/project/sd24pages-e149c/authentication/users
  - Find testuser-001@example.com
  - Verify: Email Verified = ✓
  
STEP 5: Login with OTP
  - Go to https://sd24lib.com/auth.html
  - Enter: testuser-001@example.com + TestPass123!
  - Click: "Login"
  - Expected: "OTP sent to your email" message
  
STEP 6: Enter OTP
  - Check email inbox again
  - Find email from: sd24lib@example.com
  - Subject: "Your SD24 LIB Login Code"
  - Copy 6-digit code
  - Paste in login screen
  - Click: "Verify OTP"
  - Expected: Redirect to dashboard
```

---

## Common Issues & Solutions

### ❌ Issue 1: "Email not verified" after clicking link

**Check these:**

1. **Did user click the link?**
   - Check email inbox (including spam folder)
   - Verify sender: noreply@firebase.google.com
   - Link should have long URL starting with: https://firebase.google.com/auth/action

2. **Did Firebase process the click?**
   - Wait 30 seconds
   - Go to Firebase Console
   - Check if "Email Verified" is now ✓
   - Try login again

3. **Is email service working?**
   - Run: `firebase functions:log`
   - Look for: `📧 Verification email sent to: user@email.com`
   - If missing, email service might be down

4. **Try manual resend:**
   - Look for "Resend Verification Email" button
   - Or create a helper function:
     ```javascript
     // Add this to auth.html if resend button doesn't exist
     async function resendVerificationEmail() {
       const email = document.getElementById('email').value;
       try {
         const response = await firebase.functions().httpsCallable('resendVerificationEmail')({ email });
         alert('Verification email sent!');
       } catch (error) {
         alert('Error: ' + error.message);
       }
     }
     ```

### ❌ Issue 2: Verification email never arrives

**Check these:**

1. **Check spam/junk folder**
   - Gmail: Check "Promotions", "Social", "Spam" tabs
   - Add noreply@firebase.google.com to contacts

2. **Check email service logs**
   ```bash
   firebase functions:log | grep -i verification
   ```
   
   **Expected:**
   ```
   📧 Verification email sent to: user@email.com
   ✓ Verification email sent
   ```
   
   **Problem:**
   ```
   ⚠️ Email service not available
   ❌ Error sending verification email: [reason]
   ```

3. **Is Gmail configured?**
   - Check `functions/.env` has:
     ```
     GMAIL_USER=your-email@gmail.com
     GMAIL_PASSWORD=your-app-password
     ```
   - Run: `firebase functions:log`
   - Look for: `❌ Email service validation failed`

4. **Gmail App Password issues?**
   - Go to: https://myaccount.google.com/apppasswords
   - Generate new app password
   - Update `functions/.env`
   - Redeploy: `firebase deploy --only functions`

### ❌ Issue 3: "OTP not found. Please request a new login code."

**Causes and solutions:**

1. **OTP expired (5-minute timeout)**
   - Click "Login" again
   - Request new OTP
   - Enter new code within 5 minutes

2. **Wrong email address**
   - Make sure email matches signup email
   - Check for typos

3. **OTP already used**
   - Once you verify OTP, it's deleted
   - Must request new OTP for next login

### ❌ Issue 4: "Too many incorrect attempts"

**Cause:** User entered wrong OTP 5+ times

**Solution:**
1. User must click "Request new login code"
2. New OTP sent to email
3. Use new code

**To reset for a test user:**
```javascript
// Run in Firebase Console
db.collection('otps').doc('user@email.com').delete()
```

### ❌ Issue 5: Session doesn't auto-logout after 15 minutes

**Check these:**

1. **Is session-manager.js loaded?**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Type: `SessionManager`
   - Should show: `class SessionManager { ... }`

2. **Is JavaScript enabled?**
   - Some browsers/extensions block JavaScript
   - Try in incognito/private mode

3. **Are page event listeners working?**
   - Open DevTools Console
   - Move mouse or click
   - No errors should appear

4. **Try manual test:**
   - Add this to browser console:
     ```javascript
     // Test if SessionManager exists
     if (typeof SessionManager !== 'undefined') {
       console.log('✓ SessionManager loaded');
     } else {
       console.log('❌ SessionManager not loaded');
     }
     ```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      SIGN UP FLOW                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User → Sign Up Page                                    │
│     ↓                                                       │
│  2. Frontend → Firebase Auth (create user)                 │
│     ↓                                                       │
│  3. Firebase → Cloud Function (onUserCreate)               │
│     ↓                                                       │
│  4. Cloud Function → Send Welcome Email                    │
│     ↓                                                       │
│  5. Cloud Function → Send Verification Email                │
│     ↓                                                       │
│  6. Firebase → Sets custom claim (optional)                │
│     ↓                                                       │
│  7. Frontend → Show "Check your email" message             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              EMAIL VERIFICATION FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User → Checks email inbox                              │
│     ↓                                                       │
│  2. User → Clicks verification link (Firebase link)        │
│     ↓                                                       │
│  3. Firebase Auth → Sets emailVerified = true              │
│     ↓                                                       │
│  4. Firebase → Redirects to confirmation page              │
│     ↓                                                       │
│  5. User → Returns to login page                           │
│                                                             │
│  NOTE: emailVerified is now set in Firebase Auth           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                OTP LOGIN FLOW                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User → Login Page (email + password)                   │
│     ↓                                                       │
│  2. Frontend → Verify password with Firebase               │
│     ↓                                                       │
│  3. Cloud Function → sendLoginOTP called                   │
│     ↓                                                       │
│  4. Check emailVerified = true ✓                           │
│     ↓                                                       │
│  5. Generate 6-digit OTP                                   │
│     ↓                                                       │
│  6. Store OTP in Firestore (5-min expiry)                  │
│     ↓                                                       │
│  7. Send OTP email to user                                 │
│     ↓                                                       │
│  8. Frontend → Show "Enter OTP" screen                     │
│     ↓                                                       │
│  9. User → Enters 6-digit code                             │
│     ↓                                                       │
│  10. Cloud Function → verifyLoginOTP called                │
│     ↓                                                       │
│  11. Validate OTP (not expired, correct code)              │
│     ↓                                                       │
│  12. Create Firebase custom token                          │
│     ↓                                                       │
│  13. Frontend → Set auth token in localStorage             │
│     ↓                                                       │
│  14. Frontend → Redirect to dashboard                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Commands

### Test Sign Up (Backend):
```bash
# Call sendWelcomeEmail directly
firebase functions:shell
> sendWelcomeEmail({email: 'test@example.com'})
```

### Test Verification Email:
```bash
firebase functions:shell
> sendVerificationEmail({email: 'test@example.com'})
```

### Test OTP:
```bash
firebase functions:shell
> sendLoginOTP({email: 'test@example.com'})
```

### Check Firestore OTP:
```bash
firebase firestore:shell
> db.collection('otps').doc('test@example.com').get()
```

---

## When to Escalate

Contact support if:

1. **Email service fails consistently**
   - Issue: `❌ Error sending emails` in logs
   - Check: Gmail credentials in `functions/.env`

2. **Firebase authentication issues**
   - Issue: `auth/` error codes in logs
   - Check: Firebase project ID in `.firebaserc`

3. **Database connection issues**
   - Issue: Firestore errors in logs
   - Check: Firestore database exists and has proper rules

4. **Deployment fails**
   - Issue: `firebase deploy` returns error
   - Try: `firebase deploy --force`

---

## Success Indicators

✅ Everything is working when:

1. User can sign up without errors
2. Verification email arrives within 2-5 seconds
3. Clicking link sets emailVerified = true in Firebase
4. Login page now shows OTP screen instead of error
5. OTP email arrives within 2-5 seconds
6. Entering OTP redirects to dashboard
7. Dashboard loads successfully
8. Auto-logout happens after 15 minutes of inactivity
9. Function logs show only ✓ and 📧 messages (no ❌)

