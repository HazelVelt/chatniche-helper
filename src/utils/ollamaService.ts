
/**
 * Utility for interacting with local Ollama models
 */

// Default URL for Ollama API
const OLLAMA_API_URL = 'http://localhost:11434/api';
// Default URL for Stable Diffusion WebUI
const SD_WEBUI_URL = 'http://localhost:7860/sdapi/v1';

/**
 * Check if Ollama service is running and required models are available
 */
export const checkOllamaStatus = async (): Promise<{
  isRunning: boolean;
  llmAvailable: boolean;
  llmModel: string;
  stableDiffusionAvailable: boolean;
  availableModels: {
    llm: string[];
    stableDiffusion: string[];
  };
  error?: string;
}> => {
  try {
    // Check if base Ollama service is running
    const response = await fetch(`${OLLAMA_API_URL}/tags`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      return {
        isRunning: false,
        llmAvailable: false,
        llmModel: '',
        stableDiffusionAvailable: false,
        availableModels: { llm: [], stableDiffusion: [] },
        error: 'Ollama service is not running'
      };
    }
    
    const data = await response.json();
    const models = data.models || [];
    
    // Look for LLM models
    const llmModels = models.filter((model: any) => 
      model.name.includes('llama') || 
      model.name.includes('mixtral') || 
      model.name.includes('mistral')
    );
    
    const llmModel = llmModels.length > 0 ? llmModels[0].name : '';
    
    // Extract model names for UI selection
    const availableLlmModels = llmModels.map((model: any) => model.name);
    
    // Check if SD WebUI is available
    let stableDiffusionAvailable = false;
    let availableSdModels: string[] = [];
    
    try {
      const sdResponse = await fetch(`${SD_WEBUI_URL}/sd-models`, {
        method: 'GET'
      });
      
      if (sdResponse.ok) {
        const sdData = await sdResponse.json();
        stableDiffusionAvailable = true;
        availableSdModels = sdData.map((model: any) => model.title || model.model_name);
      }
    } catch (error) {
      console.error('Error checking SD WebUI status:', error);
    }
    
    return {
      isRunning: true,
      llmAvailable: llmModels.length > 0,
      llmModel,
      stableDiffusionAvailable,
      availableModels: {
        llm: availableLlmModels,
        stableDiffusion: availableSdModels
      },
      error: (!llmModels.length || !stableDiffusionAvailable) ? 
        `Required services missing: ${!llmModels.length ? 'LLM' : ''}${(!llmModels.length && !stableDiffusionAvailable) ? ', ' : ''}${!stableDiffusionAvailable ? 'Stable Diffusion WebUI' : ''}` : 
        undefined
    };
  } catch (error) {
    return {
      isRunning: false,
      llmAvailable: false,
      llmModel: '',
      stableDiffusionAvailable: false,
      availableModels: { llm: [], stableDiffusion: [] },
      error: 'Failed to connect to Ollama service'
    };
  }
};

/**
 * Generate chat response using local LLM
 */
export const generateChatResponse = async (
  message: string,
  modelName: string = 'llama3'
): Promise<string> => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt: message,
        system: "You are a friendly and engaging person in a dating app chat. Keep your responses concise (1-3 sentences), show genuine interest, ask occasional follow-up questions, and maintain a friendly, flirty tone without being inappropriate. Don't use emojis, just text.",
        stream: false,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate response');
    }
    
    const data = await response.json();
    return data.response || 'Sorry, I couldn\'t generate a response.';
  } catch (error) {
    console.error('Error generating chat response:', error);
    return 'Sorry, I couldn\'t connect to the AI service right now.';
  }
};

/**
 * Generate AI profile image using Stable Diffusion WebUI
 */
export const generateProfileImage = async (
  prompt: string,
  modelName: string = 'stable_diffusion'
): Promise<string> => {
  try {
    // First check if SD WebUI is available
    const statusResponse = await fetch(`${SD_WEBUI_URL}/options`, {
      method: 'GET'
    });
    
    if (!statusResponse.ok) {
      throw new Error('Stable Diffusion WebUI is not available');
    }
    
    // Select the model
    await fetch(`${SD_WEBUI_URL}/options`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sd_model_checkpoint: modelName
      })
    });
    
    // Generate the image
    const response = await fetch(`${SD_WEBUI_URL}/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `portrait photo of ${prompt}, high quality, natural lighting, photo-realistic, 4k, detailed face`,
        negative_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation, nsfw",
        width: 512,
        height: 768,
        steps: 30,
        cfg_scale: 7,
        sampler_name: "Euler a"
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }
    
    const data = await response.json();
    return data.images?.[0] || '';
  } catch (error) {
    console.error('Error generating profile image:', error);
    return '';
  }
};

/**
 * Check if Stable Diffusion WebUI is available
 */
export const checkStableDiffusionStatus = async (): Promise<{
  isRunning: boolean;
  availableModels: string[];
}> => {
  try {
    const response = await fetch(`${SD_WEBUI_URL}/sd-models`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      return {
        isRunning: false,
        availableModels: []
      };
    }
    
    const data = await response.json();
    return {
      isRunning: true,
      availableModels: data.map((model: any) => model.title || model.model_name)
    };
  } catch (error) {
    console.error('Error checking Stable Diffusion WebUI status:', error);
    return {
      isRunning: false,
      availableModels: []
    };
  }
};
