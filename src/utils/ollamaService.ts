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
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
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
        const imageData = await generateImage(imagePrompt.trim());
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
        const imageData = await generateImage(defaultImagePrompt);
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
 * Generate image using Stable Diffusion WebUI's txt2img API
 */
export const generateImage = async (
  prompt: string,
  negativePrompt: string = "deformed, distorted, disfigured, poorly drawn, bad anatomy, extra limb, missing limb, floating limbs"
): Promise<string> => {
  try {
    console.log("Generating image with prompt:", prompt);
    
    // Enhanced prompt with quality keywords
    const enhancedPrompt = `${prompt}, best quality, high resolution, detailed`;
    
    // Use the txt2img endpoint with proper parameters
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
        sampler_index: "Euler",
        restore_faces: true,
        send_images: true,
        save_images: false
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to generate image from SD WebUI:', await response.text());
      throw new Error('Failed to generate image');
    }
    
    const data = await response.json();
    console.log("Image generation successful");
    
    if (!data.images || data.images.length === 0) {
      throw new Error('No images returned from API');
    }
    
    return `data:image/png;base64,${data.images[0]}`;
  } catch (error) {
    console.error('Error generating image:', error);
    
    // Fallback to Unsplash if SD WebUI fails
    try {
      console.log("Falling back to Unsplash for image");
      const gender = Math.random() > 0.5 ? 'woman' : 'man';
      const category = ['portrait', 'person', 'model', 'fashion'][Math.floor(Math.random() * 4)];
      const response = await fetch(`https://source.unsplash.com/featured/768x1024/?${category},${gender}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Unsplash');
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
      console.error('Fallback image fetch failed:', fallbackError);
      throw error; // Throw the original error
    }
  }
};

/**
 * Generate AI profile image using Stable Diffusion WebUI
 */
export const generateProfileImage = async (
  prompt: string,
  modelName: string = ''
): Promise<string> => {
  return generateImage(prompt);
};

/**
 * Check if Stable Diffusion WebUI is available
 */
export const checkStableDiffusionStatus = async () => {
  try {
    console.log("Checking Stable Diffusion WebUI status...");
    
    // Attempt to connect to the Stable Diffusion WebUI API
    const response = await fetch('http://127.0.0.1:7860/sdapi/v1/sd-models', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Short timeout to avoid hanging if the server is not available
      signal: AbortSignal.timeout(5000),
    });
    
    // If not successful, SD is not running
    if (!response.ok) {
      return {
        isRunning: false,
        availableModels: []
      };
    }
    
    // Parse the models and return them
    const modelsData = await response.json();
    
    // Extract model titles/names
    const models = modelsData.map((model: any) => model.title || model.model_name);
    
    return {
      isRunning: true,
      availableModels: models
    };
  } catch (error) {
    console.error("Error checking Stable Diffusion WebUI status:", error);
    return {
      isRunning: false,
      availableModels: []
    };
  }
};

/**
 * Generate image using Stable Diffusion WebUI's txt2img API with options
 */
export const generateImageWithStableDiffusion = async (
  prompt: string,
  modelName?: string,
  allowNsfw = false
): Promise<string> => {
  try {
    console.log(`Generating image with prompt: ${prompt}`);
    
    // Create the API payload
    const payload = {
      prompt: prompt,
      negative_prompt: allowNsfw ? "" : "nsfw, nudity, nude, naked, explicit content, pornography, sexual",
      steps: 20,
      width: 512,
      height: 768,
      cfg_scale: 7,
      sampler_name: "Euler a",
      model: modelName || "",  // If model is not specified, use the current one
    };
    
    // Send the request to Stable Diffusion
    const response = await fetch('http://127.0.0.1:7860/sdapi/v1/txt2img', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Stable Diffusion API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert the base64 image to a data URL for display
    if (data.images && data.images.length > 0) {
      const imageBase64 = data.images[0];
      return `data:image/png;base64,${imageBase64}`;
    }
    
    throw new Error("No image was generated");
  } catch (error) {
    console.error("Error generating image with Stable Diffusion:", error);
    throw error;
  }
};
