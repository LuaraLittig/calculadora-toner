const firebaseConfig = {
    apiKey: "AIzaSyCXLVp9OKXJ5zBTLB4KIO80qqDhsXONyBE",
    authDomain: "calculadora-toner.firebaseapp.com",
    projectId: "calculadora-toner",
    storageBucket: "calculadora-toner.firebasestorage.app",
    messagingSenderId: "301287142175",
    appId: "1:301287142175:web:544692f7632220b26e362a"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

window.db = db;