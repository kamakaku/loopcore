import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  hashedKey: string;
  scopes: string[];
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
}

export interface ApiUsage {
  id: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

// Use Web Crypto API to hash API keys
const hashApiKey = async (key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const createApiKey = async ({
  name,
  scopes,
  expiresIn
}: {
  name: string;
  scopes: string[];
  expiresIn?: number;
}): Promise<ApiKey> => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const apiKeyRef = doc(collection(db, 'api-keys'));
  const key = `lc_${uuidv4().replace(/-/g, '')}`;
  const hashedKey = await hashApiKey(key);

  const apiKeyData = {
    id: apiKeyRef.id,
    name,
    key,
    hashedKey,
    scopes,
    enabled: true,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : null
  };

  await setDoc(apiKeyRef, apiKeyData);

  return {
    ...apiKeyData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const validateApiKey = async (key: string): Promise<ApiKey | null> => {
  const hashedKey = await hashApiKey(key);
  
  const apiKeysQuery = query(
    collection(db, 'api-keys'),
    where('hashedKey', '==', hashedKey),
    where('enabled', '==', true)
  );

  const snapshot = await getDocs(apiKeysQuery);
  if (snapshot.empty) return null;

  const apiKey = {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data()
  } as ApiKey;

  // Check if key has expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    await updateDoc(doc(db, 'api-keys', apiKey.id), {
      enabled: false
    });
    return null;
  }

  // Update last used timestamp
  await updateDoc(doc(db, 'api-keys', apiKey.id), {
    lastUsed: serverTimestamp()
  });

  return apiKey;
};

export const trackApiUsage = async ({
  apiKeyId,
  endpoint,
  method,
  statusCode,
  responseTime,
  ip,
  userAgent
}: {
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  ip?: string;
  userAgent?: string;
}): Promise<void> => {
  const usageRef = doc(collection(db, 'api-usage'));
  
  await setDoc(usageRef, {
    id: usageRef.id,
    apiKeyId,
    endpoint,
    method,
    statusCode,
    responseTime,
    ip,
    userAgent,
    timestamp: serverTimestamp()
  });
};

export const revokeApiKey = async (apiKeyId: string): Promise<void> => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const apiKeyRef = doc(db, 'api-keys', apiKeyId);
  const apiKeyDoc = await getDoc(apiKeyRef);

  if (!apiKeyDoc.exists()) {
    throw new Error('API key not found');
  }

  if (apiKeyDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  await updateDoc(apiKeyRef, {
    enabled: false,
    updatedAt: serverTimestamp()
  });
};