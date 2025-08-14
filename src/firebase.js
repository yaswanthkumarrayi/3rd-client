import {initializeApp} from 'firebase/app';
import { getAuth , GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCmfG3c3xBUS_JPAYATh_9dzEEKlLxs7jw",
  authDomain: "rd-client-f3c1f.firebaseapp.com",
  projectId: "rd-client-f3c1f",
  storageBucket: "rd-client-f3c1f.firebasestorage.app",
  messagingSenderId: "137722177241",
  appId: "1:137722177241:web:aca25ceaf360280cc380c8",
  measurementId: "G-PF93QFZ5JE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();