# Troubleshooting Login Issues

If the login button doesn't work, follow these steps:

## 1. Check Console for Errors
- Right-click the page -> **Inspect**.
- Go to the **Console** tab.
- Look for **red errors**.

### Common Errors:
- **"Access to script at ... blocked by CORS policy"**:
  - **Reason**: You are opening the file directly (double-clicking the `html` file).
  - **Fix**: You MUST run a local server.
  - **How**:
    - If you have Python: Open terminal in project folder, run `python3 -m http.server`. Go to `http://localhost:8000/admin/login.html`.
    - If you use VS Code: Right-click `admin/login.html` and select **"Open with Live Server"**.

- **"auth/invalid-api-key"**:
  - **Reason**: The API Key in `assets/js/certificate-system.js` is wrong.
  - **Fix**: Re-check your Firebase Console > Project Settings.

- **"auth/operation-not-allowed"**:
  - **Reason**: You didn't enable Email/Password login.
  - **Fix**: go to Firebase Console > Authentication > Sign-in method > Enable Email/Password.

- **"auth/user-not-found"**:
  - **Reason**: You are trying to login with an email that is not in Firebase Auth.
  - **Fix**: Go to Firebase Console > Authentication > Users > Add user.

## 2. Check Javascript
If the Javascript file failed to load, nothing will happen. Ensure `assets/js/certificate-system.js` exists and has no syntax errors.

## 3. Contact Support
If still stuck, paste the error from Console here.
