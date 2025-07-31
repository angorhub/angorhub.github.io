import { useMutation } from "@tanstack/react-query";
import { BlossomUploader } from '@nostrify/nostrify/uploaders';

import { useCurrentUser } from "./useCurrentUser";

export function useUploadFile() {
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) {
        throw new Error('Must be logged in to upload files');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are supported');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const uploader = new BlossomUploader({
        servers: [
          'https://blossom.primal.net/',
          'https://cdn.satellite.earth/',
          'https://blossom.sovbit.host/',
        ],
        signer: user.signer,
      });

      try {
        const tags = await uploader.upload(file);
        console.log('Upload successful:', tags);
        return tags;
      } catch (error) {
        console.error('Upload failed:', error);
        // Try to provide a more user-friendly error message
        if (error instanceof Error) {
          if (error.message.includes('network') || error.message.includes('fetch')) {
            throw new Error('Network error. Please check your connection and try again.');
          }
          if (error.message.includes('unauthorized') || error.message.includes('403')) {
            throw new Error('Upload not authorized. Please try again or contact support.');
          }
          if (error.message.includes('too large') || error.message.includes('size')) {
            throw new Error('File is too large. Please use a smaller image.');
          }
        }
        throw new Error('Upload failed. Please try again.');
      }
    },
  });
}