// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArJ6EK54Lg8n-sMNSQ0Y3wDppB7a__UPg",
  authDomain: "collection-aa888.firebaseapp.com",
  projectId: "collection-aa888",
  storageBucket: "collection-aa888.appspot.com",
  messagingSenderId: "517750366115",
  appId: "1:517750366115:web:520bac28d0e22ecd2c8416",
  measurementId: "G-G86FDM87M0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
