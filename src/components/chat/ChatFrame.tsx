import React, { useRef } from 'react';
import ResizeHandle from '../ResizeHandle';
import { useFrameResize } from '../../hooks/useFrameResize';

interface ChatFrameProps {
  isVisible: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

export default function ChatFrame({ isVisible, containerRef }: ChatFrameProps) {
  const {
    frameWidth,
    isResizing,
    handleMouseDown,
  } = useFrameResize(containerRef);

  if (!isVisible) return null;

  return (
    <>
      <ResizeHandle
        orientation="vertical"
        onMouseDown={handleMouseDown}
        className={`${isResizing ? 'bg-indigo-200' : ''} cursor-col-resize`}
      />
      <div 
        style={{ width: `${frameWidth}px` }}
        className="flex-shrink-0 bg-white border-l border-gray-200"
      >
        <iframe
          src="https://example.com/"
          className="w-full h-full border-0"
          title="Place Holder"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          referrerPolicy="no-referrer"
        />
      </div>
    </>
  );
}