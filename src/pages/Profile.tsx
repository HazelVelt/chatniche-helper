
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, ChevronRight, Heart, MessageSquare, Edit, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import ProfileForm from '@/components/ProfileForm';
import ProfileSetup from '@/components/ProfileSetup';
import DatingPreferences from '@/components/DatingPreferences';
import { cn } from '@/lib/utils';

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
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create Your Profile</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Complete your profile to start matching with AI-generated profiles tailored to your preferences.</p>
          </div>
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
        <div className="bg-card border border-border rounded-2xl overflow-hidden card-shadow mb-6 animate-fade-in dark:border-border/30 relative">
          <div className="relative">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10">
              <svg className="w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <pattern id="pattern-circles" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                  <circle id="pattern-circle" cx="10" cy="10" r="2" fill="currentColor" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
              </svg>
            </div>
            
            <img 
              src={userProfile.imageUrl} 
              alt={userProfile.name} 
              className="w-full h-52 object-cover"
            />
            
            <button 
              className="absolute top-3 right-3 bg-white/90 dark:bg-black/60 text-foreground backdrop-blur-sm p-2 rounded-full hover:bg-white dark:hover:bg-black/80 transition-colors"
              onClick={() => setActiveSection('profile')}
            >
              <Edit size={18} />
            </button>
            
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/60 to-transparent text-white">
              <h2 className="text-xl font-bold">{userProfile.name}, {userProfile.age}</h2>
              <p className="text-sm text-white/90 flex items-center">
                <Globe size={14} className="mr-1" />
                {userProfile.location}
              </p>
            </div>
          </div>
          
          <div className="p-5">
            <div className="mb-5">
              <h3 className="text-sm text-muted-foreground mb-1 uppercase tracking-wide font-medium">About me</h3>
              <p className="text-foreground">{userProfile.bio}</p>
            </div>
            
            <div className="mb-5">
              <h3 className="text-sm text-muted-foreground mb-2 uppercase tracking-wide font-medium">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-secondary/70 dark:bg-secondary/30 text-foreground text-sm py-1 px-3 rounded-full border border-border/20"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-2">
              <div className={cn(
                "rounded-xl p-3 text-center transition-all duration-300",
                "bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20",
                "border border-primary/10 hover:border-primary/20"
              )}>
                <div className="text-xl font-semibold text-primary">{userProfile.stats.matches}</div>
                <div className="text-xs text-muted-foreground">Matches</div>
              </div>
              <div className={cn(
                "rounded-xl p-3 text-center transition-all duration-300",
                "bg-gradient-to-br from-blue-500/5 to-blue-500/10 dark:from-blue-500/10 dark:to-blue-500/20",
                "border border-blue-500/10 hover:border-blue-500/20"
              )}>
                <div className="text-xl font-semibold text-blue-500">{userProfile.stats.conversations}</div>
                <div className="text-xs text-muted-foreground">Chats</div>
              </div>
              <div className={cn(
                "rounded-xl p-3 text-center transition-all duration-300",
                "bg-gradient-to-br from-purple-500/5 to-purple-500/10 dark:from-purple-500/10 dark:to-purple-500/20",
                "border border-purple-500/10 hover:border-purple-500/20"
              )}>
                <div className="text-xl font-semibold text-purple-500">{userProfile.stats.likes}</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Settings Menu */}
        <div className="bg-card border border-border rounded-2xl card-shadow animate-fade-in dark:border-border/30" style={{ animationDelay: '100ms' }}>
          <div className="p-5">
            <h3 className="font-medium mb-4 flex items-center">
              <Settings size={16} className="mr-2 text-primary" />
              Settings
            </h3>
            
            <div className="space-y-2">
              <MenuItem 
                icon={<Heart size={18} className="text-primary" />} 
                title="Dating Preferences" 
                subtitle="Age range, distance, interests"
                onClick={() => setActiveSection('preferences')}
              />
              <MenuItem 
                icon={<MessageSquare size={18} className="text-blue-500" />} 
                title="Notifications" 
                subtitle="Messages, matches, app updates"
                onClick={() => toast.info('Notification settings coming soon!')}
              />
              <MenuItem 
                icon={<Settings size={18} className="text-purple-500" />} 
                title="Privacy & Security" 
                subtitle="Data, permissions, account"
                onClick={() => toast.info('Privacy settings coming soon!')}
              />
              <div className="flex items-center justify-between p-3 bg-secondary/40 dark:bg-secondary/20 rounded-xl">
                <div className="flex items-center">
                  <span className="text-muted-foreground mr-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500">
                      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="currentColor"/>
                      <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M2 12H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M6.34 17.66L4.93 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M19.07 4.93L17.66 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium">Dark Mode</div>
                    <div className="text-xs text-muted-foreground">Toggle light/dark theme</div>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
          
          <div className="p-5 border-t border-border dark:border-border/30">
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive/90 flex items-center justify-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </div>
      </>
    );
  };
  
  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8 px-4">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      
      <div className="container max-w-lg mx-auto relative z-10">
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
    className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 dark:hover:bg-secondary/20 rounded-xl transition-colors text-left"
    onClick={onClick}
  >
    <div className="flex items-center">
      <span className="mr-3">{icon}</span>
      <div>
        <div className="font-medium">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
    </div>
    {rightElement || <ChevronRight size={16} className="text-muted-foreground" />}
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
