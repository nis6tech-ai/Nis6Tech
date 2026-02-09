# Certificate Verification System

## Overview
A complete certificate verification system has been added to your website. It consists of:
1. **Public Verification Page**: `certificate_verify.html` (or `/certificate_verify`)
2. **Admin Management Panel**: `admin/certificates.html` (or `/admin/certificates`)
3. **Admin Login**: `admin/login.html`

## How to Use

### 1. View Public Page
Open `certificate_verify.html` in your browser.
- Enter a Certificate ID (e.g., `CERT-2026-0001`).
- Click "Verify".
- You should see the certificate details if it exists.

### 2. Admin Management
Open `admin/login.html`.
- **Default Credentials:**
  - Email: `admin@nis6tech.com`
  - Password: `admin123`
- Inside the dashboard, you can:
  - **Issue New Certificates**: Click the button, fill details.
  - **Edit**: Click the pencil icon.
  - **Revoke**: Click the block icon.

## IMPORTANT: Data Persistence (LocalStorage)
Currently, this system uses **LocalStorage** to store data. This means:
- The data is saved **only on your specific browser**.
- If you deploy this to a live website, **users will not see the certificates you added** because they have their own LocalStorage.

### To Make It Production Ready (Multi-User)
To allow public users to verify certificates you created, you must connect this to a real backend database. The easiest way for your current setup is **Firebase**.

#### Steps to Switch to Firebase:
1. Create a Firebase Project at [console.firebase.google.com](https://console.firebase.google.com).
2. Create a **Firestore Database**.
3. Copy your Firebase Config.
4. Update `assets/js/certificate-system.js` to use Firestore methods (`addDoc`, `getDoc`) instead of `localStorage`.
