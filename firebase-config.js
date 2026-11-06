const firebaseConfig = {
  apiKey: "AIzaSyDogJvTQM-lDhTzCDzpwRucF8UKaChr9Lc",
  authDomain: "gestionale-mille-idee.firebaseapp.com",
  projectId: "gestionale-mille-idee",
  storageBucket: "gestionale-mille-idee.firebasestorage.app",
  messagingSenderId: "169255247812",
  appId: "1:169255247812:web:bfa07f0ae539ac9a918e91"
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