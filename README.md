# SD24 LIB - Premium Digital Library

A modern, responsive digital library application built with React and Firebase.

## 🚀 Features

- **User Authentication** - Email-based sign-up with verification and OTP login
- **Cloud Functions** - Serverless backend for email notifications
- **Responsive Design** - Mobile-first approach with modern UI
- **Real-time Database** - Firebase Firestore integration
- **Digital Library** - Browse and access premium digital books

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- An active Firebase project

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Configure Firebase

```bash
# Login to Firebase
firebase login

# Set your Firebase project
firebase use sd24pages-e149c
```

### 3. Environment Variables

Create a `functions/.env` file with your Gmail credentials:

```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-specific-password
```

To get a Gmail app password:
1. Visit https://myaccount.google.com/
2. Go to Security → App passwords
3. Select "Mail" and "Windows Computer"
4. Generate the password and use it in .env file

Alternatively, set environment variables in Firebase Console:

```bash
firebase functions:config:set gmail.user="your-email@gmail.com" gmail.password="your-password"
```

### 4. Build the React App

```bash
npm run build
```

This creates a `build/` directory with the production-ready app.

## 🚀 Deployment

### Deploy Everything

```bash
npm run deploy
```

This deploys both the React app to Firebase Hosting and the Cloud Functions.

### Deploy Only Functions

```bash
npm run deploy:functions
```

### Deploy Only Hosting

```bash
npm run deploy:hosting
```

## 🧪 Local Development

### Start React Development Server

```bash
npm start
```

Server runs at http://localhost:3000

### Test Cloud Functions Locally

```bash
# In another terminal
firebase emulators:start --only functions
```

Functions will be available at http://localhost:5001/sd24pages-e149c/us-central1/

## 📁 Project Structure

```
SD24-pages/
├── src/                          # React app source
│   ├── App.js                   # Main App component
│   ├── App.css                  # App styles
│   ├── index.js                 # React entry point
│   └── index.css                # Global styles
├── public/                       # Static assets
│   ├── index.html               # HTML entry point for React
│   ├── css/                     # Static stylesheets
│   ├── images/                  # Image assets
│   └── js/                      # Static JavaScript files
├── functions/                    # Firebase Cloud Functions
│   ├── index.js                 # Cloud Functions source
│   ├── package.json             # Functions dependencies
│   └── .env.example             # Environment variables template
├── firebase.json                # Firebase configuration
├── package.json                 # Root package.json
└── .firebaserc                  # Firebase project config
```

## 📧 Cloud Functions

The project includes the following Cloud Functions:

### sendWelcomeEmail
- **Trigger:** User creation in Firebase Auth
- **Purpose:** Sends welcome email to new users

### sendVerificationEmail
- **Trigger:** Call from client
- **Purpose:** Sends email verification link

### sendLoginOTP
- **Trigger:** Call from client
- **Purpose:** Generates and sends one-time password for login

### verifyLoginOTP
- **Trigger:** Call from client
- **Purpose:** Validates OTP and creates custom login token

### resendVerificationEmail
- **Trigger:** Call from client
- **Purpose:** Resends verification email to users

## 🔐 Security

- Email verification required before login
- OTP-based authentication with 5-minute expiration
- Rate limiting on OTP attempts (5 attempts max)
- Environment variables for sensitive data
- Firebase security rules configured in console

## 📱 Responsive Design

The application is fully responsive and works on:
- Mobile devices (320px and up)
- Tablets (768px and up)
- Desktops (1024px and up)

## 🐛 Troubleshooting

### Functions Deployment Issues
- Ensure Node.js version is 18 or higher: `node --version`
- Check Firebase CLI is installed: `firebase --version`
- Verify project ID: `firebase projects:list`

### Gmail Email Issues
- Ensure Gmail app password is generated (not regular password)
- Check spam folder for emails
- Verify GMAIL_USER and GMAIL_PASSWORD in environment

### React Build Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf build && npm run build`
- Check Node version compatibility

## 📝 License

This project is part of SD24 LIB.

## 🤝 Support

For issues or questions, contact the development team.
