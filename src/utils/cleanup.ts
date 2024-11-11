import { collection, getDocs, deleteDoc, writeBatch, query, where } from 'firebase/firestore';
import { db, auth } from '../lib/firebase/config';

export const cleanupAllData = async () => {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to perform cleanup');
  }

  const userId = auth.currentUser.uid;
  const collections = [
    {
      name: 'loops',
      where: ['createdBy', '==', userId]
    },
    {
      name: 'teams',
      where: ['createdBy', '==', userId]
    },
    {
      name: 'projects',
      where: ['createdBy', '==', userId]
    },
    {
      name: 'spots',
      where: ['createdBy', '==', userId]
    },
    {
      name: 'comments',
      where: ['createdBy', '==', userId]
    }
  ];
  
  const batchSize = 500; // Firestore batch limit

  try {
    for (const collectionConfig of collections) {
      const collectionRef = collection(db, collectionConfig.name);
      const q = query(
        collectionRef, 
        where(collectionConfig.where[0], collectionConfig.where[1], collectionConfig.where[2])
      );
      const snapshot = await getDocs(q);
      
      // Process in batches due to Firestore limits
      const batches = [];
      let batch = writeBatch(db);
      let operationCount = 0;

      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);
        operationCount++;

        if (operationCount === batchSize) {
          batches.push(batch.commit());
          batch = writeBatch(db);
          operationCount = 0;
        }
      }

      // Commit any remaining operations
      if (operationCount > 0) {
        batches.push(batch.commit());
      }

      // Wait for all batches to complete
      await Promise.all(batches);
      console.log(`Deleted user's documents in ${collectionConfig.name}`);
    }

    console.log('Data cleanup completed successfully');
  } catch (error) {
    console.error('Error cleaning up data:', error);
    throw new Error('Failed to cleanup data. You may only delete data you own.');
  }
};