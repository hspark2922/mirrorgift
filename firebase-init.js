import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  deleteField
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAx0HcriIiQAk5txhrsTO4k7iwrOVhqSMA",
  authDomain: "mirrorgift-hsp43.firebaseapp.com",
  projectId: "mirrorgift-hsp43",
  storageBucket: "mirrorgift-hsp43.firebasestorage.app",
  messagingSenderId: "521946888140",
  appId: "1:521946888140:web:8fdfcef490b7f4bf7d0f69",
  measurementId: "G-H9P2S6RQ75"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.auth = auth;
window.db = db;

window.fb = {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  deleteField,

  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

window.firebaseReady = true;
window.dispatchEvent(new Event("firebase-ready"));