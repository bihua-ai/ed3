import { useState, useRef, useCallback, useEffect } from 'react';
import { MatrixClientUtil } from '../utils/matrixClient';
import { MatrixRoomService } from '../services/matrix-room';
import { useMessageProfiles } from './useMessageProfiles';
import type { Message, Contact } from '../types/matrix';

export function useMatrixChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVoiceMessageSending, setIsVoiceMessageSending] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  
  const clientRef = useRef<any>(null);
  const processedMessagesRef = useRef(new Set<string>());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getOrFetchProfile } = useMessageProfiles();

  const addMessageToList = useCallback(async (message: any) => {
    const messageId = message.getId();
    
    // Skip if we've already processed this message
    if (processedMessagesRef.current.has(messageId)) {
      return;
    }
    
    processedMessagesRef.current.add(messageId);
    
    const sender = message.getSender();
    const profile = await getOrFetchProfile(sender);
    
    const newMessage: Message = {
      id: messageId,
      content: message.getContent().body || '',
      sender: sender,
      timestamp: message.getTs(),
      avatar: profile?.avatar_url,
      displayName: profile?.displayname || sender.split(':')[0].substring(1)
    };

    setMessages(prev => [...prev, newMessage]);
  }, [getOrFetchProfile]);

  const handleRoomEvent = useCallback(async (event: any) => {
    if (!currentRoomId || event.getRoomId() !== currentRoomId) {
      return;
    }

    if (event.getType() === 'm.room.message') {
      await addMessageToList(event);
    }
  }, [currentRoomId, addMessageToList]);

  const setupRoomListeners = useCallback(() => {
    if (!clientRef.current) return;

    // Listen for new messages
    clientRef.current.on('Room.timeline', handleRoomEvent);

    return () => {
      if (clientRef.current) {
        clientRef.current.removeListener('Room.timeline', handleRoomEvent);
      }
    };
  }, [handleRoomEvent]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, []);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !isConnected || !currentRoomId) {
      return;
    }

    try {
      await MatrixClientUtil.sendMessage(newMessage.trim(), currentRoomId);
      setNewMessage('');
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('发送消息失败');
    }
  }, [newMessage, isConnected, currentRoomId]);

  const handleVoiceRecording = useCallback(async (blob: Blob) => {
    if (!isConnected || !currentRoomId) return;

    setIsVoiceMessageSending(true);
    try {
      const client = await MatrixClientUtil.initialize();
      const uploadResponse = await client.uploadContent(blob);
      
      await client.sendMessage(currentRoomId, {
        body: 'Voice message',
        info: {
          size: blob.size,
          mimetype: blob.type,
        },
        msgtype: 'm.audio',
        url: uploadResponse.content_uri,
      });
      
      setError(null);
    } catch (err) {
      console.error('Error sending voice message:', err);
      setError('发送语音消息失败');
    } finally {
      setIsVoiceMessageSending(false);
    }
  }, [isConnected, currentRoomId]);

  const handleChatAction = useCallback((action: string) => {
    switch (action) {
      case 'analyze':
        // Handle data analysis
        break;
      case 'graph':
        // Handle graph drawing
        break;
      case 'report':
        // Handle report generation
        break;
      case 'new':
        setMessages([]);
        break;
    }
  }, []);

  const setCurrentRoom = useCallback(async (roomId: string) => {
    try {
      setCurrentRoomId(roomId);
      setMessages([]);
      processedMessagesRef.current.clear();
      setError(null);
      MatrixClientUtil.setCurrentRoomId(roomId);
    } catch (err) {
      console.error('Error switching room:', err);
      setError('切换房间失败');
    }
  }, []);

  const loadRoomMessages = useCallback(async (roomId: string) => {
    try {
      const roomMessages = await MatrixRoomService.getRoomMessages(roomId);
      
      const messagesWithProfiles = await Promise.all(
        roomMessages.map(async (message) => {
          const profile = await getOrFetchProfile(message.sender);
          return {
            ...message,
            avatar: profile?.avatar_url,
            displayName: profile?.displayname || message.sender.split(':')[0].substring(1)
          };
        })
      );

      // Add all loaded messages to the processed set
      messagesWithProfiles.forEach(msg => {
        processedMessagesRef.current.add(msg.id);
      });

      setMessages(messagesWithProfiles);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Error loading room messages:', err);
      setError('加载消息失败');
    }
  }, [getOrFetchProfile, scrollToBottom]);

  // Initialize Matrix client
  useEffect(() => {
    const initMatrix = async () => {
      try {
        const client = await MatrixClientUtil.initialize();
        clientRef.current = client;
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('Matrix init error:', err);
        setError('无法连接到聊天服务器');
        setIsConnected(false);
      }
    };

    initMatrix();

    return () => {
      MatrixClientUtil.cleanup();
    };
  }, []);

  // Set up room event listeners
  useEffect(() => {
    const cleanup = setupRoomListeners();
    return cleanup;
  }, [setupRoomListeners]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {
    messages,
    newMessage,
    isConnected,
    error,
    isVoiceMessageSending,
    clientRef,
    messagesEndRef,
    currentRoomId,
    setNewMessage,
    handleSend,
    handleKeyPress,
    handleVoiceRecording,
    handleChatAction,
    scrollToBottom,
    setCurrentRoom,
    loadRoomMessages
  };
}