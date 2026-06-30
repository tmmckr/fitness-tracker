import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCu2lopFvSMqFOdMByhMdaVKNk9ks9LIAE",
  authDomain: "fitness-tracker-app-97be3.firebaseapp.com",
  projectId: "fitness-tracker-app-97be3",
  storageBucket: "fitness-tracker-app-97be3.firebasestorage.app",
  messagingSenderId: "730796401149",
  appId: "1:730796401149:web:f68835dd52bc44a672f994",
  measurementId: "G-TNFWMXQ19F"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
