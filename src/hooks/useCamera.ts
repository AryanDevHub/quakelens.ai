import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  takeSnapshot: () => string | null;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // 1. Secure Context Check
      if (typeof window !== 'undefined' && 
          window.location.protocol !== 'https:' && 
          window.location.hostname !== 'localhost') {
        throw new Error('Camera access requires an HTTPS secure connection.');
      }

      // 2. Request Hardware Access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // BACK CAMERA
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      // 3. Store stream in a Ref (not state) to prevent re-renders
      streamRef.current = stream;
      
      // 4. Trigger UI to render the <video> element
      setIsActive(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hardware access denied';
      setError(errorMessage);
      setIsActive(false);
      console.error('Tactical Camera Error:', err);
    }
  }, []);

  // 5. CRITICAL: This Effect runs AFTER the component re-renders
  // It waits for the video tag to exist in the DOM, then attaches the stream
  useEffect(() => {
    if (isActive && streamRef.current && videoRef.current) {
      // Attach the existing stream to the newly rendered video tag
      videoRef.current.srcObject = streamRef.current;
      
      // Force play for iOS/Android WebView compatibility
      videoRef.current.play().catch(e => {
        console.warn("Auto-play blocked by browser policy:", e);
      });
    }
  }, [isActive]); // Runs every time the 'active' state changes

  const takeSnapshot = useCallback((): string | null => {
    if (!videoRef.current || !isActive) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Draw the current frame to canvas
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [isActive]);

  // Cleanup: Ensure camera turns off when the user leaves the Vision tab
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    takeSnapshot,
  };
}