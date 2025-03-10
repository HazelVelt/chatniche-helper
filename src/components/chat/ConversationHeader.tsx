
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversationHeaderProps {
  matchName: string;
  matchImage: string;
  lastActive: Date;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  matchName,
  matchImage,
  lastActive
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/30 shadow-sm">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-3 rounded-full hover:bg-secondary/80"
            onClick={() => navigate('/chat')}
            aria-label="Back to conversations"
          >
            <ArrowLeft size={18} />
          </Button>
          
          <div className="relative">
            <img 
              src={matchImage || '/placeholder.svg'} 
              alt={matchName} 
              className="w-10 h-10 rounded-full object-cover mr-3 border border-border/30"
            />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          
          <div className="flex-1">
            <h2 className="font-medium">{matchName}</h2>
            <p className="text-xs text-muted-foreground">
              {new Date().toDateString() === new Date(lastActive).toDateString()
                ? `Active today, ${new Date(lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : `Active ${new Date(lastActive).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
