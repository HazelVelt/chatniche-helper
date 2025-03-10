
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, MessageSquare, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Conversation, Match } from '@/types/chat';
import { toast } from 'sonner';

interface ConversationListProps {
  conversations: Conversation[];
  matches: Match[];
  onStartConversation: (match: Match) => void;
  onDeleteConversation: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  matches,
  onStartConversation,
  onDeleteConversation
}) => {
  const navigate = useNavigate();

  return (
    <div className="container max-w-lg mx-auto pt-16 pb-20 px-4 overflow-y-auto h-full no-scrollbar">
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
                onClick={() => onStartConversation(match)}
              >
                <div className="relative">
                  <img 
                    src={match.image || '/placeholder.svg'} 
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
      
      <div className="bg-card dark:bg-card/50 rounded-xl p-4 border border-border/30 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            Conversations
          </h2>
          {conversations.length > 0 && (
            <span className="text-xs text-muted-foreground bg-secondary dark:bg-secondary/30 px-2 py-1 rounded-full">
              {conversations.length}
            </span>
          )}
        </div>
        
        {conversations.length === 0 ? (
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
            {conversations
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
                  
                  <Button
                    onClick={() => onDeleteConversation(conversation.id)}
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
};

export default ConversationList;
