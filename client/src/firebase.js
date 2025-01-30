// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-real-estate-36be1.firebaseapp.com",
  projectId: "mern-real-estate-36be1",
  storageBucket: "mern-real-estate-36be1.appspot.com",
  messagingSenderId: "721713538101",
  appId: "1:721713538101:web:8222cb1fe9fab3cabd3d7c"
};

// Initialize Firebase


export const app = initializeApp(firebaseConfig);