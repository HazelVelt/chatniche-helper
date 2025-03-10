
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-80 lg:left-96 p-4 bg-background/80 backdrop-blur-md border-t border-border/30">
      <div className="max-w-lg mx-auto">
        <div className="flex items-end">
          <div className="flex-1 bg-secondary/50 dark:bg-secondary/30 rounded-2xl px-4 py-2 border border-border/20 focus-within:border-primary/30 transition-colors">
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent outline-none resize-none text-sm md:text-base"
              placeholder="Type a message..."
              rows={1}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{ maxHeight: '120px', minHeight: '24px' }}
            />
          </div>
          
          <Button
            variant="default"
            size="icon"
            className="ml-2 rounded-full h-12 w-12 bg-primary hover:bg-primary/90 shadow-md"
            disabled={!value.trim() || isLoading}
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
