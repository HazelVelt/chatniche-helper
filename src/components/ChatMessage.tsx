
import React from 'react';
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
  };
  onDelete?: (id: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onDelete }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "flex mb-3 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2.5 break-words relative",
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
        
        {onDelete && isUser && (
          <button 
            onClick={() => onDelete(message.id)}
            className="absolute -left-8 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-white/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete message"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
