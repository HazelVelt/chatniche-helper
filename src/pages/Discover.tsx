
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '@/components/ProfileCard';
import Button from '@/components/Button';
import { generateMultipleProfiles } from '@/utils/aiUtils';
import { Loader2, RefreshCw } from 'lucide-react';
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
  const navigate = useNavigate();

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
    console.log('Liked profile:', id);
    toast('Liked!', {
      icon: '❤️',
    });
    // Move to next profile
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more profiles, refresh
      refreshProfiles();
    }
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
    <div className="min-h-screen pt-16 pb-20 md:pb-8 px-4 flex flex-col items-center justify-center bg-gradient-to-b from-white to-secondary/20">
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
        
        <div className="flex-1 flex items-center justify-center w-full">
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
        </div>
      </div>
    </div>
  );
};

export default Discover;
