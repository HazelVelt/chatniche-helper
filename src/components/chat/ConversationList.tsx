
import React from 'react';
import { Conversation } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ConversationListProps {
  conversations: Conversation[];
  onCreateNew: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, onCreateNew }) => {
  const navigate = useNavigate();
  
  return (
    <div className="overflow-y-auto h-[calc(100vh-8rem)]">
      <div className="p-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 mb-4"
          onClick={onCreateNew}
        >
          <PlusCircle size={16} />
          Find New Matches
        </Button>
      </div>
      
      <div className="space-y-0.5">
        {conversations.map((conversation) => (
          <div 
            key={conversation.id}
            className="p-4 flex items-center gap-3 hover:bg-secondary/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/chat/${conversation.id}`)}
          >
            <div className="h-12 w-12 rounded-full overflow-hidden">
              <img 
                src={conversation.matchImage || '/placeholder.svg'} 
                alt={conversation.matchName} 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-foreground truncate">{conversation.matchName}</h3>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {formatDistanceToNow(conversation.lastActive, { addSuffix: true })}
                </span>
              </div>
              {conversation.messages.length > 0 ? (
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.messages[conversation.messages.length - 1].text}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Start a conversation
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
