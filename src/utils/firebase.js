import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

// TODO: Replace with your project's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWJH8of_W_GMmgKHLXlDeaOicd_18NGX4",
    authDomain: "xmath-production.firebaseapp.com",
    projectId: "xmath-production",
    storageBucket: "xmath-production.firebasestorage.app",
    messagingSenderId: "795468863052",
    appId: "1:795468863052:web:cfe111042c25e4f1bfc6e9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const loginWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

// Firestore Stats Helpers
export const syncUserStats = async (user, localStats) => {
    if (!user) return null;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // First time login, save local stats
        await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'user', // Default role
            createdAt: new Date(),
            stats: localStats
        });
        return localStats;
    } else {
        // Merge or pull stats from cloud
        const cloudData = userSnap.data();
        // Simple merge: take the higher numbers
        // Merge: combine challenges and sort by date desc
        const allChallenges = [...(cloudData.stats.challenges || []), ...(localStats.challenges || [])];
        // Remove duplicates based on date string
        const uniqueChallenges = Array.from(new Map(allChallenges.map(item => [item.date, item])).values());
        // Sort by date descending
        uniqueChallenges.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Keep top 50
        const mergedChallenges = uniqueChallenges.slice(0, 50);

        const mergedStats = {
            ...cloudData.stats,
            challenges: mergedChallenges,
            lifetime: {
                solved: Math.max(cloudData.stats.lifetime.solved, localStats.lifetime.solved),
                correct: Math.max(cloudData.stats.lifetime.correct, localStats.lifetime.correct),
                incorrect: Math.max(cloudData.stats.lifetime.incorrect, localStats.lifetime.incorrect),
                bestStreak: Math.max(cloudData.stats.lifetime.bestStreak, localStats.lifetime.bestStreak),
            }
        };
        await updateDoc(userRef, { stats: mergedStats });
        return mergedStats;
    }
};

export const logAccess = async (user) => {
    if (!user) return;
    const accessRef = collection(db, "access_logs");
    await setDoc(doc(accessRef), {
        uid: user.uid,
        email: user.email,
        timestamp: new Date(),
        type: 'login'
    });
};
