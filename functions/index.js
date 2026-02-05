const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Email configuration
const getTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_PASSWORD;
  
  if (!gmailUser || !gmailPassword) {
    console.warn('⚠️ Gmail credentials not configured. Email features disabled.');
    console.warn('Set GMAIL_USER and GMAIL_PASSWORD in environment variables.');
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });
};

const transporter = getTransporter();

// Generate OTP (6 digits)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send Welcome Email
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  console.log('🎉 New user created:', user.email);
  
  if (!transporter) {
    console.warn('⚠️ Email service not available. Welcome email skipped for:', user.email);
    return;
  }
  
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: 'Welcome to SD24 LIB - Your Digital Library',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to SD24 LIB</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 12px 12px;">
          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Hello ${user.displayName || 'User'},
          </p>
          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Thank you for joining SD24 LIB, your premium digital library! We're excited to have you on board.
          </p>
          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            You now have access to thousands of premium digital books and resources. Your account is all set up and ready to explore!
          </p>
          <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #6366f1;">
            <p style="color: #4f46e5; font-weight: bold; margin: 0 0 10px 0;">Account Details:</p>
            <p style="color: #1f2937; margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="color: #1f2937; margin: 5px 0;"><strong>Status:</strong> Active</p>
          </div>
          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Happy reading! If you have any questions, feel free to reach out to our support team.
          </p>
          <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            Best regards,<br/>
            <strong>The SD24 LIB Team</strong>
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✓ Welcome email sent to:', user.email);
  } catch (error) {
    console.error('❌ Error sending welcome email to', user.email, ':', error.message);
  }
});

// Send Verification Email
exports.sendVerificationEmail = functions.https.onCall(async (data, context) => {
  const { email, displayName } = data;

  if (!transporter) {
    throw new functions.https.HttpsError('failed-precondition', 
      'Email service is not configured. Contact support for assistance.');
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Verify Your SD24 LIB Account',
    html: `
      <div style="font-family: 'Plus Jakarta Sans', Arial; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
        </div>
        <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 12px 12px;">
          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Hi ${displayName || 'User'},
          </p>
          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
            Thank you for registering with SD24 LIB. To complete your account setup and start exploring our digital library, please verify your email address.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Click the button below to verify your email:</p>
            <a href="https://sd24lib.com/verify?email=${encodeURIComponent(email)}" 
               style="display: inline-block; background: #6366f1; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 30px 0;">
            Or copy and paste this link in your browser:<br/>
            <code style="background: #e5e7eb; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 10px; word-break: break-all;">
              https://sd24lib.com/verify?email=${encodeURIComponent(email)}
            </code>
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            This link will expire in 24 hours. If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    `
  };

  try {
    console.log('📧 Sending verification email to:', email);
    await transporter.sendMail(mailOptions);
    console.log('✓ Verification email sent to:', email);
    return { success: true, message: 'Verification email sent' };
  } catch (error) {
    console.error('Error sending verification email:', error);
  } catch (error) {
    console.error('❌ Error sending verification email to', email, ':', error.message);
    throw new functions.https.HttpsError('internal', 'Failed to send verification email. Please try again.');
  }
});

// Send OTP for Login (with credential verification)
exports.sendLoginOTP = functions.https.onCall(async (data, context) => {
  const { email } = data;

  try {
    // Verify user exists and email is registered
    const user = await admin.auth().getUserByEmail(email);
    
    // Check if email is verified
    if (!user.emailVerified) {
      throw new functions.https.HttpsError('permission-denied', 'Email not verified. Please verify your email first.');
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

    // Store OTP in Firestore
    await admin.firestore().collection('otps').doc(email).set({
      otp: otp,
      expiresAt: expiresAt,
      attempts: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Your SD24 LIB Login Code',
      html: `
        <div style="font-family: 'Plus Jakarta Sans', Arial; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Your Login Code</h1>
          </div>
          <div style="background: #f8fafc; padding: 40px; border-radius: 0 0 12px 12px;">
            <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
              Your one-time password (OTP) for SD24 LIB login is:
            </p>
            <div style="background: #e0e7ff; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px solid #6366f1;">
              <p style="font-size: 14px; color: #6b7280; margin: 0 0 15px 0;">Enter this code to verify your identity:</p>
              <p style="font-size: 48px; font-weight: 800; color: #6366f1; margin: 0; letter-spacing: 10px;">
                ${otp.slice(0, 3)} ${otp.slice(3, 6)}
              </p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>⏱️ This code expires in 5 minutes.</strong> Do not share this code with anyone.
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              If you didn't request this code, please ignore this email or contact our support team.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { 
      success: true, 
      message: 'OTP sent to your email',
      expiresIn: 300 // 5 minutes in seconds
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new functions.https.HttpsError('not-found', 'User not found');
  }
});

// Verify OTP (and log user in)
exports.verifyLoginOTP = functions.https.onCall(async (data, context) => {
  const { email, otp } = data;

  try {
    // Verify user exists and email is verified
    const user = await admin.auth().getUserByEmail(email);
    if (!user.emailVerified) {
      throw new functions.https.HttpsError('permission-denied', 'Email not verified');
    }

    const otpDoc = await admin.firestore().collection('otps').doc(email).get();

    if (!otpDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'OTP not found or expired');
    }

    const otpData = otpDoc.data();

    // Check if OTP expired
    if (Date.now() > otpData.expiresAt) {
      await otpDoc.ref.delete();
      throw new functions.https.HttpsError('unauthenticated', 'OTP has expired');
    }

    // Check attempts
    if (otpData.attempts >= 3) {
      await otpDoc.ref.delete();
      throw new functions.https.HttpsError('permission-denied', 'Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      await otpDoc.ref.update({
        attempts: admin.firestore.FieldValue.increment(1)
      });
      throw new functions.https.HttpsError('unauthenticated', 'Invalid OTP');
    }

    // OTP verified - delete it
    await otpDoc.ref.delete();

    // Log the login event
    await admin.firestore().collection('users').doc(user.uid).update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      loginAttempts: 0
    }).catch(() => {});

    // Create custom token for login
    const customToken = await admin.auth().createCustomToken(user.uid);

    return {
      success: true,
      message: 'OTP verified successfully',
      token: customToken,
      userId: user.uid,
      email: user.email
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
});

// Send Email Verification Link
exports.sendEmailVerificationLink = functions.https.onCall(async (data, context) => {
  const { uid } = data;

  try {
    const link = await admin.auth().generateEmailVerificationLink(uid);
    return { success: true, link };
  } catch (error) {
    console.error('Error generating verification link:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate verification link');
  }
});
