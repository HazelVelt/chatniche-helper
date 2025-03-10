
import React, { useState } from 'react';
import Button from '@/components/Button';
import { Settings, LogOut, ChevronRight, Heart, MessageSquare, Edit } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const userProfile = {
    name: 'Alex Morgan',
    age: 28,
    location: 'San Francisco, CA',
    bio: 'Software engineer by day, photographer by night. Looking for someone to share adventures with.',
    imageUrl: 'https://source.unsplash.com/random/400x400?portrait',
    interests: ['Photography', 'Hiking', 'Coffee', 'Travel', 'Music'],
    stats: {
      matches: 32,
      conversations: 14,
      likes: 128
    }
  };
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Save profile logic would go here
      toast.success('Profile updated successfully!');
    }
  };
  
  const handleLogout = () => {
    toast.info('You have been logged out.');
    // Logout logic would go here
  };
  
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8 px-4">
      <div className="container max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="p-2 h-9 w-9" 
              onClick={() => toast.info('Settings coming soon!')}
            >
              <Settings size={18} />
            </Button>
            <Button 
              variant="outline" 
              className="p-2 h-9 w-9 text-red-500" 
              onClick={handleLogout}
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
        
        {/* Profile Card */}
        <div className="bg-white border border-border rounded-2xl card-shadow mb-6 animate-fade-in">
          <div className="relative">
            <img 
              src={userProfile.imageUrl} 
              alt={userProfile.name} 
              className="w-full h-52 object-cover rounded-t-2xl"
            />
            
            <button 
              className="absolute top-3 right-3 bg-white/90 text-foreground backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
              onClick={toggleEdit}
            >
              <Edit size={18} />
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/60 to-transparent text-white">
              <h2 className="text-xl font-bold">{userProfile.name}, {userProfile.age}</h2>
              <p className="text-sm text-white/80">{userProfile.location}</p>
            </div>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <h3 className="text-sm text-muted-foreground mb-1">About me</h3>
              {isEditing ? (
                <textarea 
                  className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  defaultValue={userProfile.bio}
                  rows={3}
                />
              ) : (
                <p>{userProfile.bio}</p>
              )}
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm text-muted-foreground mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest, index) => (
                  <span 
                    key={index}
                    className="bg-secondary text-foreground text-sm py-1 px-3 rounded-full"
                  >
                    {interest}
                  </span>
                ))}
                {isEditing && (
                  <button className="bg-secondary text-primary text-sm py-1 px-3 rounded-full">
                    + Add
                  </button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-secondary rounded-xl p-3 text-center">
                <div className="text-xl font-semibold text-primary">{userProfile.stats.matches}</div>
                <div className="text-xs text-muted-foreground">Matches</div>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <div className="text-xl font-semibold text-primary">{userProfile.stats.conversations}</div>
                <div className="text-xs text-muted-foreground">Chats</div>
              </div>
              <div className="bg-secondary rounded-xl p-3 text-center">
                <div className="text-xl font-semibold text-primary">{userProfile.stats.likes}</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
            </div>
            
            {isEditing && (
              <Button onClick={toggleEdit} className="w-full">
                Save Changes
              </Button>
            )}
          </div>
        </div>
        
        {/* Settings Menu */}
        <div className="bg-white border border-border rounded-2xl card-shadow animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="p-4">
            <h3 className="font-medium mb-2">Settings</h3>
            
            <div className="space-y-1">
              <MenuItem 
                icon={<Heart size={18} />} 
                title="Dating Preferences" 
                onClick={() => toast.info('Dating preferences coming soon!')}
              />
              <MenuItem 
                icon={<MessageSquare size={18} />} 
                title="Notifications" 
                onClick={() => toast.info('Notification settings coming soon!')}
              />
              <MenuItem 
                icon={<Settings size={18} />} 
                title="Privacy & Security" 
                onClick={() => toast.info('Privacy settings coming soon!')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onClick }) => (
  <button 
    className="w-full flex items-center justify-between p-3 hover:bg-secondary rounded-xl transition-colors text-left"
    onClick={onClick}
  >
    <div className="flex items-center">
      <span className="text-muted-foreground mr-3">{icon}</span>
      <div>
        <div className="font-medium">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </div>
    <ChevronRight size={18} className="text-muted-foreground" />
  </button>
);

export default Profile;
