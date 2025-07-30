import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyANBKEc9EzxYkhS1d9hyssT3yneeIG4vIY",
    authDomain: "pls-messaging-system.firebaseapp.com",
    projectId: "pls-messaging-system",
    storageBucket: "pls-messaging-system.firebasestorage.app",
    messagingSenderId: "193302960846",
    appId: "1:193302960846:web:89fd23e54cc6b012058e9f",
    measurementId: "G-C9NX0BVDXH"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

export default db;
