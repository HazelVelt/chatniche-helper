
/**
 * Utility for interacting with local Ollama models
 */

// Default URL for Ollama API
const OLLAMA_API_URL = 'http://localhost:11434/api';
// Default URL for Stable Diffusion WebUI (Automatic1111)
const SD_WEBUI_URL = 'http://127.0.0.1:7860/sdapi/v1';

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
    
    // Check if SD WebUI is available
    let stableDiffusionAvailable = false;
    let availableSdModels: string[] = [];
    
    try {
      const sdResponse = await fetch(`${SD_WEBUI_URL}/sd-models`, {
        method: 'GET'
      });
      
      if (sdResponse.ok) {
        const sdData = await sdResponse.json();
        console.log("SD WebUI models available:", sdData);
        stableDiffusionAvailable = true;
        availableSdModels = sdData.map((model: any) => model.title || model.model_name);
      } else {
        console.log("SD WebUI response not OK:", await sdResponse.text());
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
        llm: llmModels,
        stableDiffusion: availableSdModels
      },
      error: (!llmModels.length || !stableDiffusionAvailable) ? 
        `Required services missing: ${!llmModels.length ? 'LLM' : ''}${(!llmModels.length && !stableDiffusionAvailable) ? ', ' : ''}${!stableDiffusionAvailable ? 'Stable Diffusion WebUI' : ''}` : 
        undefined
    };
  } catch (error) {
    console.error('Error checking Ollama status:', error);
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
): Promise<{text: string, image?: string}> => {
  try {
    console.log(`Generating response with model: ${modelName}, message: ${message}`);
    
    // Try to detect if this is an image request
    const isImageRequest = /generate.*image|show.*picture|draw|create.*image|make.*picture|visualize/i.test(message);
    
    // System prompt adjusted for NSFW content (with warning)
    const systemPrompt = "You are a friendly and engaging person in a dating app chat. Keep your responses concise (1-3 sentences), show genuine interest, ask occasional follow-up questions, and maintain a friendly tone. You may respond to NSFW topics naturally if the user mentions them. If the user asks you to generate or create an image, include 'IMAGE_REQUEST:' followed by a detailed prompt for image generation.";
    
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
        const imageData = await generateProfileImage(imagePrompt.trim());
        return {
          text: text.trim(),
          image: imageData
        };
      } catch (imageError) {
        console.error("Failed to generate image:", imageError);
        return {
          text: text.trim() + "\n\n(I tried to generate an image but encountered an error. Please try again later.)"
        };
      }
    }
    
    // If it's detected as an image request but LLM didn't insert IMAGE_REQUEST tag,
    // we'll add one directly
    if (isImageRequest && !aiResponse.includes('IMAGE_REQUEST:')) {
      try {
        console.log("User asked for image but LLM didn't generate an IMAGE_REQUEST tag. Generating image directly.");
        const imagePrompt = message.replace(/generate|create|draw|show|make|picture|image|visualize/gi, '').trim();
        const imageData = await generateProfileImage(imagePrompt);
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
    return { text: 'Sorry, I couldn\'t connect to the AI service right now.' };
  }
};

/**
 * Generate AI profile image using Stable Diffusion WebUI
 */
export const generateProfileImage = async (
  prompt: string,
  modelName: string = ''
): Promise<string> => {
  try {
    // First check if SD WebUI is available
    const statusResponse = await fetch(`${SD_WEBUI_URL}/options`, {
      method: 'GET'
    });
    
    if (!statusResponse.ok) {
      console.error('Stable Diffusion WebUI is not available', await statusResponse.text());
      throw new Error('Stable Diffusion WebUI is not available');
    }
    
    // If a specific model is requested, try to select it
    if (modelName) {
      try {
        const modelSelectResponse = await fetch(`${SD_WEBUI_URL}/options`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sd_model_checkpoint: modelName
          })
        });
        
        if (!modelSelectResponse.ok) {
          console.error('Failed to select SD model:', await modelSelectResponse.text());
        } else {
          console.log(`Successfully selected SD model: ${modelName}`);
        }
      } catch (error) {
        console.error('Error selecting SD model:', error);
      }
    }
    
    // Enhanced prompt with quality keywords but allows NSFW content
    const enhancedPrompt = `${prompt}, best quality, high resolution, detailed, trending on artstation`;
    
    // Milder negative prompt that only filters major issues but allows NSFW
    const negativePrompt = "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation";
    
    console.log("Generating image with prompt:", enhancedPrompt);
    
    // Generate the image
    const response = await fetch(`${SD_WEBUI_URL}/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: negativePrompt,
        width: 512,
        height: 768,
        steps: 30,
        cfg_scale: 7,
        sampler_name: "DPM++ 2M Karras"
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to generate image from SD WebUI:', await response.text());
      throw new Error('Failed to generate image');
    }
    
    const data = await response.json();
    console.log("Image generation successful");
    return data.images?.[0] || '';
  } catch (error) {
    console.error('Error generating profile image:', error);
    throw error;
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
    console.log("Checking Stable Diffusion WebUI status...");
    const response = await fetch(`${SD_WEBUI_URL}/sd-models`);
    
    if (!response.ok) {
      console.error("SD WebUI response not OK:", await response.text());
      return {
        isRunning: false,
        availableModels: []
      };
    }
    
    const data = await response.json();
    console.log("SD WebUI available models:", data);
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
