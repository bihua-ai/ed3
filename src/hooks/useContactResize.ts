import { useState, useCallback, useEffect } from 'react';

const CONTACT_WIDTH_KEY = 'contact_list_width';

export function useContactResize(initialWidth = 280) {
  // Load saved width from localStorage or use default
  const [contactListWidth, setContactListWidth] = useState(() => {
    const savedWidth = localStorage.getItem(CONTACT_WIDTH_KEY);
    return savedWidth ? parseInt(savedWidth, 10) : initialWidth;
  });
  const [isResizingContacts, setIsResizingContacts] = useState(false);

  const handleContactResize = useCallback((e: MouseEvent) => {
    if (!isResizingContacts) return;
    const containerElement = document.querySelector('.matrix-chat-container');
    if (!containerElement) return;
    
    const newWidth = e.clientX - containerElement.getBoundingClientRect().left;
    if (newWidth >= 200 && newWidth <= 400) {
      setContactListWidth(newWidth);
      // Save width to localStorage
      localStorage.setItem(CONTACT_WIDTH_KEY, newWidth.toString());
    }
  }, [isResizingContacts]);

  const handleMouseUp = useCallback(() => {
    setIsResizingContacts(false);
    document.body.classList.remove('select-none');
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsResizingContacts(true);
    document.body.classList.add('select-none');
  }, []);

  useEffect(() => {
    if (isResizingContacts) {
      window.addEventListener('mousemove', handleContactResize);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleContactResize);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isResizingContacts, handleContactResize, handleMouseUp]);

  return {
    contactListWidth,
    isResizingContacts,
    handleMouseDown,
  };
}