/**
 * File: AuthContext.jsx
 * Description: Provides global authentication state and methods (login, signup, 
 * logout, reset password, google login) using Firebase Auth and Firestore.
 */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, provider, db } from "../firebase.js";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * AuthProvider Component
 * Wraps the application to provide authentication context to its children.
 * 
 * @param {Object} props - React props containing children.
 */
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Registers a new user with email and password, and saves their profile 
   * to Firestore.
   */
  async function signup(email, password, displayName) {
    const { user } = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(user, { displayName });
    await setDoc(doc(db, "users", user.uid), {
      email,
      displayName,
      role: "pharmacist",
      createdAt: new Date().toISOString(),
    });
    return user;
  }

  /**
   * Authenticates a user with email and password.
   */
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  /**
   * Sends a password reset email to the specified address.
   */
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function loginWithGoogle() {
    const result = await signInWithPopup(auth, provider);
    await setDoc(
      doc(db, "users", result.user.uid),
      {
        email: result.user.email,
        displayName: result.user.displayName,
        role: "pharmacist",
        lastLogin: new Date().toISOString(),
      },
      { merge: true },
    );
    return result;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    loginWithGoogle,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
