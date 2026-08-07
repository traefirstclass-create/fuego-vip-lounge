const firebaseConfig = {
  apiKey: "AIzaSyCsjQuTYypQ5KEMUAEiMh_kv_87-97yfSY",
  authDomain: "fuego-vip-lounge.firebaseapp.com",
  projectId: "fuego-vip-lounge",
  storageBucket: "fuego-vip-lounge.firebasestorage.app",
  messagingSenderId: "48755151216",
  appId: "1:48755151216:web:028e3d2221904c05aabfb5"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
