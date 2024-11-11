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

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  failureCount: number;
  status: 'active' | 'disabled' | 'failed';
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: any;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
}

export const createWebhook = async ({
  name,
  url,
  events
}: {
  name: string;
  url: string;
  events: string[];
}): Promise<Webhook> => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const webhookRef = doc(collection(db, 'webhooks'));
  const secret = uuidv4();

  const webhookData = {
    id: webhookRef.id,
    name,
    url,
    secret,
    events,
    enabled: true,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    failureCount: 0,
    status: 'active' as const
  };

  await setDoc(webhookRef, webhookData);

  return {
    ...webhookData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const updateWebhook = async (
  webhookId: string,
  updates: Partial<Omit<Webhook, 'id' | 'createdAt' | 'createdBy' | 'secret'>>
) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const webhookRef = doc(db, 'webhooks', webhookId);
  const webhookDoc = await getDoc(webhookRef);

  if (!webhookDoc.exists()) {
    throw new Error('Webhook not found');
  }

  if (webhookDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  await updateDoc(webhookRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteWebhook = async (webhookId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const webhookRef = doc(db, 'webhooks', webhookId);
  const webhookDoc = await getDoc(webhookRef);

  if (!webhookDoc.exists()) {
    throw new Error('Webhook not found');
  }

  if (webhookDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  await deleteDoc(webhookRef);
};

export const triggerWebhook = async (
  event: string,
  payload: any
) => {
  const webhooksQuery = query(
    collection(db, 'webhooks'),
    where('events', 'array-contains', event),
    where('enabled', '==', true),
    where('status', '==', 'active')
  );

  const webhooksSnapshot = await getDocs(webhooksQuery);
  const webhooks = webhooksSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Webhook[];

  const eventPromises = webhooks.map(async (webhook) => {
    const eventRef = doc(collection(db, 'webhook-events'));
    const eventData: WebhookEvent = {
      id: eventRef.id,
      webhookId: webhook.id,
      event,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date(),
    };

    await setDoc(eventRef, eventData);

    // Trigger the webhook in the background
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret,
          'X-Event-Type': event
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await updateDoc(eventRef, {
        status: 'success',
        processedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'webhooks', webhook.id), {
        lastTriggered: serverTimestamp(),
        failureCount: 0
      });
    } catch (error) {
      console.error(`Failed to trigger webhook ${webhook.id}:`, error);

      await updateDoc(eventRef, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        attempts: eventData.attempts + 1,
        processedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'webhooks', webhook.id), {
        failureCount: increment(1),
        status: webhook.failureCount >= 4 ? 'failed' : 'active'
      });
    }
  });

  await Promise.allSettled(eventPromises);
};