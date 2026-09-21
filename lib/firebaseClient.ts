import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Same values as public/firebase-config.js. Firebase web config is not a
// secret (it identifies the project, it doesn't authorize access on its
// own — Firestore/Auth security rules do that), so it's fine to inline here.
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCsjQuTYypQ5KEMUAEiMh_kv_87-97yfSY",
  authDomain: "fuego-vip-lounge.firebaseapp.com",
  projectId: "fuego-vip-lounge",
  storageBucket: "fuego-vip-lounge.firebasestorage.app",
  messagingSenderId: "48755151216",
  appId: "1:48755151216:web:028e3d2221904c05aabfb5",
};

const app = getApps().length > 0 ? getApps()[0]! : initializeApp(firebaseConfig);

export const clientDb = getFirestore(app);
export const clientAuth = getAuth(app);
