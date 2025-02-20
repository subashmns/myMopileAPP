import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_JmqVobdavXVgn-1FuSqOYh7ADYu-VnU",
  authDomain: "model-project-3acde.firebaseapp.com",
  projectId: "model-project-3acde",
  storageBucket: "model-project-3acde.firebasestorage.app",
  messagingSenderId: "1009512930328",
  appId: "1:1009512930328:web:35e763d040283ea726376d",
  measurementId: "G-85Q7FD32FB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
