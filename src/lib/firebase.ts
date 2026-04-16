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

export const loginWithGoogle = async () => {
  if (!auth) {
    alert("Error: Firebase no se ha inicializado. ¿Has subido el archivo firebase-applet-config.json a GitHub?");
    return;
  }
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Error en login:", error);
    if (error.code === 'auth/unauthorized-domain') {
      alert("¡Dominio no autorizado! Tienes que añadir tu URL de Vercel en la Consola de Firebase (Authentication > Settings > Authorized domains).");
    } else {
      alert("Error al entrar: " + error.message);
    }
  }
};

export const logout = () => {
  if (!auth) return;
  return signOut(auth);
};
