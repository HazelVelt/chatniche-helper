
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, MessageSquare, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Conversation } from '@/types/chat';
import { toast } from 'sonner';

interface ConversationListProps {
  conversations: Conversation[];
  onCreateNew: () => void;
  onDeleteConversation?: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onCreateNew,
  onDeleteConversation
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-y-auto h-[calc(100vh-8rem)]">
      <div className="p-4 space-y-4">
        <Button 
          onClick={onCreateNew} 
          variant="outline" 
          className="w-full justify-start text-primary"
        >
          <UserPlus size={16} className="mr-2" />
          Find New Matches
        </Button>
        
        {conversations.length === 0 ? (
          <div className="text-center py-8 bg-secondary/20 rounded-lg mt-4">
            <p className="text-muted-foreground">No conversations yet</p>
            <Button 
              variant="link" 
              onClick={onCreateNew} 
              className="mt-2 text-primary"
            >
              Start matching
            </Button>
          </div>
        ) : (
          <div className="space-y-2 mt-4">
            {conversations
              .sort((a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime())
              .map(conversation => (
                <div 
                  key={conversation.id}
                  className="flex items-center p-3 rounded-xl hover:bg-secondary/50 transition-colors relative group border border-transparent hover:border-border/20"
                >
                  <div 
                    className="flex-1 flex items-center cursor-pointer"
                    onClick={() => navigate(`/chat/${conversation.id}`)}
                  >
                    <div className="relative">
                      <img 
                        src={conversation.matchImage || '/placeholder.svg'} 
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
                  
                  {onDeleteConversation && (
                    <Button
                      onClick={() => onDeleteConversation(conversation.id)}
                      variant="ghost"
                      size="icon"
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
