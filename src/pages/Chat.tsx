
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateChatResponse } from '@/utils/ollamaService';
import { toast } from 'sonner';
import type { Message, Conversation, Match } from '@/types/chat';
import ChatMessage from '@/components/ChatMessage';
import ConversationHeader from '@/components/chat/ConversationHeader';
import ConversationList from '@/components/chat/ConversationList';
import MessageInput from '@/components/chat/MessageInput';

const Chat = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [allConversations, setAllConversations] = useState<Conversation[]>(
    JSON.parse(localStorage.getItem('conversations') || '[]')
  );
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const savedMatches = JSON.parse(localStorage.getItem('matches') || '[]');
    setMatches(savedMatches);
  }, []);
  
  useEffect(() => {
    if (id) {
      let conversation = allConversations.find(c => c.id === id);
      
      if (!conversation && id) {
        const matchedProfile = matches.find(m => m.id === id);
        
        if (matchedProfile) {
          conversation = {
            id: matchedProfile.id,
            matchName: matchedProfile.name,
            matchImage: matchedProfile.image,
            lastActive: new Date(),
            messages: [
              {
                id: Date.now().toString(),
                sender: 'match',
                text: `Hi there! I'm ${matchedProfile.name}. ${matchedProfile.bio.split('.')[0]}.`,
                timestamp: new Date(),
              }
            ]
          };
          
          const updatedConversations = [...allConversations, conversation];
          setAllConversations(updatedConversations);
          localStorage.setItem('conversations', JSON.stringify(updatedConversations));
        }
      }
      
      if (conversation) {
        setActiveConversation(conversation);
      } else {
        navigate('/chat');
      }
    } else {
      setActiveConversation(null);
    }
  }, [id, allConversations, navigate, matches]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);
  
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(allConversations));
  }, [allConversations]);
  
  const sendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: message,
      timestamp: new Date(),
    };
    
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage],
      lastActive: new Date(),
    };
    
    const updatedConversations = allConversations.map(c => 
      c.id === updatedConversation.id ? updatedConversation : c
    );
    
    setAllConversations(updatedConversations);
    setActiveConversation(updatedConversation);
    setMessage('');
    
    setIsTyping(true);
    try {
      const response = await generateChatResponse(message);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'match',
        text: response,
        timestamp: new Date(),
      };
      
      const conversationWithResponse = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiMessage],
        lastActive: new Date(),
      };
      
      const conversationsWithResponse = updatedConversations.map(c => 
        c.id === conversationWithResponse.id ? conversationWithResponse : c
      );
      
      setAllConversations(conversationsWithResponse);
      setActiveConversation(conversationWithResponse);
    } catch (error) {
      console.error('Error generating AI response', error);
      toast.error('Failed to generate response. Please check if Ollama is running.');
    } finally {
      setIsTyping(false);
    }
  };
  
  const handleDeleteMessage = (messageId: string) => {
    if (!activeConversation) return;
    
    const updatedMessages = activeConversation.messages.filter(m => m.id !== messageId);
    
    const updatedConversation = {
      ...activeConversation,
      messages: updatedMessages
    };
    
    const updatedConversations = allConversations.map(c => 
      c.id === updatedConversation.id ? updatedConversation : c
    );
    
    setAllConversations(updatedConversations);
    setActiveConversation(updatedConversation);
    
    toast.success('Message deleted');
  };
  
  const handleDeleteConversation = (conversationId: string) => {
    const updatedConversations = allConversations.filter(c => c.id !== conversationId);
    
    setAllConversations(updatedConversations);
    
    if (activeConversation?.id === conversationId) {
      navigate('/chat');
    }
    
    toast.success('Conversation removed');
  };
  
  const startNewConversation = (match: Match) => {
    const existingConvo = allConversations.find(c => c.id === match.id);
    
    if (existingConvo) {
      navigate(`/chat/${existingConvo.id}`);
      return;
    }
    
    const newConversation: Conversation = {
      id: match.id,
      matchName: match.name,
      matchImage: match.image,
      lastActive: new Date(),
      messages: [
        {
          id: Date.now().toString(),
          sender: 'match',
          text: `Hi there! I'm ${match.name}. ${match.bio.split('.')[0]}.`,
          timestamp: new Date(),
        }
      ]
    };
    
    const updatedConversations = [...allConversations, newConversation];
    setAllConversations(updatedConversations);
    
    navigate(`/chat/${newConversation.id}`);
    
    toast.success(`Started conversation with ${match.name}`);
  };

  const TypingIndicator = () => (
    <div className="flex mb-4 justify-start">
      <div className="bg-secondary/60 text-foreground rounded-2xl rounded-tl-none px-4 py-3 dark:bg-secondary/30 shadow-sm">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
  
  if (!activeConversation) {
    return (
      <ConversationList
        conversations={allConversations}
        matches={matches}
        onStartConversation={startNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />
    );
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ConversationHeader
        matchName={activeConversation.matchName}
        matchImage={activeConversation.matchImage}
        lastActive={activeConversation.lastActive}
      />
      
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto no-scrollbar pt-20 pb-24 px-4 h-[calc(100vh-128px)]"
      >
        <div className="container max-w-lg mx-auto">
          <div className="py-4 space-y-0">
            {activeConversation.messages.map(message => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onDelete={message.sender === 'user' ? handleDeleteMessage : undefined}
              />
            ))}
            
            {isTyping && <TypingIndicator />}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      <MessageInput
        message={message}
        setMessage={setMessage}
        onSend={sendMessage}
        isTyping={isTyping}
      />
    </div>
  );
};

export default Chat;
