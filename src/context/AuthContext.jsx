import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    try {
      console.log('AuthContext: Attempting signup');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Signup successful');
      return userCredential.user;
    } catch (error) {
      console.error('AuthContext: Signup error:', error);
      throw error; // Throw the original error
    }
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthContext: Login successful');
      return userCredential.user;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error; // Throw the original error
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      throw error; // Throw the original error
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 