
/**
 * Utility for interacting with local Ollama models
 */

// Default URL for Ollama API
const OLLAMA_API_URL = 'http://localhost:11434/api';

/**
 * Check if Ollama service is running and required models are available
 */
export const checkOllamaStatus = async (): Promise<{
  isRunning: boolean;
  llmAvailable: boolean;
  llmModel: string;
  stableDiffusionAvailable: boolean;
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
        error: 'Ollama service is not running'
      };
    }
    
    const data = await response.json();
    const models = data.models || [];
    
    // Look for LLM and stable diffusion models
    const llmModel = models.find((model: any) => 
      model.name.includes('llama') || 
      model.name.includes('mixtral') || 
      model.name.includes('mistral')
    );
    
    const stableDiffusionModel = models.find((model: any) => 
      model.name.includes('stable-diffusion') || 
      model.name.includes('sd')
    );
    
    return {
      isRunning: true,
      llmAvailable: !!llmModel,
      llmModel: llmModel?.name || '',
      stableDiffusionAvailable: !!stableDiffusionModel,
      error: !llmModel || !stableDiffusionModel ? 
        `Required models missing: ${!llmModel ? 'LLM' : ''}${(!llmModel && !stableDiffusionModel) ? ', ' : ''}${!stableDiffusionModel ? 'Stable Diffusion' : ''}` : 
        undefined
    };
  } catch (error) {
    return {
      isRunning: false,
      llmAvailable: false,
      llmModel: '',
      stableDiffusionAvailable: false,
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
 * Generate AI profile image using local Stable Diffusion
 */
export const generateProfileImage = async (
  prompt: string,
  modelName: string = 'sd'
): Promise<string> => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt: `portrait photo of ${prompt}, high quality, natural lighting, photo-realistic`,
        stream: false,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate image');
    }
    
    const data = await response.json();
    return data.image || '';
  } catch (error) {
    console.error('Error generating profile image:', error);
    return '';
  }
};
