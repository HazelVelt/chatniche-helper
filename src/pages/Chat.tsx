
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateChatResponse } from '@/utils/ollamaService';
import ChatMessage from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'user' | 'match';
  text: string;
  timestamp: Date;
  read?: boolean;
}

interface Conversation {
  id: string;
  matchName: string;
  matchImage: string;
  lastActive: Date;
  messages: Message[];
}

interface Match {
  id: string;
  name: string;
  image: string;
  age: number;
  bio: string;
}

// Mock data for demonstration
const mockConversations: Conversation[] = [];

const Chat = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [allConversations, setAllConversations] = useState<Conversation[]>(
    // Try to load from localStorage first, fall back to mock data
    JSON.parse(localStorage.getItem('conversations') || 'null') || mockConversations
  );
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load matches from localStorage
    const savedMatches = JSON.parse(localStorage.getItem('matches') || '[]');
    setMatches(savedMatches);
  }, []);
  
  useEffect(() => {
    if (id) {
      const conversation = allConversations.find(c => c.id === id);
      if (conversation) {
        setActiveConversation(conversation);
      } else {
        navigate('/chat');
      }
    } else {
      setActiveConversation(null);
    }
  }, [id, allConversations, navigate]);
  
  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);
  
  useEffect(() => {
    // Save conversations to localStorage
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
    
    // Update conversation with new message
    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, newMessage],
    };
    
    // Update all conversations
    const updatedConversations = allConversations.map(c => 
      c.id === updatedConversation.id ? updatedConversation : c
    );
    
    setAllConversations(updatedConversations);
    setActiveConversation(updatedConversation);
    setMessage('');
    
    // Simulate AI typing
    setIsTyping(true);
    try {
      // Generate AI response using Ollama
      const response = await generateChatResponse(message);
      
      // Create AI response message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'match',
        text: response,
        timestamp: new Date(),
      };
      
      // Update conversation with AI response
      const conversationWithResponse = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiMessage],
        lastActive: new Date(),
      };
      
      // Update all conversations
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
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const handleDeleteMessage = (messageId: string) => {
    if (!activeConversation) return;
    
    // Remove the message from conversation
    const updatedMessages = activeConversation.messages.filter(m => m.id !== messageId);
    
    const updatedConversation = {
      ...activeConversation,
      messages: updatedMessages
    };
    
    // Update all conversations
    const updatedConversations = allConversations.map(c => 
      c.id === updatedConversation.id ? updatedConversation : c
    );
    
    setAllConversations(updatedConversations);
    setActiveConversation(updatedConversation);
    
    toast.success('Message deleted');
  };
  
  const handleDeleteConversation = (conversationId: string) => {
    // Remove the conversation
    const updatedConversations = allConversations.filter(c => c.id !== conversationId);
    
    setAllConversations(updatedConversations);
    
    if (activeConversation?.id === conversationId) {
      navigate('/chat');
    }
    
    toast.success('Conversation removed');
  };
  
  const startNewConversation = (match: Match) => {
    // Check if conversation already exists
    const existingConvo = allConversations.find(c => c.matchName === match.name);
    
    if (existingConvo) {
      // Navigate to existing conversation
      navigate(`/chat/${existingConvo.id}`);
      return;
    }
    
    // Create new conversation
    const newConversation: Conversation = {
      id: Date.now().toString(),
      matchName: match.name,
      matchImage: match.image,
      lastActive: new Date(),
      messages: [
        {
          id: '1',
          sender: 'match',
          text: `Hi there! I'm ${match.name}. ${match.bio.split('.')[0]}.`,
          timestamp: new Date(),
          read: false
        }
      ]
    };
    
    const updatedConversations = [...allConversations, newConversation];
    setAllConversations(updatedConversations);
    
    // Navigate to the new conversation
    navigate(`/chat/${newConversation.id}`);
    
    toast.success(`Started conversation with ${match.name}`);
  };
  
  // Conversation list view with matches
  const ConversationList = () => (
    <div className="container max-w-lg mx-auto pt-16 pb-20 px-4">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      {/* Matches section */}
      {matches.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Your Matches</h2>
          <div className="flex overflow-x-auto pb-2 space-x-3 no-scrollbar">
            {matches.map(match => (
              <div 
                key={match.id} 
                className="flex flex-col items-center space-y-1 cursor-pointer"
                onClick={() => startNewConversation(match)}
              >
                <div className="relative">
                  <img 
                    src={match.image} 
                    alt={match.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1">
                    <Plus size={12} />
                  </div>
                </div>
                <span className="text-xs whitespace-nowrap">{match.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Conversations section */}
      <h2 className="text-lg font-medium mb-3">Conversations</h2>
      
      {allConversations.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No conversations yet.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/discover')}
          >
            Find Matches
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {allConversations.map(conversation => (
            <div 
              key={conversation.id}
              className="flex items-center p-3 rounded-xl hover:bg-secondary transition-colors relative group"
            >
              <div 
                className="flex-1 flex items-center cursor-pointer"
                onClick={() => navigate(`/chat/${conversation.id}`)}
              >
                <img 
                  src={conversation.matchImage} 
                  alt={conversation.matchName} 
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{conversation.matchName}</h3>
                    <span className="text-xs text-muted-foreground">
                      {new Date().toDateString() === conversation.lastActive.toDateString()
                        ? conversation.lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : conversation.lastActive.toLocaleDateString([], { month: 'short', day: 'numeric' })
                      }
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.messages.length > 0
                      ? conversation.messages[conversation.messages.length - 1].text
                      : 'No messages yet'
                    }
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => handleDeleteConversation(conversation.id)}
                className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete conversation"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  // Individual conversation view
  const ConversationView = () => {
    if (!activeConversation) return null;
    
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container max-w-lg mx-auto">
            <div className="flex items-center p-4">
              <button
                className="mr-3 p-1 rounded-full hover:bg-secondary transition-colors"
                onClick={() => navigate('/chat')}
              >
                <ArrowLeft size={20} />
              </button>
              
              <img 
                src={activeConversation.matchImage} 
                alt={activeConversation.matchName} 
                className="w-10 h-10 rounded-full object-cover mr-3"
              />
              
              <div>
                <h2 className="font-medium">{activeConversation.matchName}</h2>
                <p className="text-xs text-muted-foreground">
                  {new Date().toDateString() === activeConversation.lastActive.toDateString()
                    ? `Active today, ${activeConversation.lastActive.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : `Active ${activeConversation.lastActive.toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto pt-16 pb-20 px-4">
          <div className="container max-w-lg mx-auto">
            <div className="py-4">
              {activeConversation.messages.map(message => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onDelete={message.sender === 'user' ? handleDeleteMessage : undefined}
                />
              ))}
              
              {isTyping && (
                <div className="flex mb-3">
                  <div className="bg-secondary text-foreground rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
        
        {/* Message input */}
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-t border-border">
          <div className="container max-w-lg mx-auto p-4">
            <div className="flex items-center">
              <textarea
                className="flex-1 bg-secondary rounded-2xl py-3 px-4 outline-none resize-none max-h-[120px] dark:bg-secondary/50 dark:border-border/50"
                placeholder="Type a message..."
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              
              <Button
                variant="default"
                className="ml-2 rounded-full p-3 h-12 w-12 bg-primary hover:bg-primary/90"
                disabled={!message.trim() || isTyping}
                onClick={sendMessage}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render conversation list or individual conversation
  return activeConversation ? <ConversationView /> : <ConversationList />;
};

export default Chat;
