
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ModelSettings } from '@/types/chat';

interface SettingsContextType {
  modelSettings: ModelSettings;
  updateModelSettings: (settings: Partial<ModelSettings>) => void;
  availableModels: {
    llm: string[];
    stableDiffusion: string[];
  };
  setAvailableModels: (models: { llm: string[], stableDiffusion: string[] }) => void;
  useMockedServices: boolean;
  setUseMockedServices: (value: boolean) => void;
  forceMockedImage: boolean;
  setForceMockedImage: (value: boolean) => void;
}

const defaultSettings: ModelSettings = {
  llmModel: 'llama3',
  stableDiffusionModel: 'sd'
};

const defaultAvailableModels = {
  llm: ['llama3'],
  stableDiffusion: ['sd']
};

const SettingsContext = createContext<SettingsContextType>({
  modelSettings: defaultSettings,
  updateModelSettings: () => {},
  availableModels: defaultAvailableModels,
  setAvailableModels: () => {},
  useMockedServices: false,
  setUseMockedServices: () => {},
  forceMockedImage: false,
  setForceMockedImage: () => {}
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modelSettings, setModelSettings] = useState<ModelSettings>(() => {
    const savedSettings = localStorage.getItem('modelSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [availableModels, setAvailableModels] = useState(defaultAvailableModels);
  const [useMockedServices, setUseMockedServices] = useState(() => {
    const saved = localStorage.getItem('useMockedServices');
    return saved ? JSON.parse(saved) : false;
  });
  const [forceMockedImage, setForceMockedImage] = useState(() => {
    const saved = localStorage.getItem('forceMockedImage');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('modelSettings', JSON.stringify(modelSettings));
  }, [modelSettings]);
  
  useEffect(() => {
    localStorage.setItem('useMockedServices', JSON.stringify(useMockedServices));
  }, [useMockedServices]);
  
  useEffect(() => {
    localStorage.setItem('forceMockedImage', JSON.stringify(forceMockedImage));
  }, [forceMockedImage]);

  const updateModelSettings = (settings: Partial<ModelSettings>) => {
    setModelSettings(prev => ({ ...prev, ...settings }));
  };

  return (
    <SettingsContext.Provider value={{ 
      modelSettings, 
      updateModelSettings, 
      availableModels, 
      setAvailableModels,
      useMockedServices,
      setUseMockedServices,
      forceMockedImage,
      setForceMockedImage
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

