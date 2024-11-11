import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { Loop, Spot, Comment } from '../../types';

export const notifyNewSpot = async (loop: Loop, spot: Spot) => {
  try {
    const sendNotification = httpsCallable(functions, 'sendSpotNotification');
    const result = await sendNotification({ 
      loopId: loop.id, 
      spotId: spot.id,
      retryCount: 0,
      maxRetries: 3
    });
    return result.data;
  } catch (error) {
    // Log error but don't throw to prevent UI disruption
    console.warn('Failed to send spot notification:', error);
    return null;
  }
};

export const notifyMemberAdded = async (loop: Loop, userId: string) => {
  try {
    const sendNotification = httpsCallable(functions, 'sendMemberAddedNotification');
    const result = await sendNotification({ 
      loopId: loop.id, 
      userId,
      retryCount: 0,
      maxRetries: 3
    });
    return result.data;
  } catch (error) {
    console.warn('Failed to send member added notification:', error);
    return null;
  }
};

export const notifyNewComment = async (loop: Loop, comment: Comment) => {
  try {
    const sendNotification = httpsCallable(functions, 'sendCommentNotification');
    const result = await sendNotification({ 
      loopId: loop.id, 
      commentId: comment.id,
      targetType: comment.targetType,
      targetId: comment.targetId,
      retryCount: 0,
      maxRetries: 3
    });
    return result.data;
  } catch (error) {
    console.warn('Failed to send comment notification:', error);
    return null;
  }
};

export const notifySpotResolved = async (loop: Loop, spot: Spot) => {
  try {
    const sendNotification = httpsCallable(functions, 'sendSpotResolvedNotification');
    const result = await sendNotification({ 
      loopId: loop.id, 
      spotId: spot.id,
      retryCount: 0,
      maxRetries: 3
    });
    return result.data;
  } catch (error) {
    console.warn('Failed to send spot resolved notification:', error);
    return null;
  }
};

export const notifyLoopShared = async (loop: Loop, recipientId: string) => {
  try {
    const sendNotification = httpsCallable(functions, 'sendLoopSharedNotification');
    const result = await sendNotification({ 
      loopId: loop.id, 
      recipientId,
      retryCount: 0,
      maxRetries: 3
    });
    return result.data;
  } catch (error) {
    console.warn('Failed to send loop shared notification:', error);
    return null;
  }
};

export const notifyMentioned = async (loop: Loop, mentionedUserId: string, content: string) => {
  try {
    const sendNotification = httpsCallable(functions, 'sendMentionNotification');
    const result = await sendNotification({ 
      loopId: loop.id, 
      userId: mentionedUserId,
      content,
      retryCount: 0,
      maxRetries: 3
    });
    return result.data;
  } catch (error) {
    console.warn('Failed to send mention notification:', error);
    return null;
  }
};