const firebaseConfig = {
    apiKey: "AIzaSyDGLkwekZHxFLz6DNtTdOHafOEkOVYWZ1Y",
    authDomain: "rigidlgc-website.firebaseapp.com",
    projectId: "rigidlgc-website",
    storageBucket: "rigidlgc-website.firebasestorage.app",
    messagingSenderId: "320439335449",
    appId: "1:320439335449:web:76d9a181466efd202fc888",
    measurementId: "G-5H5XWRMB20"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const EMAIL_DOMAIN = '@rigidlgc.erp';

function usernameToEmail(username) {
    return username.toLowerCase().replace(/\s+/g, '') + EMAIL_DOMAIN;
}
