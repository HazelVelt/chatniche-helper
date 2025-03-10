
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: {
    id: string;
    sender: 'user' | 'match';
    text: string;
    timestamp: Date;
    read?: boolean;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex mb-3",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2.5 break-words",
        isUser 
          ? "bg-primary text-white rounded-tr-none"
          : "bg-secondary text-foreground rounded-tl-none"
      )}>
        <p>{message.text}</p>
        <div className={cn(
          "text-xs mt-1 flex justify-end",
          isUser ? "text-white/70" : "text-muted-foreground"
        )}>
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
          {isUser && message.read && (
            <span className="ml-1">• Read</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
