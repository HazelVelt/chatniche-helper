
import React, { useState, useEffect } from 'react';
import { checkOllamaStatus, checkStableDiffusionStatus } from '@/utils/ollamaService';
import { useSettings } from '@/contexts/SettingsContext';
import { AlertTriangle, CheckCircle, XCircle, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ModelStatus: React.FC = () => {
  const { modelSettings, availableModels, setAvailableModels } = useSettings();
  const navigate = useNavigate();
  const [status, setStatus] = useState<{
    isRunning: boolean;
    llmAvailable: boolean;
    llmModel: string;
    stableDiffusionAvailable: boolean;
    availableModels: {
      llm: string[];
      stableDiffusion: string[];
    };
    error?: string;
  }>({
    isRunning: false,
    llmAvailable: false,
    llmModel: '',
    stableDiffusionAvailable: false,
    availableModels: {
      llm: [],
      stableDiffusion: []
    }
  });
  
  const [isChecking, setIsChecking] = useState(false);
  
  const checkStatus = async () => {
    setIsChecking(true);
    try {
      // Check Ollama status
      const ollamaResult = await checkOllamaStatus();
      
      // Check Stable Diffusion WebUI status separately
      const sdResult = await checkStableDiffusionStatus();
      
      const combinedStatus = {
        ...ollamaResult,
        stableDiffusionAvailable: sdResult.isRunning,
        availableModels: {
          llm: ollamaResult.availableModels.llm,
          stableDiffusion: sdResult.availableModels
        }
      };
      
      setStatus(combinedStatus);
      setAvailableModels(combinedStatus.availableModels);
      
      if (!ollamaResult.isRunning) {
        toast.error('Ollama is not running. Please start Ollama service.');
      } else if (!sdResult.isRunning) {
        toast.warning('Stable Diffusion WebUI is not running. Image generation will use fallbacks.');
      } else if (combinedStatus.error) {
        toast.warning(combinedStatus.error);
      } else if (ollamaResult.llmAvailable && sdResult.isRunning) {
        toast.success('All AI services are available and ready to use.');
      }
    } catch (error) {
      console.error('Failed to check services status:', error);
      toast.error('Failed to check AI services status.');
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    checkStatus();
    // Check status every 5 minutes
    const interval = setInterval(checkStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const goToSettings = () => {
    navigate('/profile');
    // Wait for navigation and then try to find and click the AI Models settings option
    setTimeout(() => {
      const settingsItem = document.querySelector('[data-settings="ai-models"]') as HTMLElement;
      if (settingsItem) {
        settingsItem.click();
      }
    }, 300);
  };
  
  return (
    <div className="flex items-center px-4 py-2 border-t border-border">
      <div className="flex flex-1 gap-4 items-center">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium">Ollama:</span>
          {status.isRunning ? (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle size={14} />
              Running
            </span>
          ) : (
            <span className="flex items-center gap-1 text-destructive">
              <XCircle size={14} />
              Offline
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium">LLM:</span>
          {status.llmAvailable ? (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle size={14} />
              <span className="hidden sm:inline">{modelSettings.llmModel}</span>
              <span className="sm:hidden">Ready</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle size={14} />
              Missing
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium">SD WebUI:</span>
          {status.stableDiffusionAvailable ? (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle size={14} />
              <span className="hidden sm:inline">{modelSettings.stableDiffusionModel}</span>
              <span className="sm:hidden">Ready</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle size={14} />
              Offline
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={checkStatus}
          disabled={isChecking}
          className="text-xs text-primary hover:underline"
        >
          {isChecking ? 'Checking...' : 'Check again'}
        </button>
        
        <button 
          onClick={goToSettings}
          className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings2 size={14} />
          <span className="hidden sm:inline">Change models</span>
        </button>
      </div>
    </div>
  );
};

export default ModelStatus;
