
import React, { useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/Button';
import { Image, Upload } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: any) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(25);
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalSteps = 4;
  
  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const validateStep1 = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (age < 18) {
      toast.error('You must be at least 18 years old');
      return false;
    }
    return true;
  };
  
  const validateStep2 = () => {
    if (!location.trim()) {
      toast.error('Please enter your location');
      return false;
    }
    if (bio.length < 10) {
      toast.error('Please write a bio (at least 10 characters)');
      return false;
    }
    return true;
  };
  
  const validateStep3 = () => {
    if (!imageUrl) {
      toast.error('Please upload a profile photo');
      return false;
    }
    return true;
  };
  
  const handleSubmit = () => {
    if (interests.length === 0) {
      toast.error('Please add at least one interest');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newProfile = {
        name,
        age,
        location,
        bio,
        imageUrl,
        interests,
        stats: {
          matches: 0,
          conversations: 0,
          likes: 0
        }
      };
      
      onComplete(newProfile);
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile');
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
  
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div 
          key={index}
          className={`h-2 rounded-full transition-all ${
            index + 1 === currentStep 
              ? 'w-8 bg-primary' 
              : index + 1 < currentStep 
                ? 'w-4 bg-primary/60' 
                : 'w-4 bg-muted'
          }`}
        />
      ))}
    </div>
  );
  
  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4">Basic Information</h2>
      
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
          placeholder="Your name"
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
  );
  
  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4">About You</h2>
      
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
          placeholder="City, Country"
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
          placeholder="Tell us about yourself..."
          required
        />
        <p className="text-xs text-muted-foreground mt-1">{bio.length}/300 characters</p>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4">Profile Photo</h2>
      
      <div className="flex justify-center">
        <div className="relative w-64 aspect-square overflow-hidden rounded-xl border border-border">
          {imageUrl ? (
            <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-secondary text-muted-foreground">
              <Image size={48} className="mb-2" />
              <p className="text-sm">Upload a photo</p>
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
            <label className="cursor-pointer bg-white/10 backdrop-blur-sm text-white px-3 py-2 rounded-lg">
              <Upload size={16} className="mr-2 inline-block" />
              Choose Photo
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
            </label>
          </div>
        </div>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        Upload a clear photo of yourself that shows your face.
      </p>
    </div>
  );
  
  const renderStep4 = () => (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-4">Your Interests</h2>
      
      <div>
        <label htmlFor="interests" className="block text-sm font-medium mb-1">
          Add your interests
        </label>
        <div className="flex items-center mb-2">
          <input
            id="interests"
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            className="flex-1 p-3 rounded-l-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="e.g., Hiking, Movies, Cooking"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddInterest();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddInterest}
            className="p-3 bg-primary text-primary-foreground rounded-r-lg"
          >
            Add
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[100px]">
          {interests.map((interest, index) => (
            <div key={index} className="flex items-center bg-secondary rounded-full px-3 py-1.5">
              <span className="text-sm">{interest}</span>
              <button
                type="button"
                onClick={() => handleRemoveInterest(index)}
                className="ml-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return null;
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-card border border-border rounded-2xl p-6 card-shadow">
      {renderStepIndicator()}
      {renderCurrentStep()}
      
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button variant="outline" onClick={handlePrevStep}>
            Back
          </Button>
        ) : (
          <div /> // Empty div for spacing
        )}
        
        {currentStep < totalSteps ? (
          <Button onClick={handleNextStep}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Complete Setup
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfileSetup;
