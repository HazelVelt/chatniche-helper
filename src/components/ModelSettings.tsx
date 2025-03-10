
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';
import { checkOllamaStatus, checkStableDiffusionStatus } from '@/utils/ollamaService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ModelSettingsProps {
  onCancel: () => void;
  onSave: () => void;
}

const ModelSettings: React.FC<ModelSettingsProps> = ({ onCancel, onSave }) => {
  const { modelSettings, updateModelSettings, availableModels, setAvailableModels } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedSettings, setSelectedSettings] = useState({
    llmModel: modelSettings.llmModel,
    stableDiffusionModel: modelSettings.stableDiffusionModel
  });
  
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoading(true);
      try {
        // Check Ollama for LLM models
        const ollamaStatus = await checkOllamaStatus();
        
        // Check SD WebUI for SD models
        const sdStatus = await checkStableDiffusionStatus();
        
        // Combine available models
        const combinedModels = {
          llm: ollamaStatus.availableModels.llm,
          stableDiffusion: sdStatus.availableModels
        };
        
        setAvailableModels(combinedModels);
        
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
        toast.error("Failed to fetch available models");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModels();
  }, [setAvailableModels]);
  
  const handleSave = () => {
    updateModelSettings(selectedSettings);
    toast.success("Model settings saved successfully");
    onSave();
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
    <div className="space-y-6">
      {/* LLM Model Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Chat LLM Model</h3>
        <p className="text-sm text-muted-foreground">
          Select which language model to use for generating chat responses
        </p>
        
        {availableModels.llm.length === 0 ? (
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4">
            <p className="text-amber-800 dark:text-amber-200">
              No LLM models found. Please start Ollama and install models.
            </p>
          </div>
        ) : (
          <RadioGroup
            value={selectedSettings.llmModel}
            onValueChange={(value) => setSelectedSettings(prev => ({ ...prev, llmModel: value }))}
            className="space-y-2"
          >
            {availableModels.llm.map(model => (
              <div key={model} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-secondary/50 transition-colors">
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
              No Stable Diffusion models found. Please start the Stable Diffusion WebUI.
            </p>
          </div>
        ) : (
          <RadioGroup
            value={selectedSettings.stableDiffusionModel}
            onValueChange={(value) => setSelectedSettings(prev => ({ ...prev, stableDiffusionModel: value }))}
            className="space-y-2"
          >
            {availableModels.stableDiffusion.map(model => (
              <div key={model} className="flex items-center space-x-2 rounded-md border p-3 hover:bg-secondary/50 transition-colors">
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
