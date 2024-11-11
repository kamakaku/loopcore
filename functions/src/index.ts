import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = functions.https.onCall(async (data: EmailData, context) => {
  // Verify auth
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails'
    );
  }

  const { to, subject, text, html } = data;

  // Validate input
  if (!to || !subject || !text) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required email fields'
    );
  }

  try {
    // Get user document to verify permissions
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User not found'
      );
    }

    // Send email using Firebase Admin SDK
    await admin.firestore().collection('mail').add({
      to,
      message: {
        subject,
        text,
        html: html || text.replace(/\n/g, '<br>')
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to send email'
    );
  }
});