# Firebase Setup Required

The Certificate System has been upgraded to use **Firebase** for real-time online data storage and secure authentication.

## ⚠️ Action Required: Add Your Firebase Keys

To make the system work, you must add your Firebase project keys.

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g., `nis6tech-certificates`).
3. Disable Google Analytics (optional) and Create Project.

### 2. Set Up Authentication in Firebase
1. In your new project, go to **Build > Authentication**.
2. Click **Get Started**.
3. Select **Email/Password** as a Sign-in method and **Enable** it.
4. Go to the **Users** tab and **Add user**.
   - Email: `admin@nis6tech.com` (or your preferred email)
   - Password: `your-secure-password`
   - *This will be your login for the Admin Panel.*

### 3. Set Up Firestore Database
1. Go to **Build > Firestore Database**.
2. Click **Create database**.
3. Select a location (e.g., `nam5 (us-central)` or closest to you).
4. **Important**: Start in **Test mode** (for easier initial setup) OR **Production mode**.
   - If in Production Mode, go to the **Rules** tab and allow read/write:
     ```
     allow read: if true;
     allow write: if request.auth != null;
     ```
     *(This allows anyone to verify certificates, but only logged-in admins to edit them)*

### 4. Get Your Config Keys
1. Click the **Gear icon (Settings)** next to Project Overview > **Project settings**.
2. Scroll down to **Your apps**.
3. Click the **</> (Web)** icon.
4. Register the app (name it `Nis6Tech Web`).
5. You will see a `firebaseConfig` object like:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "...",
     projectId: "...",
     ...
   };
   ```
6. Copy these values.

### 5. Update Your Code
1. Open `assets/js/certificate-system.js`.
2. Find the section marked `// PASTE YOUR FIREBASE CONFIG HERE`.
3. Replace the placeholder values with your real keys from step 4.

```javascript
const firebaseConfig = {
    apiKey: "YOUR_COPIED_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456...",
    appId: "1:1234..."
};
```

**Once updated, refresh your page, and the system is live!**
