# Cloud Photo Gallery

> **A modern, full-stack MERN application for securely storing, organizing, managing, and sharing your photos and precious memories in the cloud.**

**Author:** [Raj Kapoor Jaiswal](https://github.com/rajkapoor-jaiswal)  
**Repository:** [https://github.com/rajkapoor-jaiswal/cloud-photo-gallery](https://github.com/rajkapoor-jaiswal/cloud-photo-gallery)  
**License:** [MIT License](LICENSE)  

---

## Table of Contents

- [Overview](#overview)
- [Project Purpose & Problem Solved](#project-purpose--problem-solved)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Gmail SMTP & OTP Configuration](#gmail-smtp--otp-configuration)
- [Commands & Scripts](#commands--scripts)
- [API Reference](#api-reference)
- [Security & Authentication](#security--authentication)
- [Troubleshooting](#troubleshooting)
- [Author](#author)
- [License](#license)

---

## Overview

**Cloud Photo Gallery** is a production-grade web application built using the **MERN Stack** (MongoDB, Express, React, Node.js). It delivers a seamless, responsive platform for personal media management, enabling users to upload high-resolution photos, organize them into custom albums, flag favorites, view storage analytics, and interact with contacts through direct in-app photo sharing and messaging.

Designed with a modern dark navy-blue and cyan aesthetic, glassmorphism UI components, and real-time security indicators, Cloud Photo Gallery provides a complete personal cloud workspace.

---

## Project Purpose & Problem Solved

### The Problem
Traditional photo storage solutions are often fragmented across multiple devices, lack granular privacy controls, complicate sharing with family and friends, or expose user data to intrusive third-party ads.

### The Solution
**Cloud Photo Gallery** solves these challenges by providing:
- **Centralized Cloud Vault:** Store all high-resolution images safely in one place with a 5 GiB storage quota.
- **Privacy & Security First:** End-to-end access tokens, bcrypt password hashing, SHA-256 OTP verification, and custom privacy controls.
- **Effortless Organization:** Smart albums, tag search, favorites collection, and a safety trash bin with restore capabilities.
- **Direct Collaboration:** Share photos directly via secure in-app messaging or custom share links with recipient permissions.

---

## Key Features

### 🌟 Public Home & Landing Page
- Modern dark navy-blue background (`#060b18`) with glowing cyan lighting accents.
- Hero section: *"Your memories, safe in the cloud."*
- Interactive photo gallery preview cards with real-time status indicators.
- Feature cards highlighting **Secure Cloud Storage**, **Organize Your Photos**, and **Share With Anyone**.
- Responsive layout optimized for desktop, tablet, and mobile browsers.

### 🔐 Authentication & Security
- **Email & Password Authentication:** Standard sign-in/sign-up with password strength validation.
- **Secure Forgot Password with Email OTP Verification:**
  - Cryptographically secure 6-digit OTP generation (`crypto.randomInt`).
  - SHA-256 hashed OTP persistence (raw OTP is never stored in the database).
  - 10-minute code expiration and 60-second request rate-limiting cooldown.
  - 5-attempt lockout limit before OTP invalidation.
  - Single-use `resetSessionToken` issued upon successful verification.
  - Password hashing with `bcrypt` (cost 12) and automatic session invalidation upon reset.
- **OAuth 2.0 Integration:** Google and GitHub single sign-on (SSO).
- **Session Protection:** Dual JWT token architecture (Short-lived Access Tokens + Secure Refresh Tokens).
- **Security Audit Log:** User activity history tracking logins, security settings changes, and uploads.

### 📸 Photo Workspace & Gallery
- **Smart Duplicate Photo Detection:** SHA-256 binary hash detection before saving new images to detect exact duplicates and visually similar photos per user vault. Prompts user with 3 actions: *Skip Duplicate*, *Upload Anyway*, and *Cancel*.
- **5 GiB Storage Quota:** Real-time quota math (5,368,709,120 bytes) enforcing storage limits before uploads.
- **Multi-File & Camera Uploads:** File upload wizard and camera capture integration with live progress tracking and thumbnail previews.
- **Shared Photos Management:** Granular recipient actions including "Remove from Shared with Me" without modifying owner attribution or original files.
- **Image Editing & Transformations:** Crop, rotate, resize, watermark, and image quality optimization.
- **Fullscreen Image Viewer:** Slideshow mode, zoom controls, and keyboard navigation (`ArrowLeft`, `ArrowRight`, `Esc`).
- **Soft Delete & Trash Recovery:** Safely move photos to trash before permanent deletion.
- **Advanced Search & Filtering:** Filter by text search, tags, album, owner, date created, file type, newest, oldest, favorites, and likes.

### 📁 Smart Collections & Albums
- **Custom Albums:** Create albums with custom covers, descriptions, and privacy visibility settings.
- **Favorites & Downloads Collections:** Quick access to bookmarked memories and download history.

### 💬 Social & Messaging
- **Direct Messaging:** Built-in chat interface for user-to-user direct messages.
- **In-Chat Photo Sharing:** Send photos directly from your gallery or camera into active message conversations.

### 📊 Dashboard & Storage Analytics
- **Storage Monitoring:** Displays accurate user-specific storage usage, remaining capacity, and total image counts.
- **Activity Metrics:** Overview of recent uploads, total albums, favorite counts, and shared items.

---

## Technology Stack

### Frontend (`client/`)
- **Core:** React 16 (SPA)
- **Routing:** React Router 5 (`react-router-dom`)
- **State Management:** Redux, React-Redux, Redux-Thunk
- **UI Framework:** Material-UI (`@material-ui/core`, `@material-ui/icons`)
- **Animations:** Framer Motion (`framer-motion`)
- **Iconography:** Lucide Icons (`lucide-react`)
- **HTTP Client:** Axios

### Backend (`server/`)
- **Runtime:** Node.js (>= 18.x)
- **Web Framework:** Express.js (ES Modules)
- **Database:** MongoDB & Mongoose ORM
- **Email Delivery:** Nodemailer (Gmail SMTP transport)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), Bcrypt (`bcryptjs`)
- **Middleware:** Body-Parser, CORS, Dotenv, Custom Security Middleware (Rate Limiter, Security Headers, Input Sanitization)

### Storage & Media Engine
- **Base64 Engine:** Native data-URI storage fallback.
- **Cloudinary Integration:** Cloudinary SDK support for cloud CDN delivery and image transformations.

---

<img width="1536" height="1024" alt="Cloud Photo Gallery Architecture" src="https://github.com/user-attachments/assets/d215acd3-20cd-4623-a430-b3cae10f61cf" />


## Prerequisites

Ensure you have the following installed on your local development machine:

- **Node.js:** `v18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm:** `v8.0.0` or higher (comes bundled with Node)
- **MongoDB:** A local MongoDB instance (`mongodb://127.0.0.1:27017`) OR a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string.

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rajkapoor-jaiswal/cloud-photo-gallery.git
cd cloud-photo-gallery
```

### 2. Set Up the Backend Server

```bash
cd server

# Create environment configuration file from template
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

The server will start on `http://localhost:3001` and connect to MongoDB.

### 3. Set Up the Frontend Client

Open a new terminal window:

```bash
cd client

# Install dependencies
npm install

# Start development server
npm start
```

The React development server will automatically open on `http://localhost:3000`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `3001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/memories` |
| `JWT_SECRET` | Secret key for access tokens | `your-jwt-access-secret-key` |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | `your-jwt-refresh-secret-key` |
| `JWT_EXPIRES_IN` | Access token expiration duration | `15m` |
| `CLIENT_URL` | Allowed CORS origin URL | `http://localhost:3000` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `465` |
| `SMTP_SECURE` | Enable SSL/TLS | `true` |
| `SMTP_USER` | Sender Gmail address | `your_registered_sender@gmail.com` |
| `SMTP_PASS` | 16-character Google App Password | `your_16_character_app_password` |
| `EMAIL_FROM` | Sender display name & address | `Cloud Photo Gallery <your_registered_sender@gmail.com>` |
| `GOOGLE_CLIENT_ID` | *(Optional)* Google OAuth Client ID | `your_google_client_id` |
| `GOOGLE_CLIENT_SECRET` | *(Optional)* Google OAuth Client Secret | `your_google_client_secret` |
| `GITHUB_CLIENT_ID` | *(Optional)* GitHub OAuth Client ID | `your_github_client_id` |
| `GITHUB_CLIENT_SECRET` | *(Optional)* GitHub OAuth Client Secret | `your_github_client_secret` |
| `CLOUDINARY_CLOUD_NAME` | *(Optional)* Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | *(Optional)* Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | *(Optional)* Cloudinary API secret | `your_api_secret` |

---

## Gmail SMTP & OTP Configuration

To enable real OTP email delivery for the Forgot Password feature:

1. Enable **2-Step Verification** on your Google Account: [https://myaccount.google.com/security](https://myaccount.google.com/security)
2. Generate a 16-character **App Password**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Add your email and 16-character App Password to `server/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your_registered_sender@gmail.com
   SMTP_PASS=your_16_character_google_app_password
   EMAIL_FROM=Cloud Photo Gallery <your_registered_sender@gmail.com>
   ```
4. Verify your connection using the included diagnostic script:
   ```bash
   cd server
   node testSmtpConnection.js
   ```

---

## Commands & Scripts

### Server Commands (`server/`)

```bash
# Start server in production mode
npm start

# Start server in development mode with nodemon
npm run dev

# Run SMTP connection test
node testSmtpConnection.js

# Run Forgot Password OTP & Security test suite
node testForgotPasswordOtp.js

# Run Duplicate Detection test suite
node testDuplicateDetection.js

# Run Photo Sharing & Storage Quota test suite
node testNewFeatures.js
```

### Client Commands (`client/`)

```bash
# Start React development server
npm start

# Create optimized production build
npm run build

# Execute React test runner
npm test
```

---

## API Reference

### Authentication & User Routes (`/user`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/user/signin` | Authenticate user & return JWT tokens | No |
| `POST` | `/user/signup` | Register new user account | No |
| `POST` | `/user/otp/send` | Send 6-digit OTP to user email | No |
| `POST` | `/user/otp/verify` | Verify 6-digit OTP code & issue reset token | No |
| `POST` | `/user/forgot-password` | Alias for `/user/otp/send` | No |
| `POST` | `/user/reset-password` | Reset password using verified session token | No |
| `POST` | `/user/logout` | Revoke session & clear refresh token | Yes |
| `POST` | `/user/logout-all` | Terminate all active sessions across devices | Yes |
| `GET` | `/user/storage` | Fetch current user storage usage metrics | Yes |
| `GET` | `/user/audit-log` | Retrieve user security audit events | Yes |

### Post & Photo Routes (`/posts`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/posts` | Fetch paginated & filtered user photos | Yes |
| `POST` | `/posts` | Create new photo entry (base64/Cloudinary) | Yes |
| `PUT` | `/posts/:id` | Update photo details or transformations | Yes |
| `DELETE` | `/posts/:id` | Soft delete photo (move to trash) | Yes |
| `POST` | `/posts/:id/like` | Like or unlike a photo | Yes |
| `POST` | `/posts/:id/favorite` | Toggle photo favorite status | Yes |

### Direct Messaging Routes (`/messages`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/messages` | Fetch active user conversations | Yes |
| `POST` | `/messages` | Send direct message or share photo | Yes |

---

## Security & Authentication

- **SHA-256 Hashed OTPs:** One-time passwords are stored strictly as SHA-256 hashes with 10-minute expiry and rate limiting.
- **JWT Dual-Token Security:** Short-lived access tokens (15 mins) combined with secure refresh tokens.
- **Bcrypt Password Hashing:** Passwords are hashed with salt rounds (`bcrypt` cost 12) before persistence.
- **Security Headers:** Express server enforces security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- **Rate Limiting:** Prevents brute-force authentication and API flooding.
- **Input Sanitization:** Cleans incoming request payloads against query injection attacks.

---

## Troubleshooting

### 1. Node.js `ERR_OSSL_EVP_UNSUPPORTED` Error
If running Node.js `v17+` on Windows/Linux during `npm start` or `npm run build`, use `NODE_OPTIONS=--openssl-legacy-provider`.

### 2. MongoDB Connection Error
- **Symptom:** `MongoDB Connection Error: MongooseServerSelectionError`
- **Fix:** Verify MongoDB is running locally (`mongod`), or check that your `MONGODB_URI` string in `server/.env` has valid credentials and that your IP address is whitelisted in MongoDB Atlas.

### 3. SMTP Delivery Error
- **Symptom:** `[SMTP ERROR] Missing SMTP credentials (SMTP_USER / SMTP_PASS) in server/.env`
- **Fix:** Run `node testSmtpConnection.js` in the `server` directory to check configuration presence. Ensure you use a 16-character Google App Password.

---

## Author

**Raj Kapoor Jaiswal**  
- **GitHub:** [https://github.com/rajkapoor-jaiswal](https://github.com/rajkapoor-jaiswal)  
- **Repository:** [https://github.com/rajkapoor-jaiswal/cloud-photo-gallery](https://github.com/rajkapoor-jaiswal/cloud-photo-gallery)  
- **Role:** Full Stack Software Engineer / Author  

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026 Raj Kapoor Jaiswal
```
