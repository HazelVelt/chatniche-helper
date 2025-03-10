
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
      "flex mb-4 group",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 break-words relative",
        isUser 
          ? "bg-primary text-white rounded-tr-none shadow-sm"
          : "bg-secondary/60 text-foreground rounded-tl-none dark:bg-secondary/30 shadow-sm"
      )}>
        <p className="whitespace-pre-wrap text-sm md:text-base">{message.text}</p>
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
