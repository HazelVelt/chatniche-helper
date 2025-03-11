
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
    
    // Check if SD WebUI is available
    const sdStatus = await checkStableDiffusionStatus();
    
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
        `Required services missing: ${!llmModels.length ? 'LLM' : ''}${(!llmModels.length && !sdStatus.isRunning) ? ', ' : ''}${!sdStatus.isRunning ? 'Stable Diffusion WebUI' : ''}` : 
        undefined
    };
  } catch (error) {
    console.error('Error checking Ollama status:', error);
    // Try to check SD status separately
    const sdStatus = await checkStableDiffusionStatus().catch(() => ({
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
      signal: AbortSignal.timeout(20000), // 20 seconds timeout
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
        const imageData = await generateImageWithStableDiffusion(imagePrompt.trim());
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
        const imageData = await generateImageWithStableDiffusion(defaultImagePrompt);
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
    // Check if Stable Diffusion is available for a fallback
    try {
      // For image requests, try to handle with just SD even if LLM fails
      const isImageRequest = /what.*look.*like|show.*body|show.*picture|send.*photo|send.*pic|selfie/i.test(message.toLowerCase());
      if (isImageRequest) {
        const sdStatus = await checkStableDiffusionStatus();
        if (sdStatus.isRunning) {
          const defaultImagePrompt = "attractive young adult, dating profile photo, professional photography";
          const imageData = await generateImageWithStableDiffusion(defaultImagePrompt);
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

/**
 * Check if Stable Diffusion WebUI is available
 */
export const checkStableDiffusionStatus = async () => {
  try {
    console.log("Checking Stable Diffusion WebUI status...");
    
    // Attempt to connect to the Stable Diffusion WebUI API
    const response = await fetch(`${SD_WEBUI_URL}/sd-models`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Short timeout to avoid hanging if the server is not available
      signal: AbortSignal.timeout(3000),
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
    
    // Create the API payload with the format provided by the user
    const payload = {
      prompt: prompt,
      negative_prompt: allowNsfw ? "" : "nsfw, nudity, nude, naked, explicit content, pornography, sexual",
      styles: [""],
      seed: -1,
      subseed: -1,
      subseed_strength: 0,
      seed_resize_from_h: -1,
      seed_resize_from_w: -1,
      sampler_name: "",
      scheduler: "",
      batch_size: 1,
      n_iter: 1,
      steps: 30,
      cfg_scale: 7,
      width: 512,
      height: 768,
      restore_faces: true,
      tiling: false,
      do_not_save_samples: false,
      do_not_save_grid: false,
      eta: 0,
      denoising_strength: 0,
      s_min_uncond: 0,
      s_churn: 0,
      s_tmax: 0,
      s_tmin: 0,
      s_noise: 0,
      override_settings: {},
      override_settings_restore_afterwards: true,
      refiner_checkpoint: "",
      refiner_switch_at: 0,
      disable_extra_networks: false,
      comments: {},
      enable_hr: false,
      firstphase_width: 0,
      firstphase_height: 0,
      hr_scale: 2,
      hr_upscaler: "None",
      hr_second_pass_steps: 0,
      hr_resize_x: 0,
      hr_resize_y: 0,
      sampler_index: "Euler",
      script_name: "",
      script_args: [],
      send_images: true,
      save_images: false,
      alwayson_scripts: {}
    };
    
    // If model is specified, override settings
    if (modelName && modelName.trim() !== "") {
      payload.override_settings = {
        ...payload.override_settings,
        sd_model_checkpoint: modelName
      };
    }
    
    // Send the request to Stable Diffusion
    const response = await fetch(`${SD_WEBUI_URL}/txt2img`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });
    
    if (!response.ok) {
      console.error(`SD API error status: ${response.status}`);
      const errorText = await response.text();
      console.error(`SD API error: ${errorText}`);
      throw new Error(`Stable Diffusion API returned ${response.status}`);
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
