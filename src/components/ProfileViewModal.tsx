
import React from 'react';
import { X, Heart, MessageSquare, MapPin, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProfileViewModalProps {
  profile: {
    id: string;
    name: string;
    age: number;
    location: string;
    bio: string;
    imageUrl: string;
    interests: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onLike: (id: string) => void;
  onMessage: (id: string) => void;
}

const ProfileViewModal: React.FC<ProfileViewModalProps> = ({
  profile,
  isOpen,
  onClose,
  onLike,
  onMessage
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with handcrafted blur effect */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal container with paper texture */}
      <div 
        className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl bg-paper border-4 border-amber-800/40 shadow-[0_8px_40px_rgba(0,0,0,0.3)] animate-scale-in"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23d2c6b5' fill-opacity='0.1'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      >
        {/* Close button with stylized design */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-10 h-7 w-7 rounded-full bg-white/90 p-1 text-muted-foreground shadow-sm transition-opacity hover:text-foreground hover:bg-red-100 border border-neutral-200"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        
        {/* Profile header with image and gradient overlay */}
        <div className="relative h-64 w-full overflow-hidden">
          <img 
            src={profile.imageUrl} 
            alt={profile.name} 
            className="h-full w-full object-cover animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/30 to-transparent"></div>
          
          {/* Decorative elements */}
          <div className="absolute top-4 left-4">
            <Sparkles size={20} className="text-amber-300 animate-pulse-subtle" />
          </div>
          
          {/* Polaroid-style frame effect */}
          <div className="absolute inset-0 border-8 border-white/90 rounded-t-lg shadow-inner"></div>
        </div>
        
        {/* Profile content */}
        <div className="custom-scrollbar overflow-y-auto p-6 max-h-[calc(85vh-16rem)]">
          <div className="flex items-start justify-between border-b border-amber-800/20 pb-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold handwritten">{profile.name}, {profile.age}</h2>
              <div className="flex items-center mt-1 text-muted-foreground">
                <MapPin size={15} className="mr-1" />
                <span className="text-sm">{profile.location}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center px-3 py-2 bg-amber-100/50 rounded-lg border border-amber-200 shadow-sm">
              <Calendar size={18} className="text-amber-700 mb-1" />
              <span className="text-xs font-medium text-amber-900">Active today</span>
            </div>
          </div>
          
          {/* Bio with stylized quote marks */}
          <div className="mb-6 relative">
            <div className="absolute -top-3 -left-1 text-3xl text-amber-300 opacity-50 font-serif">"</div>
            <p className="pl-5 pr-2 italic text-neutral-700 leading-relaxed handwritten-normal">{profile.bio}</p>
            <div className="absolute -bottom-3 -right-1 text-3xl text-amber-300 opacity-50 font-serif">"</div>
          </div>
          
          {/* Interests */}
          <div className="mb-6">
            <h3 className="text-sm uppercase tracking-wider mb-3 font-semibold text-amber-800/70 handwritten">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 text-sm bg-amber-100 text-amber-900 rounded-full border border-amber-200 shadow-sm hover:bg-amber-200 transition-colors handwritten-small"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Actions footer */}
        <div className="p-4 border-t border-amber-800/20 bg-amber-50/80 flex justify-between items-center gap-3">
          <Button
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 flex items-center justify-center"
            variant="outline"
            onClick={onClose}
          >
            <X size={18} className="mr-2" />
            Pass
          </Button>
          
          <Button
            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-none flex items-center justify-center"
            onClick={() => onLike(profile.id)}
          >
            <Heart size={18} className="mr-2" />
            Like
          </Button>
          
          <Button
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-none flex items-center justify-center"
            onClick={() => onMessage(profile.id)}
          >
            <MessageSquare size={18} className="mr-2" />
            Message
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewModal;
