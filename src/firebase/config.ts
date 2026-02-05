import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAg3-3OPYJ6pmRYocXrus_Q1-VOJ0_Xqus",
  authDomain: "sanma-game.firebaseapp.com",
  projectId: "sanma-game",
  storageBucket: "sanma-game.firebasestorage.app",
  messagingSenderId: "184805391699",
  appId: "1:184805391699:web:102e0e39b2ca14c53bb5a6",
  measurementId: "G-VRXHVZGGWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { db, auth, analytics };
