import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from './config';

const AVATAR_PATH = 'avatars';
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadAvatar(file: File): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('User must be authenticated to upload avatar');
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error('Avatar file size must be less than 5MB');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Avatar must be an image file');
  }

  const timestamp = Date.now();
  const filename = `${AVATAR_PATH}/${auth.currentUser.uid}/${timestamp}_${file.name}`;
  const storageRef = ref(storage, filename);

  try {
    // Optimize image before upload if possible
    let imageToUpload = file;
    if (window.createImageBitmap && file.type !== 'image/gif') {
      const img = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const maxSize = 500; // Max dimension
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > maxSize) {
        height *= maxSize / width;
        width = maxSize;
      } else if (height > maxSize) {
        width *= maxSize / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.85);
        });
        imageToUpload = new File([blob], file.name, { type: 'image/jpeg' });
      }
    }

    const snapshot = await uploadBytes(storageRef, imageToUpload, {
      contentType: imageToUpload.type,
      customMetadata: {
        uploadedBy: auth.currentUser.uid,
        originalName: file.name,
        timestamp: timestamp.toString()
      }
    });

    // Get the download URL immediately
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Verify the URL is accessible
    const checkResponse = await fetch(downloadURL, { method: 'HEAD' });
    if (!checkResponse.ok) {
      throw new Error('Failed to verify avatar URL');
    }

    return downloadURL;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error('Failed to upload avatar');
  }
}