import { useState, useCallback, useEffect } from 'react';

const FRAME_WIDTH_KEY = 'chat_frame_width';

export function useFrameResize(containerRef: React.RefObject<HTMLDivElement>) {
  // Initialize with 50% of container width, fallback to 500px
  const [frameWidth, setFrameWidth] = useState(() => {
    const savedWidth = localStorage.getItem(FRAME_WIDTH_KEY);
    if (savedWidth) return parseInt(savedWidth, 10);
    
    const containerWidth = containerRef.current?.clientWidth || 1000;
    return containerWidth * 0.5;
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const maxWidth = containerWidth * 0.8; // Max 80% of container
    const minWidth = containerWidth * 0.2; // Min 20% of container
    
    const newWidth = containerWidth - (e.clientX - containerRect.left);
    const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
    
    setFrameWidth(clampedWidth);
    localStorage.setItem(FRAME_WIDTH_KEY, clampedWidth.toString());
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.classList.remove('select-none');
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
    document.body.classList.add('select-none');
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isResizing, handleResize, handleMouseUp]);

  return {
    frameWidth,
    isResizing,
    handleMouseDown,
  };
}