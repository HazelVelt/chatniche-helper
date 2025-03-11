
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
  setUseMockedServices: () => {}
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modelSettings, setModelSettings] = useState<ModelSettings>(() => {
    const savedSettings = localStorage.getItem('modelSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [availableModels, setAvailableModels] = useState(defaultAvailableModels);
  const [useMockedServices, setUseMockedServices] = useState(false);

  useEffect(() => {
    localStorage.setItem('modelSettings', JSON.stringify(modelSettings));
  }, [modelSettings]);

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
      setUseMockedServices
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
