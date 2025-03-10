
import React, { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { Settings, LogOut, ChevronRight, Heart, MessageSquare, Moon, Edit } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import ProfileForm from '@/components/ProfileForm';
import ProfileSetup from '@/components/ProfileSetup';
import DatingPreferences from '@/components/DatingPreferences';

const Profile = () => {
  const [activeSection, setActiveSection] = useState<'profile' | 'preferences' | null>(null);
  const [profileCreated, setProfileCreated] = useState(false);
  
  const [userProfile, setUserProfile] = useState(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileCreated(true);
      return JSON.parse(savedProfile);
    }
    return {
      name: '',
      age: 18,
      location: '',
      bio: '',
      imageUrl: '',
      interests: [],
      stats: {
        matches: 0,
        conversations: 0,
        likes: 0
      }
    };
  });
  
  const [datingPreferences, setDatingPreferences] = useState(() => {
    const savedPreferences = localStorage.getItem('datingPreferences');
    return savedPreferences ? JSON.parse(savedPreferences) : {
      interestedIn: 'Everyone',
      ageRange: [21, 35] as [number, number],
      distance: 25,
      showMe: true
    };
  });
  
  useEffect(() => {
    // Only save to localStorage if the profile has been created
    if (profileCreated) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
  }, [userProfile, profileCreated]);
  
  useEffect(() => {
    localStorage.setItem('datingPreferences', JSON.stringify(datingPreferences));
  }, [datingPreferences]);
  
  const handleSaveProfile = (updatedProfile: any) => {
    setUserProfile({
      ...userProfile,
      ...updatedProfile
    });
    setProfileCreated(true);
    setActiveSection(null);
  };
  
  const handleCreateProfile = (newProfile: any) => {
    setUserProfile(newProfile);
    setProfileCreated(true);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };
  
  const handleSavePreferences = (updatedPreferences: any) => {
    setDatingPreferences({
      ...datingPreferences,
      ...updatedPreferences
    });
    setActiveSection(null);
  };
  
  const handleLogout = () => {
    toast.info('You have been logged out.');
    // Logout logic would go here
  };
  
  // Renders the content based on active section or profile creation state
  const renderContent = () => {
    // If profile hasn't been created yet, show the profile setup
    if (!profileCreated) {
      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 text-center">Create Your Profile</h2>
          <p className="text-muted-foreground mb-6 text-center">Please create your profile to start matching with others.</p>
          <ProfileSetup onComplete={handleCreateProfile} />
        </div>
      );
    }
    
    if (activeSection === 'profile') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
          <ProfileForm 
            userProfile={userProfile}
            onSave={handleSaveProfile}
            onCancel={() => setActiveSection(null)}
          />
        </div>
      );
    }
    
    if (activeSection === 'preferences') {
      return (
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-6">Dating Preferences</h2>
          <DatingPreferences 
            preferences={datingPreferences}
            onSave={handleSavePreferences}
            onCancel={() => setActiveSection(null)}
          />
        </div>
      );
    }
    
    return (
      <>
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl card-shadow mb-6 animate-fade-in dark:border-border/30">
          <div className="relative">
            <img 
              src={userProfile.imageUrl} 
              alt={userProfile.name} 
              className="w-full h-52 object-cover rounded-t-2xl"
            />
            
            <button 
              className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 text-foreground backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-black/80 transition-colors"
              onClick={() => setActiveSection('profile')}
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
              <p>{userProfile.bio}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm text-muted-foreground mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-secondary dark:bg-secondary/30 text-foreground text-sm py-1 px-3 rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-secondary dark:bg-secondary/30 rounded-xl p-3 text-center">
                <div className="text-xl font-semibold text-primary">{userProfile.stats.matches}</div>
                <div className="text-xs text-muted-foreground">Matches</div>
              </div>
              <div className="bg-secondary dark:bg-secondary/30 rounded-xl p-3 text-center">
                <div className="text-xl font-semibold text-primary">{userProfile.stats.conversations}</div>
                <div className="text-xs text-muted-foreground">Chats</div>
              </div>
              <div className="bg-secondary dark:bg-secondary/30 rounded-xl p-3 text-center">
                <div className="text-xl font-semibold text-primary">{userProfile.stats.likes}</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings Menu */}
        <div className="bg-card border border-border rounded-2xl card-shadow animate-fade-in dark:border-border/30" style={{ animationDelay: '100ms' }}>
          <div className="p-4">
            <h3 className="font-medium mb-2">Settings</h3>
            
            <div className="space-y-1">
              <MenuItem 
                icon={<Heart size={18} />} 
                title="Dating Preferences" 
                onClick={() => setActiveSection('preferences')}
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
              <MenuItem 
                icon={<Moon size={18} />} 
                title="Dark Mode" 
                rightElement={<ThemeToggle />}
                onClick={() => {}}
              />
            </div>
          </div>
          
          <div className="p-4 border-t border-border dark:border-border/30">
            <Button 
              variant="outline" 
              className="w-full text-red-500 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </>
    );
  };
  
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8 px-4">
      <div className="container max-w-lg mx-auto">
        {/* Header */}
        {profileCreated && !activeSection && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
        )}
        
        {/* Back button when in edit mode */}
        {profileCreated && activeSection && (
          <button
            onClick={() => setActiveSection(null)}
            className="mb-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Profile
          </button>
        )}
        
        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, rightElement, onClick }) => (
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
    {rightElement || <ChevronRight size={18} className="text-muted-foreground" />}
  </button>
);

const ArrowLeft: React.FC<{ size: number, className?: string }> = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

export default Profile;
