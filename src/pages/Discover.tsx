
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '@/components/ProfileCard';
import Button from '@/components/Button';
import { generateMultipleProfiles } from '@/utils/aiUtils';
import { Loader2, RefreshCw, Heart } from 'lucide-react';
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
      if (currentIndex < profiles.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // No more profiles, refresh
        refreshProfiles();
      }
    }, 2000);
  };

  const handlePass = (id: string) => {
    console.log('Passed profile:', id);
    // Move to next profile
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more profiles, refresh
      refreshProfiles();
    }
  };

  const handleMessage = (id: string) => {
    console.log('Message profile:', id);
    navigate(`/chat/${id}`);
  };

  return (
    <div className="min-h-screen pt-16 pb-20 md:pb-8 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10">
      <div className="container max-w-lg mx-auto flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Discover</h1>
          <Button 
            variant="outline" 
            onClick={refreshProfiles}
            isLoading={refreshing}
            icon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>
        
        <div className="flex-1 flex items-center justify-center w-full relative">
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Generating profiles with AI...</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center">
              <p className="text-lg mb-4">No profiles available at the moment.</p>
              <Button onClick={refreshProfiles} isLoading={refreshing}>
                Try Again
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discover;
