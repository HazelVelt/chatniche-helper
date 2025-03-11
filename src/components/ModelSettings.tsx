
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { checkOllamaStatus, checkStableDiffusionStatus } from '@/utils/ollamaService';
import { toast } from 'sonner';
import { Loader2, BadgeAlert } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ModelSettingsProps {
  onCancel: () => void;
  onSave: () => void;
}

const ModelSettings: React.FC<ModelSettingsProps> = ({ onCancel, onSave }) => {
  const { 
    modelSettings, 
    updateModelSettings, 
    availableModels, 
    setAvailableModels,
    useMockedServices,
    setUseMockedServices,
    forceMockedImage,
    setForceMockedImage
  } = useSettings();
  
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedSettings, setSelectedSettings] = useState({
    llmModel: modelSettings.llmModel,
    stableDiffusionModel: modelSettings.stableDiffusionModel
  });
  
  useEffect(() => {
    // Skip real service checks if in demo mode
    if (useMockedServices) {
      const demoModels = {
        llm: ['llama3', 'mistral', 'phi'],
        stableDiffusion: ['sd_xl_base_1.0', 'realisticVision']
      };
      setAvailableModels(demoModels);
      setIsLoading(false);
      return;
    }
    
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        // Check Ollama for LLM models
        const ollamaStatus = await checkOllamaStatus();
        console.log("Ollama status in settings:", ollamaStatus);
        
        // Check SD WebUI for SD models
        const sdStatus = await checkStableDiffusionStatus();
        console.log("SD WebUI status in settings:", sdStatus);
        
        // Combine available models
        const combinedModels = {
          llm: ollamaStatus.availableModels.llm,
          stableDiffusion: sdStatus.availableModels
        };
        
        setAvailableModels(combinedModels);
        
        // If there are no models detected but we have mocked services enabled
        if ((combinedModels.llm.length === 0 || combinedModels.stableDiffusion.length === 0) && 
            !ollamaStatus.isRunning && !sdStatus.isRunning) {
          // Show a prompt to enable demo mode
          const useDemo = window.confirm(
            "No AI services detected. Would you like to enable demo mode for testing?"
          );
          
          if (useDemo) {
            setUseMockedServices(true);
            const demoModels = {
              llm: ['llama3', 'mistral', 'phi'],
              stableDiffusion: ['sd_xl_base_1.0', 'realisticVision']
            };
            setAvailableModels(demoModels);
            toast.success("Demo mode enabled. AI responses will be simulated.");
            
            // Use first model from each category
            setSelectedSettings({
              llmModel: demoModels.llm[0],
              stableDiffusionModel: demoModels.stableDiffusion[0]
            });
            
            setIsLoading(false);
            return;
          }
        } else {
          // Only disable mocked services if real services are detected
          if (ollamaStatus.isRunning || sdStatus.isRunning) {
            setUseMockedServices(false);
          }
        }
        
        // If current models aren't in the available list, select the first ones
        if (combinedModels.llm.length > 0 && !combinedModels.llm.includes(selectedSettings.llmModel)) {
          setSelectedSettings(prev => ({ ...prev, llmModel: combinedModels.llm[0] }));
        }
        
        if (combinedModels.stableDiffusion.length > 0 && 
            !combinedModels.stableDiffusion.includes(selectedSettings.stableDiffusionModel)) {
          setSelectedSettings(prev => ({ 
            ...prev, 
            stableDiffusionModel: combinedModels.stableDiffusion[0] 
          }));
        }
        
        if (!ollamaStatus.isRunning) {
          toast.error("Ollama service is not running. Please start it to use LLM features.");
        }
        
        if (!sdStatus.isRunning) {
          toast.warning("Stable Diffusion WebUI is not running. Please start it for image generation.");
        }
      } catch (error) {
        console.error("Error fetching models:", error);
        toast.error("Failed to fetch available models");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModels();
  }, [setAvailableModels, setUseMockedServices, useMockedServices]);
  
  const handleSave = () => {
    updateModelSettings(selectedSettings);
    toast.success("Model settings saved successfully");
    onSave();
  };
  
  const toggleDemoMode = () => {
    if (!useMockedServices) {
      const demoModels = {
        llm: ['llama3', 'mistral', 'phi'],
        stableDiffusion: ['sd_xl_base_1.0', 'realisticVision']
      };
      setAvailableModels(demoModels);
      setSelectedSettings({
        llmModel: demoModels.llm[0],
        stableDiffusionModel: demoModels.stableDiffusion[0]
      });
      setUseMockedServices(true);
      toast.success("Demo mode enabled. AI responses will be simulated.");
    } else {
      setUseMockedServices(false);
      toast.info("Demo mode disabled. Will use actual AI services if available.");
      // Refresh to check for real services
      setIsLoading(true);
      setTimeout(() => {
        const fetchRealModels = async () => {
          try {
            const ollamaStatus = await checkOllamaStatus();
            const sdStatus = await checkStableDiffusionStatus();
            
            setAvailableModels({
              llm: ollamaStatus.availableModels.llm,
              stableDiffusion: sdStatus.availableModels
            });
          } catch (error) {
            console.error("Error fetching real models:", error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchRealModels();
      }, 500);
    }
  };
  
  const toggleForceMockedImage = () => {
    setForceMockedImage(!forceMockedImage);
    toast.info(forceMockedImage ? 
      "Will attempt to use real image generation when available" : 
      "Will always use fallback images regardless of SD availability");
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Checking available models...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 dark:text-gray-100">
      {/* Demo Mode Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-700">
        <div className="space-y-0.5">
          <h4 className="font-medium">Demo Mode</h4>
          <p className="text-sm text-muted-foreground">
            Use simulated AI responses when real services are unavailable
          </p>
        </div>
        <Switch
          checked={useMockedServices}
          onCheckedChange={toggleDemoMode}
        />
      </div>
      
      {!useMockedServices && (
        <div className="flex items-center justify-between rounded-lg border p-4 dark:border-gray-700">
          <div className="space-y-0.5">
            <h4 className="font-medium">Always Use Fallback Images</h4>
            <p className="text-sm text-muted-foreground">
              Skip real image generation and always use predefined images
            </p>
          </div>
          <Switch
            checked={forceMockedImage}
            onCheckedChange={toggleForceMockedImage}
          />
        </div>
      )}
      
      {useMockedServices && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 flex gap-2 items-start">
          <BadgeAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Demo mode is enabled. AI services are being simulated and responses are pre-generated.
            For full functionality with real AI models, disable demo mode and make sure Ollama and 
            Stable Diffusion WebUI are running.
          </p>
        </div>
      )}
      
      {/* LLM Model Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Chat LLM Model</h3>
        <p className="text-sm text-muted-foreground">
          Select which language model to use for generating chat responses
        </p>
        
        {availableModels.llm.length === 0 ? (
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4">
            <p className="text-amber-800 dark:text-amber-200">
              No LLM models found. Please start Ollama and install models, or enable demo mode.
            </p>
          </div>
        ) : (
          <RadioGroup
            value={selectedSettings.llmModel}
            onValueChange={(value) => setSelectedSettings(prev => ({ ...prev, llmModel: value }))}
            className="space-y-2"
          >
            {availableModels.llm.map(model => (
              <div key={model} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-secondary/50 transition-colors dark:border-gray-700">
                <RadioGroupItem value={model} id={`llm-${model}`} />
                <Label htmlFor={`llm-${model}`} className="flex-1 cursor-pointer">
                  {model}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
      
      {/* Stable Diffusion Model Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Stable Diffusion Model</h3>
        <p className="text-sm text-muted-foreground">
          Select which image generation model to use for creating profile images
        </p>
        
        {availableModels.stableDiffusion.length === 0 ? (
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4">
            <p className="text-amber-800 dark:text-amber-200">
              No Stable Diffusion models found. Please start the Stable Diffusion WebUI or enable demo mode.
            </p>
          </div>
        ) : (
          <RadioGroup
            value={selectedSettings.stableDiffusionModel}
            onValueChange={(value) => setSelectedSettings(prev => ({ ...prev, stableDiffusionModel: value }))}
            className="space-y-2"
          >
            {availableModels.stableDiffusion.map(model => (
              <div key={model} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-secondary/50 transition-colors dark:border-gray-700">
                <RadioGroupItem value={model} id={`sd-${model}`} />
                <Label htmlFor={`sd-${model}`} className="flex-1 cursor-pointer">
                  {model}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

export default ModelSettings;
