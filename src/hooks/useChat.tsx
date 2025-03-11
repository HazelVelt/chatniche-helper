
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Conversation, Message, Match } from '@/types/chat';
import { generateAIResponse } from '@/utils/aiUtils';
import { useSettings } from '@/contexts/SettingsContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export const useChat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { modelSettings, useMockedServices } = useSettings();

  // Load conversations and matches from localStorage
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    
    let allConversations: Conversation[] = [];
    
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
    
    // Add any matches that don't have conversations yet
    matches.forEach((match: Match) => {
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

  // Handle route params and navigation
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

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  // Add a new match to conversations
  const addMatchToConversations = useCallback((match: Match) => {
    if (!conversations.some(conv => conv.id === match.id)) {
      const newConversation: Conversation = {
        id: match.id,
        matchName: match.name,
        matchImage: match.image,
        lastActive: new Date(),
        messages: []
      };
      
      setConversations(prev => [...prev, newConversation]);
      return newConversation;
    }
    return conversations.find(conv => conv.id === match.id);
  }, [conversations]);

  // Remove a match from conversations and matches list
  const removeMatch = useCallback((matchId: string) => {
    // Remove from conversations
    setConversations(prev => prev.filter(conv => conv.id !== matchId));
    
    // Remove from matches in localStorage
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    const updatedMatches = matches.filter((match: Match) => match.id !== matchId);
    localStorage.setItem('matches', JSON.stringify(updatedMatches));
    
    // Navigate to another conversation if current one is removed
    if (currentConversation?.id === matchId) {
      if (conversations.length > 1) {
        const nextConversation = conversations.find(conv => conv.id !== matchId);
        if (nextConversation) {
          navigate(`/chat/${nextConversation.id}`);
        }
      } else {
        navigate('/chat');
      }
    }
    
    toast.success("Match removed successfully");
  }, [conversations, currentConversation, navigate]);

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
      console.log(`Sending message to AI: ${text}`);
      console.log(`Using model: ${modelSettings.llmModel}, Mocked services: ${useMockedServices}`);
      
      // Check if this is an image request
      const isImageRequest = /what.*look.*like|show.*body|show.*picture|send.*photo|send.*pic|selfie/i.test(text.toLowerCase());
      
      const aiResponse = await generateAIResponse(text, modelSettings.llmModel);
      console.log(`Received AI response:`, aiResponse);
      
      // Ensure we get an image for image requests
      if (isImageRequest && !aiResponse.image) {
        console.log("Image request detected but no image was returned, trying again");
        // Explicitly prompt for NSFW content if requested
        try {
          const imagePrompt = `Attractive ${currentConversation.matchName}, dating profile picture, photorealistic portrait, highly detailed, professional photography, ${text.includes('nsfw') ? 'nsfw content allowed' : ''}`;
          const imageResponse = await generateAIResponse(imagePrompt, modelSettings.llmModel);
          aiResponse.image = imageResponse.image;
        } catch (imageError) {
          console.error("Error getting image on second attempt:", imageError);
        }
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
      toast.error('Error generating response. Please try again.');
      
      // Add a fallback message
      const fallbackMessage: Message = {
        id: uuidv4(),
        sender: 'match',
        text: "Sorry, I'm having trouble with my connection. Can we try again in a moment?",
        timestamp: new Date()
      };
      
      const conversationWithFallback = {
        ...updatedConversation,
        lastActive: new Date(),
        messages: [...updatedConversation.messages, fallbackMessage]
      };
      
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === currentConversation.id ? conversationWithFallback : conv
        )
      );
      
      setCurrentConversation(conversationWithFallback);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, setConversations, modelSettings.llmModel, useMockedServices]);

  return {
    conversations,
    currentConversation,
    messageText,
    setMessageText,
    isLoading,
    sendMessage,
    addMatchToConversations,
    removeMatch
  };
};
