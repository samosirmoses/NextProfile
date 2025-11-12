"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  conversationHistory: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearHistory: () => void;
  sessionId: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const addMessage = (message: ChatMessage) => {
    setConversationHistory(prev => [...prev, message]);
  };

  const clearHistory = () => {
    setConversationHistory([]);
  };

  return (
    <ChatContext.Provider value={{ conversationHistory, addMessage, clearHistory, sessionId }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
};

