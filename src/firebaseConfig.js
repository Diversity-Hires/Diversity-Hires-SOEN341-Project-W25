// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth";

//If needed add more imports here
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// The web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCK3SV2WKNAEB9OdXqd5fee6K0tUjYsw4w",
  authDomain: "chathaven-3b77a.firebaseapp.com",
  projectId: "chathaven-3b77a",
  storageBucket: "chathaven-3b77a.firebasestorage.app",
  messagingSenderId: "881824192229",
  appId: "1:881824192229:web:3a68105be061f49432e60c",
  measurementId: "G-6VMPWLPHQH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);