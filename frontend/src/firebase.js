// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDtb-I4k41AcB3oMq2p5XtUsMYBS6GG2yA",
  authDomain: "missonary-portfolio.firebaseapp.com",
  projectId: "missonary-portfolio",
  storageBucket: "missonary-portfolio.appspot.com",
  messagingSenderId: "884295524611",
  appId: "1:884295524611:web:1feff9ced42f4843c20936",
  measurementId: "G-4GDYNS10F0",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
