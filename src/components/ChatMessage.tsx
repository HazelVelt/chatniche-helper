
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    sender: 'user' | 'match';
    text: string;
    timestamp: Date;
    read?: boolean;
    image?: string;
  };
  matchImage?: string;
  onDelete?: (id: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, matchImage, onDelete }) => {
  const isUser = message.sender === 'user';
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(!isUser);
  const [typingComplete, setTypingComplete] = useState(isUser);
  
  // Simulate typing effect for AI messages
  useEffect(() => {
    if (isUser) {
      setDisplayText(message.text);
      return;
    }

    let i = 0;
    setDisplayText('');
    setIsTyping(true);
    setTypingComplete(false);
    
    const typingInterval = setInterval(() => {
      if (i < message.text.length) {
        setDisplayText(prev => prev + message.text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setTypingComplete(true);
      }
    }, 15); // Speed of typing
    
    return () => clearInterval(typingInterval);
  }, [message.text, isUser]);
  
  return (
    <div className={cn(
      "flex mb-4 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && matchImage && (
        <div className="h-8 w-8 rounded-full overflow-hidden mr-2 mt-1">
          <img 
            src={matchImage || '/placeholder.svg'} 
            alt="Match" 
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 break-words relative",
        isUser 
          ? "bg-primary text-white rounded-tr-none shadow-sm"
          : "bg-secondary/60 text-foreground rounded-tl-none dark:bg-secondary/30 shadow-sm"
      )}>
        <p className="whitespace-pre-wrap text-sm md:text-base">{displayText}</p>
        
        {!isUser && isTyping && (
          <span className="inline-flex ml-1">
            <span className="animate-pulse">.</span>
            <span className="animate-pulse animation-delay-200">.</span>
            <span className="animate-pulse animation-delay-400">.</span>
          </span>
        )}
        
        {message.image && typingComplete && (
          <div className="mt-2 rounded-lg overflow-hidden">
            <img 
              src={`data:image/jpeg;base64,${message.image}`}
              alt="Generated"
              className="w-full h-auto max-h-[300px] object-cover"
            />
          </div>
        )}
        
        <div className={cn(
          "text-xs mt-1.5 flex justify-between items-center gap-1",
          isUser ? "text-white/70" : "text-muted-foreground"
        )}>
          <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>
          {isUser && message.read && (
            <span className="text-xs">• Read</span>
          )}
        </div>
        
        {onDelete && isUser && (
          <button 
            onClick={() => onDelete(message.id)}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full bg-secondary/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete message"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
