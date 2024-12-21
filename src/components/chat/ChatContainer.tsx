import React, { useState, useRef } from 'react';
import ResizeHandle from '../ResizeHandle';
import MatrixContactList from '../MatrixContactList';
import ChatArea from './ChatArea';
import ContactHeader from './ContactHeader';
import ChatHeader from './ChatHeader';
import ChatFrame from './ChatFrame';
import { useContactResize } from '../../hooks/useContactResize';
import type { Contact } from '../../types/matrix';

interface ChatContainerProps {
  chatAreaProps: React.ComponentProps<typeof ChatArea>;
  onContactSelect: (contact: Contact) => void;
  showContacts: boolean;
  showChatArea: boolean;
  showFrame: boolean;
}

export default function ChatContainer({ 
  chatAreaProps, 
  onContactSelect,
  showContacts,
  showChatArea,
  showFrame
}: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const {
    contactListWidth,
    isResizingContacts,
    handleMouseDown: handleContactResizeStart
  } = useContactResize();

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    onContactSelect(contact);
  };

  return (
    <div ref={containerRef} className="matrix-chat-container flex h-full relative">
      <div 
        style={{ 
          width: showContacts ? `${contactListWidth}px` : '0px',
          overflow: 'hidden',
          transition: 'width 0.3s ease-in-out'
        }}
        className="flex-shrink-0 border-r border-gray-200 flex flex-col"
      >
        <ContactHeader onSearch={setSearchQuery} />
        <div className="flex-1 overflow-hidden">
          <MatrixContactList 
            onSelectContact={handleContactSelect}
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {showContacts && (
        <ResizeHandle
          orientation="vertical"
          onMouseDown={handleContactResizeStart}
          className={isResizingContacts ? 'bg-indigo-200' : ''}
        />
      )}

      {showChatArea && (
        <div className="flex-1 flex flex-col">
          <ChatHeader selectedContact={selectedContact} />
          <div className="flex-1 overflow-hidden">
            <ChatArea 
              {...chatAreaProps}
              selectedContact={selectedContact}
            />
          </div>
        </div>
      )}

      <ChatFrame 
        isVisible={showFrame} 
        containerRef={containerRef}
      />
    </div>
  );
}