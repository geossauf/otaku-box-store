import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// ⚠️ بدّل القيم التالية بالقيم اللي تاخذها من Firebase Console
// (Project settings → General → Your apps → Web app → firebaseConfig)
const firebaseConfig = {
  apiKey: "AIzaSyB_xAYlgo4OyAG4TcErzLKblB6pj-CfUzo",
  authDomain: "otaku-box-2.firebaseapp.com",
  projectId: "otaku-box-2",
  storageBucket: "otaku-box-2.firebasestorage.app",
  messagingSenderId: "868116713548",
  appId: "1:868116713548:web:a4a3efa3131348be9de4e9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export { doc, getDoc, setDoc };
