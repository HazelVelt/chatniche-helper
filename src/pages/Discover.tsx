import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '@/components/ProfileCard';
import { Button } from '@/components/ui/button';
import { generateMultipleProfiles } from '@/utils/aiUtils';
import { Loader2, RefreshCw, Heart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  imageUrl: string;
  interests: string[];
}

const Discover = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMatchAnimation, setShowMatchAnimation] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  // Check if user profile exists
  useEffect(() => {
    const userProfile = localStorage.getItem('userProfile');
    if (!userProfile) {
      toast.error('Please create your profile first');
      navigate('/profile');
    }
  }, [navigate]);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const newProfiles = await generateMultipleProfiles(5);
      setProfiles(newProfiles);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading profiles', error);
      toast.error('Failed to load profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshProfiles = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const newProfiles = await generateMultipleProfiles(5);
      setProfiles(newProfiles);
      setCurrentIndex(0);
      toast.success('Found new matches for you!');
    } catch (error) {
      console.error('Error refreshing profiles', error);
      toast.error('Failed to refresh profiles. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleLike = (id: string) => {
    const currentProfile = profiles[currentIndex];
    
    // Add to matches in localStorage
    const matches = JSON.parse(localStorage.getItem('matches') || '[]');
    const isAlreadyMatched = matches.some((match: any) => match.id === currentProfile.id);
    
    if (!isAlreadyMatched) {
      const newMatch = {
        id: currentProfile.id,
        name: currentProfile.name,
        age: currentProfile.age,
        image: currentProfile.imageUrl,
        bio: currentProfile.bio
      };
      matches.push(newMatch);
      localStorage.setItem('matches', JSON.stringify(matches));
    }
    
    // Show match animation
    setMatchedProfile(currentProfile);
    setShowMatchAnimation(true);
    
    // Update user profile stats
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    userProfile.stats = userProfile.stats || { matches: 0, conversations: 0, likes: 0 };
    userProfile.stats.matches = (userProfile.stats.matches || 0) + 1;
    userProfile.stats.likes = (userProfile.stats.likes || 0) + 1;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Hide animation after 2 seconds
    setTimeout(() => {
      setShowMatchAnimation(false);
      setMatchedProfile(null);
      
      // Move to next profile
      moveToNextProfile();
    }, 2000);
  };

  const handlePass = (id: string) => {
    // Move to next profile
    moveToNextProfile();
  };
  
  const moveToNextProfile = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more profiles, load new ones
      loadProfiles();
    }
  };

  const handleMessage = (id: string) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-full blur-3xl opacity-60 z-0"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/10 rounded-full blur-3xl opacity-40 z-0"></div>
      
      <div className="container max-w-lg mx-auto flex flex-col h-full relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Discover</h1>
            <p className="text-muted-foreground text-sm">Find your AI match</p>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshProfiles}
            disabled={refreshing}
            className="relative overflow-hidden group"
          >
            {refreshing ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <RefreshCw size={16} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
            )}
            Refresh
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </Button>
        </div>
        
        <div className="flex-1 flex items-center justify-center w-full relative">
          {loading ? (
            <div className="text-center p-12 rounded-2xl bg-secondary/30 backdrop-blur-sm dark:bg-secondary/10 border border-border/30 shadow-lg">
              <Sparkles className="h-12 w-12 mx-auto text-primary opacity-80 animate-pulse" />
              <p className="mt-6 text-foreground font-medium">Finding your perfect matches...</p>
              <p className="mt-2 text-muted-foreground text-sm">Our AI is working its magic</p>
              <div className="mt-6 flex justify-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center p-12 rounded-2xl bg-secondary/30 backdrop-blur-sm dark:bg-secondary/10 border border-border/30 shadow-lg">
              <p className="text-lg mb-4">No profiles available at the moment.</p>
              <Button 
                onClick={refreshProfiles} 
                disabled={refreshing} 
                className="relative overflow-hidden group"
              >
                Try Again
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Button>
            </div>
          ) : (
            <div className="w-full">
              <ProfileCard
                profile={profiles[currentIndex]}
                onLike={handleLike}
                onPass={handlePass}
                onMessage={handleMessage}
              />
            </div>
          )}
          
          {/* Match Animation Overlay */}
          {showMatchAnimation && matchedProfile && (
            <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center animate-fade-in">
              <div className="animate-scale">
                <Heart size={80} className="text-primary animate-pulse-subtle mb-6" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 animate-slide-down">It's a Match!</h2>
              <div className="flex items-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary">
                  <img 
                    src={matchedProfile.imageUrl} 
                    alt={matchedProfile.name} 
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-primary">
                  {/* User profile image */}
                  <img 
                    src={JSON.parse(localStorage.getItem('userProfile') || '{}').imageUrl || 'https://source.unsplash.com/random/100x100?portrait'} 
                    alt="You" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <p className="text-white/80 text-lg animate-fade-in" style={{ animationDelay: '400ms' }}>
                You and {matchedProfile.name} liked each other!
              </p>
              <Button 
                className="mt-8 animate-fade-in" 
                style={{ animationDelay: '600ms' }}
                onClick={() => {
                  setShowMatchAnimation(false);
                  navigate(`/chat/${matchedProfile.id}`);
                }}
              >
                Start Chatting
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
