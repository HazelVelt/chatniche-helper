
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Conversation, Message } from '@/types/chat';
import { generateAIResponse } from '@/utils/aiUtils';
import { useSettings } from '@/contexts/SettingsContext';
import { v4 as uuidv4 } from 'uuid';

export const useChat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { modelSettings } = useSettings();

  // Load conversations from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      
      // Convert string dates back to Date objects
      const conversationsWithDates = parsed.map((conv: any) => ({
        ...conv,
        lastActive: new Date(conv.lastActive),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      
      setConversations(conversationsWithDates);
    }
  }, []);

  // Set current conversation based on route parameter
  useEffect(() => {
    if (id) {
      const conversation = conversations.find(conv => conv.id === id);
      setCurrentConversation(conversation || null);
      
      // If conversation not found and we have conversations, navigate to the first one
      if (!conversation && conversations.length > 0) {
        navigate(`/chat/${conversations[0].id}`);
      }
    } else if (conversations.length > 0) {
      // No specific conversation selected, navigate to the first one
      navigate(`/chat/${conversations[0].id}`);
    }
  }, [id, conversations, navigate]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !currentConversation) return;
    
    // Create new user message
    const userMessage: Message = {
      id: uuidv4(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    
    // Add user message to conversation
    const updatedConversation = {
      ...currentConversation,
      lastActive: new Date(),
      messages: [...currentConversation.messages, userMessage]
    };
    
    // Update conversations state
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === currentConversation.id ? updatedConversation : conv
      )
    );
    
    setCurrentConversation(updatedConversation);
    setMessageText('');
    
    // Generate AI response
    setIsLoading(true);
    try {
      const aiResponse = await generateChatResponse(text, modelSettings.llmModel);
      
      // Create AI response message
      const matchMessage: Message = {
        id: uuidv4(),
        sender: 'match',
        text: aiResponse.text,
        timestamp: new Date(),
        image: aiResponse.image
      };
      
      // Add AI message to conversation
      const conversationWithAiResponse = {
        ...updatedConversation,
        lastActive: new Date(),
        messages: [...updatedConversation.messages, matchMessage]
      };
      
      // Update conversations state again
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === currentConversation.id ? conversationWithAiResponse : conv
        )
      );
      
      setCurrentConversation(conversationWithAiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, setConversations, modelSettings.llmModel]);

  return {
    conversations,
    currentConversation,
    messageText,
    setMessageText,
    isLoading,
    sendMessage
  };
};
