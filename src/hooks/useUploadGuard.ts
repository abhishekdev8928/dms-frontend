import { useEffect } from 'react';
import { useUploadStore } from '@/config/store/uploadStore';

export const useUploadGuard = () => {
  const hasActiveUploads = useUploadStore((state) => state.hasActiveUploads);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasActiveUploads()) {
        // Standard way to show browser's native confirmation dialog
        const message = 'You have uploads in progress. Leaving will cancel all uploads.';
        e.preventDefault();
        e.returnValue = message; // Chrome requires returnValue to be set
        return message; // For older browsers
      }
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasActiveUploads]);
};