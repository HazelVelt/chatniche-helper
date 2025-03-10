
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateChatResponse } from '@/utils/ollamaService';
import ChatMessage from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Trash2, Plus, MessageSquare, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
    // Load matches from localStorage
    const savedMatches = JSON.parse(localStorage.getItem('matches') || '[]');
    setMatches(savedMatches);
  }, []);
  
  useEffect(() => {
    if (id) {
      // Check if conversation exists
      let conversation = allConversations.find(c => c.id === id);
      
      // If conversation doesn't exist but we have an ID, check if it's a match ID
      if (!conversation && id) {
        const matchedProfile = matches.find(m => m.id === id);
        
        if (matchedProfile) {
          // Create new conversation
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
          
          // Add to all conversations
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
      lastActive: new Date(),
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
    const existingConvo = allConversations.find(c => c.id === match.id);
    
    if (existingConvo) {
      // Navigate to existing conversation
      navigate(`/chat/${existingConvo.id}`);
      return;
    }
    
    // Create new conversation
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
    
    // Navigate to the new conversation
    navigate(`/chat/${newConversation.id}`);
    
    toast.success(`Started conversation with ${match.name}`);
  };
  
  // Conversation list view with matches
  const ConversationList = () => (
    <div className="container max-w-lg mx-auto pt-16 pb-20 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => navigate('/discover')} 
          className="flex items-center gap-1 text-sm"
        >
          <UserPlus size={14} />
          Find More
        </Button>
      </div>
      
      {/* Matches section */}
      <div className="mb-6 bg-card dark:bg-card/50 rounded-xl p-4 border border-border/30 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Your Matches
          </h2>
          <span className="text-xs text-muted-foreground bg-secondary dark:bg-secondary/30 px-2 py-1 rounded-full">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'}
          </span>
        </div>
        
        {matches.length > 0 ? (
          <div className="flex overflow-x-auto pb-2 space-x-4 no-scrollbar">
            {matches.map(match => (
              <div 
                key={match.id} 
                className="flex flex-col items-center space-y-2 cursor-pointer transition-transform hover:translate-y-[-4px]"
                onClick={() => startNewConversation(match)}
              >
                <div className="relative">
                  <img 
                    src={match.image} 
                    alt={match.name} 
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-1 shadow-sm">
                    <MessageSquare size={10} />
                  </div>
                </div>
                <span className="text-xs font-medium whitespace-nowrap">{match.name}, {match.age}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 bg-secondary/30 dark:bg-secondary/10 rounded-lg">
            <p className="text-muted-foreground text-sm">No matches yet. Go discover!</p>
            <Button 
              variant="link" 
              onClick={() => navigate('/discover')} 
              className="mt-2 text-primary"
            >
              Start matching
            </Button>
          </div>
        )}
      </div>
      
      {/* Conversations section */}
      <div className="bg-card dark:bg-card/50 rounded-xl p-4 border border-border/30 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            Conversations
          </h2>
          {allConversations.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary dark:bg-secondary/30 px-2 py-1 rounded-full">
              {allConversations.length}
            </span>
          )}
        </div>
        
        {allConversations.length === 0 ? (
          <div className="text-center py-6 bg-secondary/30 dark:bg-secondary/10 rounded-lg">
            <p className="text-muted-foreground mb-2">Start a conversation with your matches</p>
            {matches.length > 0 ? (
              <p className="text-sm text-muted-foreground">Click on any match above to chat</p>
            ) : (
              <Button 
                variant="default" 
                className="mt-2"
                onClick={() => navigate('/discover')}
              >
                Find Matches
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {allConversations
              .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
              .map(conversation => (
              <div 
                key={conversation.id}
                className="flex items-center p-3 rounded-xl hover:bg-secondary dark:hover:bg-secondary/30 transition-colors relative group border border-transparent hover:border-border/20"
              >
                <div 
                  className="flex-1 flex items-center cursor-pointer"
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                >
                  <div className="relative">
                    <img 
                      src={conversation.matchImage} 
                      alt={conversation.matchName} 
                      className="w-12 h-12 rounded-full object-cover mr-3 border border-border/30"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{conversation.matchName}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date().toDateString() === new Date(conversation.lastActive).toDateString()
                          ? new Date(conversation.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(conversation.lastActive).toLocaleDateString([], { month: 'short', day: 'numeric' })
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
                
                <Button
                  onClick={() => handleDeleteConversation(conversation.id)}
                  variant="ghost"
                  size="icon"
                  className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Delete conversation"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  
  // Individual conversation view
  const ConversationView = () => {
    if (!activeConversation) return null;
    
    return (
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/30">
          <div className="container max-w-lg mx-auto">
            <div className="flex items-center p-4">
              <Button
                variant="ghost"
                size="icon"
                className="mr-3 rounded-full"
                onClick={() => navigate('/chat')}
                aria-label="Back to conversations"
              >
                <ArrowLeft size={18} />
              </Button>
              
              <div className="relative">
                <img 
                  src={activeConversation.matchImage} 
                  alt={activeConversation.matchName} 
                  className="w-10 h-10 rounded-full object-cover mr-3 border border-border/30"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              
              <div>
                <h2 className="font-medium">{activeConversation.matchName}</h2>
                <p className="text-xs text-muted-foreground">
                  {new Date().toDateString() === new Date(activeConversation.lastActive).toDateString()
                    ? `Active today, ${new Date(activeConversation.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    : `Active ${new Date(activeConversation.lastActive).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto no-scrollbar pt-20 pb-24 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="container max-w-lg mx-auto">
            <div className="py-4 space-y-4">
              {activeConversation.messages.map(message => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  onDelete={message.sender === 'user' ? handleDeleteMessage : undefined}
                />
              ))}
              
              {isTyping && (
                <div className="flex mb-3">
                  <div className={cn(
                    "bg-secondary text-foreground rounded-2xl rounded-tl-none px-4 py-3",
                    "dark:bg-secondary/40"
                  )}>
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
        <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-t border-border/30">
          <div className="container max-w-lg mx-auto p-4">
            <div className="flex items-center">
              <textarea
                className="flex-1 bg-secondary/50 dark:bg-secondary/30 rounded-2xl py-3 px-4 outline-none resize-none max-h-[120px] border border-border/20 focus:border-primary/30 transition-colors"
                placeholder="Type a message..."
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              
              <Button
                variant="default"
                size="icon"
                className="ml-2 rounded-full h-12 w-12 bg-primary hover:bg-primary/90"
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
