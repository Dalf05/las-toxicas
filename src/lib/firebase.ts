import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

let app;
let auth: any;
let db: any;
const googleProvider = new GoogleAuthProvider();

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { auth, db, googleProvider };

export const loginWithGoogle = () => {
  if (!auth) {
    alert("Firebase no está configurado correctamente.");
    return;
  }
  return signInWithPopup(auth, googleProvider);
};

export const logout = () => {
  if (!auth) return;
  return signOut(auth);
};
