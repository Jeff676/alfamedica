import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDqecvB1-eP99U40gTRkDSQyIgHEWWxKGI",
  authDomain: "alfamedica-app2.firebaseapp.com",
  projectId: "alfamedica-app2",
  storageBucket: "alfamedica-app2.appspot.com",
  messagingSenderId: "397420639913",
  appId: "1:397420639913:web:5366aefc4ea5061ea9dbb8"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)