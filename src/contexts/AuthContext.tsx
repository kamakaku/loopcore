import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import LoadingScreen from '../components/common/LoadingScreen';

interface AuthContextType {
  user: (User & { subscription?: any }) | null;
  loading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthContextType>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          // Subscribe to user document for subscription info
          const unsubscribeUser = onSnapshot(
            doc(db, 'users', firebaseUser.uid),
            (doc) => {
              setState({
                user: {
                  ...firebaseUser,
                  subscription: doc.data()?.subscription
                },
                loading: false,
                error: null
              });
            },
            (error) => {
              console.error('Error fetching user data:', error);
              setState(prev => ({
                ...prev,
                error: error as Error,
                loading: false
              }));
            }
          );

          return () => unsubscribeUser();
        } else {
          setState({
            user: null,
            loading: false,
            error: null
          });
        }
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error as Error,
          loading: false
        }));
      }
    );

    return () => unsubscribeAuth();
  }, []);

  if (state.loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};