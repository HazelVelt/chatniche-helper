
import React, { useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/Button';
import { Trash2, Upload, Image } from 'lucide-react';

interface ProfileFormProps {
  userProfile: {
    name: string;
    age: number;
    location: string;
    bio: string;
    imageUrl: string;
    interests: string[];
  };
  onSave: (profile: any) => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userProfile, onSave, onCancel }) => {
  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState(userProfile.age);
  const [location, setLocation] = useState(userProfile.location);
  const [bio, setBio] = useState(userProfile.bio);
  const [imageUrl, setImageUrl] = useState(userProfile.imageUrl);
  const [interests, setInterests] = useState<string[]>(userProfile.interests);
  const [newInterest, setNewInterest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (age < 18 || age > 100) {
      toast.error('Age must be between 18 and 100');
      return;
    }
    
    if (!location.trim()) {
      toast.error('Location is required');
      return;
    }
    
    if (bio.length < 10) {
      toast.error('Bio must be at least 10 characters');
      return;
    }
    
    if (!imageUrl) {
      toast.error('Profile image is required');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSave({
        name,
        age,
        location,
        bio,
        imageUrl,
        interests,
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    if (interests.includes(newInterest.trim())) {
      toast.error('Interest already added');
      return;
    }
    
    if (interests.length >= 10) {
      toast.error('You can add up to 10 interests');
      return;
    }
    
    setInterests([...interests, newInterest.trim()]);
    setNewInterest('');
  };
  
  const handleRemoveInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Image upload */}
        <div className="w-full sm:w-1/3">
          <div className="relative w-full aspect-square overflow-hidden rounded-xl border border-border mb-4">
            {imageUrl ? (
              <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                <Image size={48} />
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition-opacity">
              <label className="cursor-pointer bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
                <Upload size={16} className="mr-2 inline-block" />
                Change Photo
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
              </label>
            </div>
          </div>
        </div>
        
        {/* Profile details */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium mb-1">
                Age
              </label>
              <input
                id="age"
                type="number"
                min="18"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/300 characters</p>
          </div>
        </div>
      </div>
      
      {/* Interests */}
      <div>
        <label htmlFor="interests" className="block text-sm font-medium mb-1">
          Interests
        </label>
        <div className="flex items-center mb-2">
          <input
            id="interests"
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            className="flex-1 p-3 rounded-l-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Add an interest (e.g., Hiking, Movies, etc.)"
          />
          <button
            type="button"
            onClick={handleAddInterest}
            className="p-3 bg-primary text-primary-foreground rounded-r-lg"
          >
            Add
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, index) => (
            <div key={index} className="flex items-center bg-secondary rounded-full px-3 py-1.5">
              <span className="text-sm">{interest}</span>
              <button
                type="button"
                onClick={() => handleRemoveInterest(index)}
                className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
        >
          Save Profile
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;
