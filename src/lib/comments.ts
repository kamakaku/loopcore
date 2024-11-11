import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp,
  Timestamp,
  writeBatch,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { Comment, Loop } from '../types';
import { notifyNewComment, notifyMentioned } from './notifications/email';

export const createComment = async ({
  targetId,
  targetType,
  content,
  attachments = []
}: {
  targetId: string;
  targetType: 'loop' | 'spot';
  content: string;
  attachments?: File[];
}): Promise<Comment> => {
  if (!auth.currentUser) throw new Error('Authentication required');

  // Verify target exists
  const targetRef = doc(db, targetType === 'loop' ? 'loops' : 'spots', targetId);
  const targetDoc = await getDoc(targetRef);

  if (!targetDoc.exists()) {
    throw new Error(`${targetType} not found`);
  }

  // Upload attachments if any
  const attachmentUrls: string[] = [];
  if (attachments.length > 0) {
    for (const file of attachments) {
      const timestamp = Date.now();
      const filename = `comments/${auth.currentUser.uid}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, filename);
      
      const uploadResult = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: auth.currentUser.uid,
          originalName: file.name
        }
      });

      const url = await getDownloadURL(uploadResult.ref);
      attachmentUrls.push(url);
    }
  }

  // Create comment document
  const commentRef = doc(collection(db, 'comments'));
  const commentData = {
    id: commentRef.id,
    targetId,
    targetType,
    content,
    attachments: attachmentUrls,
    status: 'open' as const,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const batch = writeBatch(db);

  // Create the comment
  batch.set(commentRef, commentData);

  // Update target's comment count
  batch.update(targetRef, {
    commentCount: increment(1),
    updatedAt: serverTimestamp()
  });

  await batch.commit();

  // Get loop data for notification
  const loopId = targetType === 'loop' ? targetId : targetDoc.data().loopId;
  const loopDoc = await getDoc(doc(db, 'loops', loopId));
  const loop = { id: loopId, ...loopDoc.data() } as Loop;

  // Send notification
  await notifyNewComment(loop, {
    ...commentData,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Check for mentions and notify mentioned users
  const mentionRegex = /@(\w+)/g;
  const mentions = content.match(mentionRegex);
  if (mentions) {
    const uniqueMentions = [...new Set(mentions)];
    for (const mention of uniqueMentions) {
      const username = mention.substring(1);
      // Here you would need to look up the user ID by username
      // This is just a placeholder - implement your user lookup logic
      const mentionedUserId = username;
      await notifyMentioned(loop, mentionedUserId, content);
    }
  }

  return {
    ...commentData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

export const updateComment = async (
  commentId: string,
  updates: {
    content?: string;
    status?: 'open' | 'resolved';
  }
) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const commentRef = doc(db, 'comments', commentId);
  const commentDoc = await getDoc(commentRef);

  if (!commentDoc.exists()) {
    throw new Error('Comment not found');
  }

  if (commentDoc.data().createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  await updateDoc(commentRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteComment = async (commentId: string) => {
  if (!auth.currentUser) throw new Error('Authentication required');

  const commentRef = doc(db, 'comments', commentId);
  const commentDoc = await getDoc(commentRef);

  if (!commentDoc.exists()) {
    throw new Error('Comment not found');
  }

  const commentData = commentDoc.data();
  if (commentData.createdBy !== auth.currentUser.uid) {
    throw new Error('Permission denied');
  }

  const batch = writeBatch(db);

  // Delete any attachments from storage
  if (commentData.attachments?.length) {
    await Promise.all(
      commentData.attachments.map(async (url) => {
        try {
          const storageRef = ref(storage, url);
          await deleteObject(storageRef);
        } catch (error) {
          console.error('Error deleting attachment:', error);
        }
      })
    );
  }

  // Update target's comment count
  const targetRef = doc(
    db,
    commentData.targetType === 'loop' ? 'loops' : 'spots',
    commentData.targetId
  );
  batch.update(targetRef, {
    commentCount: increment(-1),
    updatedAt: serverTimestamp()
  });

  // Delete the comment
  batch.delete(commentRef);

  await batch.commit();
};