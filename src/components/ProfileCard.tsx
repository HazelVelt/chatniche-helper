
import React, { useState, useRef } from 'react';
import { Heart, X, MessageSquare, Eye } from 'lucide-react';
import Button from './Button';
import { cn } from '@/lib/utils';
import ProfileViewModal from './ProfileViewModal';
import { useTheme } from '@/contexts/ThemeContext';

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age: number;
    location: string;
    bio: string;
    imageUrl: string;
    interests: string[];
  };
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onMessage: (id: string) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  onLike, 
  onPass,
  onMessage
}) => {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const { theme } = useTheme();
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setSwiping(true);
  };
  
  const handleMouseStart = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setSwiping(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseEnd);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping) return;
    const currentX = e.touches[0].clientX;
    setCurrentX(currentX - startX);
    
    const direction = currentX - startX > 0 ? 'right' : 'left';
    setSwipeDirection(direction);
    
    // Calculate rotation based on swipe distance
    if (cardRef.current) {
      const rotate = (currentX - startX) / 20;
      cardRef.current.style.transform = `translateX(${currentX - startX}px) rotate(${rotate}deg)`;
    }
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!swiping) return;
    const moveX = e.clientX;
    setCurrentX(moveX - startX);
    
    const direction = moveX - startX > 0 ? 'right' : 'left';
    setSwipeDirection(direction);
    
    // Calculate rotation based on swipe distance
    if (cardRef.current) {
      const rotate = (moveX - startX) / 20;
      cardRef.current.style.transform = `translateX(${moveX - startX}px) rotate(${rotate}deg)`;
    }
  };
  
  const handleTouchEnd = () => {
    if (!swiping) return;
    
    const threshold = 100; // Minimum distance to trigger swipe action
    
    if (Math.abs(currentX) > threshold) {
      if (currentX > 0) {
        if (cardRef.current) {
          cardRef.current.classList.add('card-swipe-right');
          setTimeout(() => onLike(profile.id), 300);
        }
      } else {
        if (cardRef.current) {
          cardRef.current.classList.add('card-swipe-left');
          setTimeout(() => onPass(profile.id), 300);
        }
      }
    } else {
      // Reset position if swipe wasn't far enough
      if (cardRef.current) {
        cardRef.current.style.transform = 'translateX(0) rotate(0)';
      }
    }
    
    setSwiping(false);
    setCurrentX(0);
    setSwipeDirection(null);
  };
  
  const handleMouseEnd = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseEnd);
    handleTouchEnd();
  };
  
  const handleLike = () => {
    if (cardRef.current) {
      cardRef.current.classList.add('card-swipe-right');
      setTimeout(() => onLike(profile.id), 300);
    }
  };
  
  const handlePass = () => {
    if (cardRef.current) {
      cardRef.current.classList.add('card-swipe-left');
      setTimeout(() => onPass(profile.id), 300);
    }
  };
  
  return (
    <>
      <div className="flex flex-col items-center space-y-6">
        <div 
          ref={cardRef}
          className={cn(
            "relative w-full max-w-sm aspect-[3/4] overflow-hidden rounded-2xl transition-transform duration-300 shadow-lg",
            theme === 'dark' ? 'bg-gray-800 card-shadow-dark' : 'bg-white card-shadow'
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseStart}
          onClick={() => setDetailsExpanded(!detailsExpanded)}
        >
          {/* Swipe indicators */}
          {swipeDirection === 'right' && (
            <div className="absolute top-6 left-6 z-20 bg-green-500 text-white px-4 py-2 rounded-full font-semibold rotate-[-20deg] scale-110 animate-pulse-subtle">
              Like
            </div>
          )}
          {swipeDirection === 'left' && (
            <div className="absolute top-6 right-6 z-20 bg-red-500 text-white px-4 py-2 rounded-full font-semibold rotate-[20deg] scale-110 animate-pulse-subtle">
              Pass
            </div>
          )}
          
          {/* Profile image */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={profile.imageUrl} 
              alt={profile.name} 
              className="w-full h-full object-cover"
              draggable="false"
            />
          </div>
          
          {/* Gradient overlay */}
          <div className={cn(
            "absolute inset-0",
            theme === 'dark' 
              ? "bg-gradient-to-t from-black/90 via-black/30 to-transparent" 
              : "bg-gradient-to-t from-black/80 via-black/20 to-transparent"
          )}></div>
          
          {/* Profile info */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-5 text-white transition-all duration-300",
            detailsExpanded 
              ? theme === 'dark' ? "bg-black/70 h-3/5" : "bg-black/60 h-3/5" 
              : "bg-transparent"
          )}>
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="text-2xl font-bold">{profile.name}, {profile.age}</h3>
                <p className="text-white/80 text-sm">{profile.location}</p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullProfile(true);
                  }}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-colors"
                  aria-label="View full profile"
                >
                  <Eye size={20} className="text-white" />
                </button>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onMessage(profile.id);
                  }}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                  <MessageSquare size={20} className="text-white" />
                </button>
              </div>
            </div>
            
            {detailsExpanded && (
              <div className="animate-slide-up mt-3">
                <p className="text-white/90 mb-4 line-clamp-3">{profile.bio}</p>
                
                <div className="mb-4">
                  <h4 className="text-sm text-white/70 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <span 
                        key={index}
                        className="bg-white/20 backdrop-blur-sm text-white text-xs py-1 px-2 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons - below the card */}
        <div className="flex justify-center space-x-6 mt-4">
          <Button
            variant="outline"
            className={cn(
              "rounded-full p-3",
              theme === 'dark' 
                ? "bg-gray-800/90 text-red-400 hover:bg-gray-700" 
                : "bg-white/90 text-red-500 hover:bg-white"
            )}
            onClick={handlePass}
          >
            <X size={24} strokeWidth={2.5} />
          </Button>
          
          <Button
            variant="outline"
            className={cn(
              "rounded-full p-3",
              theme === 'dark' 
                ? "bg-gray-800/90 text-green-400 hover:bg-gray-700" 
                : "bg-white/90 text-green-500 hover:bg-white"
            )}
            onClick={handleLike}
          >
            <Heart size={24} strokeWidth={2.5} />
          </Button>
        </div>
      </div>

      {/* Full Profile Modal */}
      <ProfileViewModal 
        profile={profile}
        isOpen={showFullProfile}
        onClose={() => setShowFullProfile(false)}
        onLike={onLike}
        onMessage={onMessage}
      />
    </>
  );
};

export default ProfileCard;
