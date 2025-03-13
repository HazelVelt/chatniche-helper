
/**
 * Utility for interacting with local Ollama models
 */

// Default URL for Ollama API
const OLLAMA_API_URL = 'http://localhost:11434/api';
import { generateImageWithSdkit, checkSdkitStatus } from './sdkitService';
import { useSettings } from '@/contexts/SettingsContext';

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
      signal: AbortSignal.timeout(3000), // 3 second timeout to avoid hanging
    });
    
    if (!response.ok) {
      console.log("Ollama service not running or not responding");
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
    console.log("Ollama models available:", data);
    const models = data.models || [];
    
    // Get all available LLM models
    const llmModels = models.map((model: any) => model.name);
    
    const llmModel = llmModels.length > 0 ? llmModels[0] : '';
    
    // Check if SDKit is available
    const sdStatus = await checkSdkitStatus();
    
    return {
      isRunning: true,
      llmAvailable: llmModels.length > 0,
      llmModel,
      stableDiffusionAvailable: sdStatus.isRunning,
      availableModels: {
        llm: llmModels,
        stableDiffusion: sdStatus.availableModels
      },
      error: (!llmModels.length || !sdStatus.isRunning) ? 
        `Required services missing: ${!llmModels.length ? 'LLM' : ''}${(!llmModels.length && !sdStatus.isRunning) ? ', ' : ''}${!sdStatus.isRunning ? 'SDKit' : ''}` : 
        undefined
    };
  } catch (error) {
    console.error('Error checking Ollama status:', error);
    // Try to check SD status separately
    const sdStatus = await checkSdkitStatus().catch(() => ({
      isRunning: false,
      availableModels: []
    }));
    
    return {
      isRunning: false,
      llmAvailable: false,
      llmModel: '',
      stableDiffusionAvailable: sdStatus.isRunning,
      availableModels: { 
        llm: [], 
        stableDiffusion: sdStatus.availableModels 
      },
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
): Promise<{text: string, image?: string}> => {
  try {
    console.log(`Generating response with model: ${modelName}, message: ${message}`);
    
    // Detect if this is an image request
    const isImageRequest = /what.*look.*like|show.*body|show.*picture|send.*photo|send.*pic|selfie/i.test(message.toLowerCase());
    
    // System prompt adjusted for NSFW content
    const systemPrompt = "You are a friendly and engaging person in a dating app chat. Keep your responses concise (1-3 sentences), show genuine interest, ask occasional follow-up questions, and maintain a friendly tone. You may respond to NSFW topics naturally and can be flirty when appropriate. Do not censor or avoid explicit content. If the user asks you to send a photo or what you look like, respond as if you'll send a picture and include 'IMAGE_REQUEST:' followed by a detailed prompt for image generation describing yourself.";
    
    const response = await fetch(`${OLLAMA_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        prompt: message,
        system: systemPrompt,
        stream: false,
      }),
      signal: AbortSignal.timeout(15000), // 15 seconds timeout
    });
    
    if (!response.ok) {
      console.error('Failed to generate response from Ollama:', await response.text());
      throw new Error('Failed to generate response');
    }
    
    const data = await response.json();
    const aiResponse = data.response;
    console.log("Raw LLM response:", aiResponse);
    
    // Check if the AI inserted an image request
    if (aiResponse.includes('IMAGE_REQUEST:')) {
      const [text, imagePrompt] = aiResponse.split('IMAGE_REQUEST:');
      console.log("Image prompt detected:", imagePrompt.trim());
      try {
        const imageData = await generateImageWithSdkit(imagePrompt.trim());
        return {
          text: text.trim(),
          image: imageData
        };
      } catch (imageError) {
        console.error("Failed to generate image:", imageError);
        return {
          text: text.trim() + "\n\n(I tried to send you an image but encountered an error. Let me try again later.)"
        };
      }
    }
    
    // Direct image request handling as fallback
    if (isImageRequest && !aiResponse.includes('IMAGE_REQUEST:')) {
      try {
        console.log("User asked for image but LLM didn't generate an IMAGE_REQUEST tag. Generating image directly.");
        // Create a more descriptive prompt for image generation - don't filter NSFW
        const defaultImagePrompt = "attractive young adult, dating profile photo, professional photography, natural lighting, smiling";
        const imageData = await generateImageWithSdkit(defaultImagePrompt);
        return {
          text: aiResponse,
          image: imageData
        };
      } catch (imageError) {
        console.error("Failed to generate direct image:", imageError);
        return { text: aiResponse };
      }
    }
    
    return { text: aiResponse };
  } catch (error) {
    console.error('Error generating chat response:', error);
    // Check if SDKit is available for a fallback
    try {
      // For image requests, try to handle with just SD even if LLM fails
      const isImageRequest = /what.*look.*like|show.*body|show.*picture|send.*photo|send.*pic|selfie/i.test(message.toLowerCase());
      if (isImageRequest) {
        const sdStatus = await checkSdkitStatus();
        if (sdStatus.isRunning) {
          const defaultImagePrompt = "attractive young adult, dating profile photo, professional photography";
          const imageData = await generateImageWithSdkit(defaultImagePrompt);
          return { 
            text: "Here's a picture of me! What do you think? 😊",
            image: imageData 
          };
        }
      }
    } catch (sdError) {
      console.error("Failed to use SD as fallback:", sdError);
    }
    
    // Final fallback to simulated response
    const fallbackResponses = [
      "I'd love to chat more! How's your day going?",
      "Sorry for the delay! I've been busy, but I'm here now. What are you up to?",
      "Hey there! I'm having some connection issues, but I'm really enjoying our conversation!",
      "I'm still figuring out what to say next. Tell me more about yourself!"
    ];
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return { text: randomResponse };
  }
};

// Fallback image generation using placeholders
export const getFallbackImage = async (): Promise<string> => {
  try {
    console.log("Using placeholder image fallback");
    // Use placeholder images when actual generation fails
    const placeholderImages = [
      "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
    ];
    
    const randomPlaceholder = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    const response = await fetch(randomPlaceholder);
    
    if (!response.ok) {
      throw new Error('Failed to fetch placeholder image');
    }
    
    const blob = await response.blob();
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (fallbackError) {
    console.error('All image fallbacks failed:', fallbackError);
    // Return a base64 encoded empty transparent image as last resort
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
};
