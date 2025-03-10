
import React, { useState } from 'react';
import { toast } from 'sonner';
import Button from '@/components/Button';

interface DatingPreferencesProps {
  preferences: {
    interestedIn: string;
    ageRange: [number, number];
    distance: number;
    showMe: boolean;
  };
  onSave: (preferences: any) => void;
  onCancel: () => void;
}

const DatingPreferences: React.FC<DatingPreferencesProps> = ({
  preferences,
  onSave,
  onCancel
}) => {
  const [interestedIn, setInterestedIn] = useState(preferences.interestedIn);
  const [minAge, setMinAge] = useState(preferences.ageRange[0]);
  const [maxAge, setMaxAge] = useState(preferences.ageRange[1]);
  const [distance, setDistance] = useState(preferences.distance);
  const [showMe, setShowMe] = useState(preferences.showMe);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (minAge < 18) {
      toast.error('Minimum age must be at least 18');
      return;
    }
    
    if (maxAge > 100) {
      toast.error('Maximum age must be at most 100');
      return;
    }
    
    if (minAge > maxAge) {
      toast.error('Minimum age cannot be greater than maximum age');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      onSave({
        interestedIn,
        ageRange: [minAge, maxAge] as [number, number],
        distance,
        showMe,
      });
      
      toast.success('Dating preferences updated successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">
          I'm interested in
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['Women', 'Men', 'Everyone'].map((option) => (
            <button
              key={option}
              type="button"
              className={`p-3 rounded-lg border ${
                interestedIn === option
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background'
              }`}
              onClick={() => setInterestedIn(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-3">
          Age Range
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="minAge" className="block text-xs text-muted-foreground mb-1">
              Minimum Age
            </label>
            <input
              id="minAge"
              type="number"
              min="18"
              max="100"
              value={minAge}
              onChange={(e) => setMinAge(Number(e.target.value))}
              className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="maxAge" className="block text-xs text-muted-foreground mb-1">
              Maximum Age
            </label>
            <input
              id="maxAge"
              type="number"
              min="18"
              max="100"
              value={maxAge}
              onChange={(e) => setMaxAge(Number(e.target.value))}
              className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="distance" className="flex justify-between text-sm font-medium mb-1">
          <span>Maximum Distance</span>
          <span>{distance} miles</span>
        </label>
        <input
          id="distance"
          type="range"
          min="1"
          max="100"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1 mile</span>
          <span>100 miles</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <label htmlFor="showMe" className="text-sm font-medium">
          Show me in discover
        </label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            id="showMe"
            type="checkbox"
            checked={showMe}
            onChange={(e) => setShowMe(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>
      
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
          Save Preferences
        </Button>
      </div>
    </form>
  );
};

export default DatingPreferences;
