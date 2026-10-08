const firebaseConfig = {
  apiKey: "AIzaSyDXwkGZZhXSCAnTC-dstFuaSnc_Ih8k9Yo",
  authDomain: "salonmanagementsystem-2e685.firebaseapp.com",
  projectId: "salonmanagementsystem-2e685",
  storageBucket: "salonmanagementsystem-2e685.firebasestorage.app",
  messagingSenderId: "20347810164",
  appId: "1:20347810164:web:05c7617cb7e7fd39957c21"
};

firebase.initializeApp(firebaseConfig);
 
const auth = firebase.auth();
const db = firebase.firestore();
 
auth.setPersistence(
firebase.auth.Auth.Persistence.LOCAL
).catch(function (errore) {
console.error(
"Errore nella persistenza dell'accesso:",
errore
);
});