
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
  sdModelsPaths: {
    sd15: string;
    sdxl: string;
  };
  setSdModelsPaths: (paths: { sd15: string; sdxl: string }) => void;
}

const defaultSettings: ModelSettings = {
  llmModel: 'llama3',
  stableDiffusionModel: 'sd_15'
};

const defaultAvailableModels = {
  llm: ['llama3'],
  stableDiffusion: ['sd_15']
};

const defaultSdModelsPaths = {
  sd15: './models/sd15',
  sdxl: './models/sdxl'
};

const SettingsContext = createContext<SettingsContextType>({
  modelSettings: defaultSettings,
  updateModelSettings: () => {},
  availableModels: defaultAvailableModels,
  setAvailableModels: () => {},
  useMockedServices: false,
  setUseMockedServices: () => {},
  forceMockedImage: false,
  setForceMockedImage: () => {},
  sdModelsPaths: defaultSdModelsPaths,
  setSdModelsPaths: () => {}
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
  const [sdModelsPaths, setSdModelsPaths] = useState(() => {
    const saved = localStorage.getItem('sdModelsPaths');
    return saved ? JSON.parse(saved) : defaultSdModelsPaths;
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
  
  useEffect(() => {
    localStorage.setItem('sdModelsPaths', JSON.stringify(sdModelsPaths));
  }, [sdModelsPaths]);

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
      setForceMockedImage,
      sdModelsPaths,
      setSdModelsPaths
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
