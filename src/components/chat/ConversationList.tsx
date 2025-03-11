
import React from 'react';
import { Conversation } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ConversationListProps {
  conversations: Conversation[];
  onCreateNew: () => void;
  onRemoveMatch?: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  onCreateNew, 
  onRemoveMatch 
}) => {
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = React.useState(false);
  const [selectedConversation, setSelectedConversation] = React.useState<string | null>(null);
  
  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedConversation(id);
    setShowDialog(true);
  };
  
  const confirmRemove = () => {
    if (selectedConversation && onRemoveMatch) {
      onRemoveMatch(selectedConversation);
    }
    setShowDialog(false);
  };
  
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
            className="p-4 flex items-center gap-3 hover:bg-secondary/50 cursor-pointer transition-colors group relative"
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
            {onRemoveMatch && (
              <button 
                onClick={(e) => handleRemove(conversation.id, e)}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-secondary"
                aria-label={`Remove ${conversation.matchName}`}
              >
                <X size={16} className="text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Match</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this match? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ConversationList;
