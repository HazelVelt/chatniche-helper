
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/hooks/useChat';
import ConversationHeader from '@/components/chat/ConversationHeader';
import ConversationList from '@/components/chat/ConversationList';
import MessageInput from '@/components/chat/MessageInput';
import ChatMessage from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const Chat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    conversations,
    currentConversation,
    messageText,
    setMessageText,
    isLoading,
    sendMessage
  } = useChat();
  
  // Scroll to bottom of messages on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentConversation?.messages]);
  
  const handleCreateNewChat = () => {
    // In a real app, this would fetch a new match
    // For now, we'll just navigate back to discover
    navigate('/discover');
  };
  
  // If no conversations exist yet
  if (conversations.length === 0) {
    return (
      <div className="min-h-screen pt-16 pb-20 md:pb-8 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">No conversations yet</h1>
          <p className="text-muted-foreground mb-6">
            Start swiping on profiles in the Discover tab to match and begin conversations.
          </p>
          <Button onClick={() => navigate('/discover')}>
            Go to Discover
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="pt-16 pb-20 md:pb-8 flex flex-col md:flex-row h-screen">
      {/* Mobile view: show either conversation list or chat */}
      <div className={`${currentConversation ? 'hidden md:block' : 'block'} w-full md:w-80 lg:w-96 border-r border-border/30 md:h-screen fixed md:top-16 top-16 left-0 right-0 bottom-0 bg-background z-10`}>
        <div className="p-4 border-b border-border/30">
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-8rem)]">
          <ConversationList 
            conversations={conversations}
            onCreateNew={handleCreateNewChat}
          />
        </div>
      </div>
      
      {/* Chat view */}
      <div className={`${currentConversation ? 'block' : 'hidden md:block'} flex-1 md:ml-80 lg:ml-96 relative h-[calc(100vh-4rem)]`}>
        {currentConversation ? (
          <>
            <ConversationHeader
              matchName={currentConversation.matchName}
              matchImage={currentConversation.matchImage}
              lastActive={currentConversation.lastActive}
            />
            
            <div className="overflow-y-auto p-4 pb-24 md:pb-20 h-[calc(100vh-10rem)]">
              <div className="max-w-lg mx-auto space-y-4">
                {currentConversation.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    matchImage={currentConversation.matchImage}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-80 lg:left-96 p-4 bg-background/80 backdrop-blur-md border-t border-border/30">
              <div className="max-w-lg mx-auto">
                <MessageInput
                  value={messageText}
                  onChange={setMessageText}
                  onSend={() => sendMessage(messageText)}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center max-w-md">
              <p className="text-muted-foreground mb-4">
                Select a conversation or start a new one
              </p>
              <Button onClick={handleCreateNewChat}>
                Find New Matches
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
