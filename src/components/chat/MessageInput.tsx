
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSend: () => void;
  isTyping: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  onSend,
  isTyping
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-t border-border/30 shadow-sm">
      <div className="container max-w-lg mx-auto p-4">
        <div className="flex items-end">
          <div className="flex-1 bg-secondary/50 dark:bg-secondary/30 rounded-2xl px-4 py-2 border border-border/20 focus-within:border-primary/30 transition-colors">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent outline-none resize-none text-sm md:text-base"
              placeholder="Type a message..."
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{ maxHeight: '120px', minHeight: '24px' }}
            />
          </div>
          
          <Button
            variant="default"
            size="icon"
            className="ml-2 rounded-full h-12 w-12 bg-primary hover:bg-primary/90 shadow-md"
            disabled={!message.trim() || isTyping}
            onClick={onSend}
            aria-label="Send message"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
