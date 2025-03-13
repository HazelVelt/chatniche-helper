
import React, { useState, useEffect } from 'react';
import { checkOllamaStatus } from '@/utils/ollamaService';
import { checkSdkitStatus } from '@/utils/sdkitService';
import { useSettings } from '@/contexts/SettingsContext';
import { AlertTriangle, CheckCircle, XCircle, Settings2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ModelStatus: React.FC = () => {
  const { modelSettings, availableModels, setAvailableModels, useMockedServices, setUseMockedServices } = useSettings();
  const navigate = useNavigate();
  const [status, setStatus] = useState<{
    isRunning: boolean;
    llmAvailable: boolean;
    llmModel: string;
    sdkitAvailable: boolean;
    availableModels: {
      llm: string[];
      stableDiffusion: string[];
    };
    error?: string;
  }>({
    isRunning: false,
    llmAvailable: false,
    llmModel: '',
    sdkitAvailable: false,
    availableModels: {
      llm: [],
      stableDiffusion: []
    }
  });
  
  const [isChecking, setIsChecking] = useState(false);
  
  const checkStatus = async () => {
    if (useMockedServices) {
      // If we're in mocked mode, just simulate everything is working
      const demoModels = {
        llm: ['llama3', 'mistral', 'phi'],
        stableDiffusion: ['sd_15', 'sdxl_base', 'realisticVision']
      };
      
      setStatus({
        isRunning: true,
        llmAvailable: true,
        llmModel: 'llama3',
        sdkitAvailable: true,
        availableModels: demoModels
      });
      
      setAvailableModels(demoModels);
      return;
    }
    
    setIsChecking(true);
    try {
      // Check SDKit status first
      console.log("Checking SDKit status first...");
      const sdResult = await checkSdkitStatus();
      console.log("SDKit status check result:", sdResult);
      
      // Check Ollama status
      const ollamaResult = await checkOllamaStatus();
      console.log("Ollama status check result:", ollamaResult);
      
      const combinedStatus = {
        ...ollamaResult,
        sdkitAvailable: sdResult.isRunning,
        availableModels: {
          llm: ollamaResult.availableModels.llm,
          stableDiffusion: sdResult.availableModels
        }
      };
      
      setStatus(combinedStatus);
      setAvailableModels(combinedStatus.availableModels);
      
      // Only show warnings/errors if we're not in demo mode
      if (!useMockedServices) {
        if (!ollamaResult.isRunning) {
          toast.error('Ollama is not running. Please start Ollama service or use demo mode.');
        } else if (!sdResult.isRunning) {
          toast.warning('SDKit is not running. Image generation will use fallbacks.');
        } else if (combinedStatus.error) {
          toast.warning(combinedStatus.error);
        } else if (ollamaResult.llmAvailable && sdResult.isRunning) {
          toast.success('All AI services are available and ready to use.');
        }
      }
    } catch (error) {
      console.error('Failed to check services status:', error);
      toast.error('Failed to check AI services status.');
    } finally {
      setIsChecking(false);
    }
  };
  
  // Toggle between real services and demo mode
  const toggleDemoMode = () => {
    const newModeValue = !useMockedServices;
    setUseMockedServices(newModeValue);
    
    if (newModeValue) {
      // If enabling demo mode
      const demoModels = {
        llm: ['llama3', 'mistral', 'phi'],
        stableDiffusion: ['sd_15', 'sdxl_base', 'realisticVision']
      };
      
      setStatus({
        isRunning: true,
        llmAvailable: true,
        llmModel: 'llama3',
        sdkitAvailable: true,
        availableModels: demoModels
      });
      
      setAvailableModels(demoModels);
      toast.success('Using simulated AI services for demo purposes.');
    } else {
      // If disabling demo mode, check for real services
      checkStatus();
      toast.info('Checking for real AI services...');
    }
  };
  
  useEffect(() => {
    checkStatus();
    // Check status frequently to catch if services come online
    const interval = setInterval(checkStatus, 30 * 1000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [useMockedServices]);
  
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
    <div className="flex items-center px-4 py-2 border-t border-border dark:bg-gray-900">
      <div className="flex flex-1 gap-4 items-center">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium">Ollama:</span>
          {useMockedServices ? (
            <span className="flex items-center gap-1 text-purple-500">
              <CheckCircle size={14} />
              Demo Mode
            </span>
          ) : status.isRunning ? (
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
          {useMockedServices ? (
            <span className="flex items-center gap-1 text-purple-500">
              <CheckCircle size={14} />
              <span className="hidden sm:inline">Simulated</span>
              <span className="sm:hidden">Ready</span>
            </span>
          ) : status.llmAvailable ? (
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
          <span className="font-medium">SDKit:</span>
          {useMockedServices ? (
            <span className="flex items-center gap-1 text-purple-500">
              <CheckCircle size={14} />
              <span className="hidden sm:inline">Simulated</span>
              <span className="sm:hidden">Ready</span>
            </span>
          ) : status.sdkitAvailable ? (
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
        {(!status.isRunning || !status.sdkitAvailable) && !useMockedServices ? (
          <button 
            onClick={toggleDemoMode}
            className="text-xs text-amber-500 hover:text-amber-600 hover:underline"
          >
            Use demo mode
          </button>
        ) : useMockedServices ? (
          <button 
            onClick={toggleDemoMode}
            className="text-xs text-purple-500 hover:text-purple-600 hover:underline"
          >
            Exit demo mode
          </button>
        ) : (
          <button 
            onClick={checkStatus}
            disabled={isChecking}
            className="text-xs flex items-center gap-1 text-primary hover:underline"
          >
            {isChecking ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                Check again
              </>
            )}
          </button>
        )}
        
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
