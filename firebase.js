import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSbM6mVe5LlrDK-Vbtf_c9JkScHN-26I8",
  authDomain: "eduzone-b89a9.firebaseapp.com",
  projectId: "eduzone-b89a9",
  storageBucket: "eduzone-b89a9.appspot.com",
  messagingSenderId: "129902676930",
  appId: "1:129902676930:web:9c78e558386340b6b4a45b",
  measurementId: "G-83DFJ7L9Q8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app)

export { db, auth };
export { app };