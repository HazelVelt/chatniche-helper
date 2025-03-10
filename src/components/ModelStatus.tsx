
import React, { useState, useEffect } from 'react';
import { checkOllamaStatus } from '@/utils/ollamaService';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ModelStatus: React.FC = () => {
  const [status, setStatus] = useState<{
    isRunning: boolean;
    llmAvailable: boolean;
    llmModel: string;
    stableDiffusionAvailable: boolean;
    error?: string;
  }>({
    isRunning: false,
    llmAvailable: false,
    llmModel: '',
    stableDiffusionAvailable: false
  });
  
  const [isChecking, setIsChecking] = useState(false);
  
  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const result = await checkOllamaStatus();
      setStatus(result);
      
      if (!result.isRunning) {
        toast.error('Ollama is not running. Please start Ollama service.');
      } else if (result.error) {
        toast.warning(result.error);
      } else if (result.llmAvailable && result.stableDiffusionAvailable) {
        toast.success('All AI models are available and ready to use.');
      }
    } catch (error) {
      console.error('Failed to check Ollama status:', error);
      toast.error('Failed to check AI models status.');
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
              Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle size={14} />
              Missing
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium">Stable Diffusion:</span>
          {status.stableDiffusionAvailable ? (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle size={14} />
              Ready
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-500">
              <AlertTriangle size={14} />
              Missing
            </span>
          )}
        </div>
      </div>
      
      <button 
        onClick={checkStatus}
        disabled={isChecking}
        className="text-xs text-primary hover:underline"
      >
        {isChecking ? 'Checking...' : 'Check again'}
      </button>
    </div>
  );
};

export default ModelStatus;
