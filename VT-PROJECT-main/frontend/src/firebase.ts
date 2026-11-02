import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAv7zf4ni8B32G9Egdo-jFCw_be9fKmdHE",
  authDomain: "sheroute-ai.firebaseapp.com",
  projectId: "sheroute-ai",
  storageBucket: "sheroute-ai.firebasestorage.app",
  messagingSenderId: "290493152159",
  appId: "1:290493152159:web:c45002d6a8e45dddaedbaa"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;