
import { useSettings } from "@/contexts/SettingsContext";

// SDKit API interface
interface SdkitRequest {
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg_scale?: number;
  seed?: number;
  batch_size?: number;
  model_name?: string;
  sampler_name?: string;
  allow_nsfw?: boolean;
}

interface SdkitResponse {
  images: string[];
  parameters: Record<string, any>;
  info: string;
}

// Check if SDKit server is running
export const checkSdkitStatus = async (): Promise<{
  isRunning: boolean;
  availableModels: string[];
}> => {
  try {
    // Try to fetch from SDKit API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('http://127.0.0.1:8000/models', {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error("SDKit API responded with non-OK status:", response.status);
      return { isRunning: false, availableModels: [] };
    }
    
    const models = await response.json();
    console.log("Available SDKit models:", models);
    
    return {
      isRunning: true,
      availableModels: Array.isArray(models) ? models : []
    };
  } catch (error) {
    console.error("Error checking SDKit status:", error);
    return { isRunning: false, availableModels: [] };
  }
};

// Generate image with SDKit
export const generateImageWithSdkit = async (
  prompt: string,
  model?: string,
  allowNsfw: boolean = false,
  negativePrompt: string = "ugly, blurry, low quality, deformed, disfigured"
): Promise<string> => {
  try {
    console.log(`Generating image with SDKit, prompt: ${prompt}, model: ${model}, allowNsfw: ${allowNsfw}`);
    
    // Default parameters
    const request: SdkitRequest = {
      prompt: prompt,
      negative_prompt: negativePrompt,
      width: 512,
      height: 768,
      steps: 30,
      cfg_scale: 7,
      seed: -1, // Random seed
      batch_size: 1,
      model_name: model || "sd_15",
      sampler_name: "euler_a",
      allow_nsfw: allowNsfw
    };
    
    // Send request to SDKit API
    const response = await fetch('http://127.0.0.1:8000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      // Set timeout to 60 seconds for image generation
      signal: AbortSignal.timeout(60000)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SDKit API error: ${response.status} ${errorText}`);
    }
    
    const data: SdkitResponse = await response.json();
    console.log("SDKit generated images:", data.images.length);
    
    if (!data.images || data.images.length === 0) {
      throw new Error("No images were generated");
    }
    
    // Return first image as base64 data URL
    return data.images[0];
  } catch (error) {
    console.error("Failed to generate image with SDKit:", error);
    throw error;
  }
};

// Initialize SDKit with model paths
export const initializeSdkit = async (
  sd15Path: string,
  sdxlPath: string
): Promise<boolean> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_paths: {
          sd15: sd15Path,
          sdxl: sdxlPath
        }
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Failed to initialize SDKit: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error initializing SDKit:", error);
    return false;
  }
};

// Load a specific model in SDKit
export const loadSdkitModel = async (modelType: 'sd15' | 'sdxl'): Promise<boolean> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/load-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_type: modelType
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout for model loading
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load model: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error loading model:", error);
    return false;
  }
};
