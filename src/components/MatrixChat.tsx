import React, { useRef, useCallback, useState } from 'react';
import ChatContainer from './chat/ChatContainer';
import { Contact } from '../types/matrix';
import { useMatrixChat } from '../hooks/useMatrixChat';

interface MatrixChatProps {
  showContacts: boolean;
  showChatArea: boolean;
  showFrame: boolean;
}

export default function MatrixChat({ showContacts, showChatArea, showFrame }: MatrixChatProps) {
  const [messageListHeight, setMessageListHeight] = useState(70);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    newMessage,
    isConnected,
    error,
    isVoiceMessageSending,
    clientRef,
    currentRoomId,
    setNewMessage,
    handleSend,
    handleKeyPress,
    handleVoiceRecording,
    handleChatAction,
    setCurrentRoom,
    loadRoomMessages
  } = useMatrixChat();

  const handleContactSelect = async (contact: Contact) => {
    setSelectedContact(contact);
    await setCurrentRoom(contact.roomId);
    await loadRoomMessages(contact.roomId);
  };

  const chatAreaProps = {
    messages,
    error,
    isConnected,
    messageListHeight,
    newMessage,
    currentUserId: clientRef.current?.getUserId(),
    selectedContact,
    currentRoomId,
    messagesEndRef,
    textareaRef,
    isVoiceMessageSending,
    onSetIsResizing: setIsResizing,
    onMessageChange: setNewMessage,
    onKeyPress: handleKeyPress,
    onSend: handleSend,
    onVoiceRecording: handleVoiceRecording,
    onChatAction: handleChatAction
  };

  return (
    <ChatContainer
      onContactSelect={handleContactSelect}
      chatAreaProps={chatAreaProps}
      showContacts={showContacts}
      showChatArea={showChatArea}
      showFrame={showFrame}
    />
  );
}