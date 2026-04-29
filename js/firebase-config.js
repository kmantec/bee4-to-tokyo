// Firebase Configuration
// Replace placeholders with your Firebase project values
// See SETUP.md for step-by-step instructions

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Set to true to test WITHOUT Firebase (uses LocalStorage only)
export const OFFLINE_MODE = true;
