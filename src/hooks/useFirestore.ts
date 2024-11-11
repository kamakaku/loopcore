import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy,
  limit, 
  onSnapshot,
  DocumentData,
  QueryConstraint,
  WhereFilterOp,
  FirestoreError,
  Query,
  getDocs,
  QuerySnapshot,
  documentId,
  Timestamp,
  Unsubscribe,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useAuth } from '../contexts/AuthContext';

export function useFirestore<T = DocumentData>(
  collectionName: string,
  constraints?: {
    where?: [string, WhereFilterOp, any][];
    orderBy?: [string, 'asc' | 'desc'][];
    limitTo?: number;
  }
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  const createQuery = useCallback((): Query | null => {
    if (!user) return null;

    try {
      const collectionRef = collection(db, collectionName);
      const queryConstraints: QueryConstraint[] = [];

      // Apply where constraints
      if (constraints?.where) {
        constraints.where.forEach(([field, operator, value]) => {
          if (value != null) {
            if (field === '__name__') {
              queryConstraints.push(where(documentId(), operator, value));
            } else {
              if (operator === 'array-contains-any' && Array.isArray(value) && value.length === 0) {
                return;
              }
              if (operator === 'in' && Array.isArray(value) && value.length === 0) {
                return;
              }
              queryConstraints.push(where(field, operator, value));
            }
          }
        });
      }

      // Add ordering
      if (constraints?.orderBy) {
        constraints.orderBy.forEach(([field, direction]) => {
          queryConstraints.push(orderBy(field, direction));
        });
      }

      // Add limit
      if (constraints?.limitTo && constraints.limitTo > 0) {
        queryConstraints.push(limit(constraints.limitTo));
      }

      return queryConstraints.length > 0 
        ? query(collectionRef, ...queryConstraints)
        : query(collectionRef);

    } catch (err) {
      console.error('Error creating query:', err);
      setError(err as FirestoreError);
      return null;
    }
  }, [user, collectionName, JSON.stringify(constraints)]);

  const setupQuery = useCallback(async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    const q = createQuery();
    if (!q) {
      setData([]);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onSnapshot(q, {
        next: (snapshot: QuerySnapshot) => {
          if (!mountedRef.current) return;
          setIsOffline(false);
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt instanceof Timestamp 
              ? doc.data().createdAt.toDate() 
              : doc.data().createdAt,
            updatedAt: doc.data().updatedAt instanceof Timestamp 
              ? doc.data().updatedAt.toDate() 
              : doc.data().updatedAt,
          })) as T[];
          setData(documents);
          setLoading(false);
          setError(null);
        },
        error: (err: FirestoreError) => {
          if (!mountedRef.current) return;
          console.error('Firestore listener error:', err);
          setError(err);
          setLoading(false);
          
          if (err.code === 'unavailable') {
            setIsOffline(true);
            // Attempt to get cached data
            getDocs(q).then(snapshot => {
              if (mountedRef.current) {
                const documents = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                  createdAt: doc.data().createdAt instanceof Timestamp 
                    ? doc.data().createdAt.toDate() 
                    : doc.data().createdAt,
                  updatedAt: doc.data().updatedAt instanceof Timestamp 
                    ? doc.data().updatedAt.toDate() 
                    : doc.data().updatedAt,
                })) as T[];
                setData(documents);
              }
            });

            // Retry connection after delay
            retryTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                setupQuery();
              }
            }, 5000);
          }
        }
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      if (mountedRef.current) {
        console.error('Error setting up Firestore listener:', err);
        setError(err as FirestoreError);
        setLoading(false);
      }
    }
  }, [user, createQuery]);

  useEffect(() => {
    mountedRef.current = true;
    setupQuery();

    return () => {
      mountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [setupQuery]);

  return {
    data,
    loading,
    error,
    isOffline,
    isAuthenticated: !!user
  };
}