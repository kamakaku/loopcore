import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  DocumentData,
  QueryConstraint,
  WhereFilterOp,
  Query,
  getDocs,
  QuerySnapshot,
  documentId,
  Timestamp,
  Unsubscribe,
  setLogLevel
} from 'firebase/firestore';
import { db } from './config';

// Set Firestore log level for better debugging
if (process.env.NODE_ENV === 'development') {
  setLogLevel('debug');
}

export { db };
export default db;