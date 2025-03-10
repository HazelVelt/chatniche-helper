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

  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    
    let allConversations = [];
    
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      allConversations = parsed.map((conv: any) => ({
        ...conv,
        lastActive: new Date(conv.lastActive),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
    
    matches.forEach((match: any) => {
      if (!allConversations.some((conv: Conversation) => conv.id === match.id)) {
        allConversations.push({
          id: match.id,
          matchName: match.name,
          matchImage: match.image,
          lastActive: new Date(),
          messages: []
        });
      }
    });
    
    setConversations(allConversations);
  }, []);

  useEffect(() => {
    if (id) {
      const conversation = conversations.find(conv => conv.id === id);
      setCurrentConversation(conversation || null);
      
      if (!conversation && conversations.length > 0) {
        navigate(`/chat/${conversations[0].id}`);
      }
    } else if (conversations.length > 0) {
      navigate(`/chat/${conversations[0].id}`);
    }
  }, [id, conversations, navigate]);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !currentConversation) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    
    const updatedConversation = {
      ...currentConversation,
      lastActive: new Date(),
      messages: [...currentConversation.messages, userMessage]
    };
    
    setConversations(prevConversations => 
      prevConversations.map(conv => 
        conv.id === currentConversation.id ? updatedConversation : conv
      )
    );
    
    setCurrentConversation(updatedConversation);
    setMessageText('');
    
    setIsLoading(true);
    try {
      const isImageRequest = /what.*look.*like|show.*body|show.*picture|send.*photo|send.*pic/i.test(text.toLowerCase());
      
      const aiResponse = await generateAIResponse(text, modelSettings.llmModel);
      
      if (isImageRequest && !aiResponse.image) {
        const imagePrompt = `Attractive ${currentConversation.matchName}, dating profile picture, photorealistic portrait, highly detailed, professional photography`;
        const imageResponse = await generateAIResponse(imagePrompt, modelSettings.llmModel);
        aiResponse.image = imageResponse.image;
      }
      
      const matchMessage: Message = {
        id: uuidv4(),
        sender: 'match',
        text: aiResponse.text || "",
        timestamp: new Date(),
        image: aiResponse.image
      };
      
      const conversationWithAiResponse = {
        ...updatedConversation,
        lastActive: new Date(),
        messages: [...updatedConversation.messages, matchMessage]
      };
      
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
