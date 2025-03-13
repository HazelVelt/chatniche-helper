
import { useSettings } from "@/contexts/SettingsContext";
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

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

// This function runs a Python script to check if SDKit is installed and list available models
export const checkSdkitStatus = async (): Promise<{
  isRunning: boolean;
  availableModels: string[];
}> => {
  // Check if we're in a Node.js environment (desktop app)
  const isNodeEnvironment = typeof process !== 'undefined' && 
                           process.versions != null && 
                           process.versions.node != null;
  
  if (!isNodeEnvironment) {
    console.log("Browser environment detected, using mocked SDKit check");
    // In a browser environment, return mock data
    return {
      isRunning: false,
      availableModels: []
    };
  }
  
  return new Promise((resolve, reject) => {
    // Create a temporary Python script to check SDKit
    const tempScriptPath = path.join(process.cwd(), 'temp_check_sdkit.py');
    
    const pythonScript = `
import sys
try:
    import sdkit
    print("SDKit_INSTALLED:TRUE")
    
    # Check for model files in provided paths
    import os
    
    sd15_path = os.path.join(os.getcwd(), "src", "models", "sd15")
    sdxl_path = os.path.join(os.getcwd(), "src", "models", "sdxl")
    
    models = []
    
    # Check SD1.5 models
    if os.path.exists(sd15_path):
        for file in os.listdir(sd15_path):
            if file.endswith('.safetensors') or file.endswith('.ckpt'):
                models.append('sd_15:' + file)
    
    # Check SDXL models
    if os.path.exists(sdxl_path):
        for file in os.listdir(sdxl_path):
            if file.endswith('.safetensors') or file.endswith('.ckpt'):
                models.append('sdxl:' + file)
    
    print("AVAILABLE_MODELS:" + ",".join(models))
except ImportError:
    print("SDKit_INSTALLED:FALSE")
    sys.exit(1)
`;

    fs.writeFileSync(tempScriptPath, pythonScript);
    
    const pythonProcess = spawn('python', [tempScriptPath]);
    
    let output = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up temporary script
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (err) {
        console.error("Failed to delete temporary script:", err);
      }
      
      if (code !== 0) {
        console.error(`SDKit check process exited with code ${code}`);
        resolve({
          isRunning: false,
          availableModels: []
        });
        return;
      }
      
      const isInstalled = output.includes('SDKit_INSTALLED:TRUE');
      
      const modelsMatch = output.match(/AVAILABLE_MODELS:(.*)/);
      const availableModels = modelsMatch && modelsMatch[1] 
        ? modelsMatch[1].split(',').filter(Boolean) 
        : [];
      
      resolve({
        isRunning: isInstalled,
        availableModels: availableModels
      });
    });
  });
};

// Generate image with SDKit - for desktop app, this runs Python directly
export const generateImageWithSdkit = async (
  prompt: string,
  model?: string,
  allowNsfw: boolean = false,
  negativePrompt: string = "ugly, blurry, low quality, deformed, disfigured"
): Promise<string> => {
  // Check if we're in a Node.js environment (desktop app)
  const isNodeEnvironment = typeof process !== 'undefined' && 
                           process.versions != null && 
                           process.versions.node != null;
  
  if (!isNodeEnvironment) {
    console.log("Browser environment detected, using mocked image generation");
    // For browser environment, return a placeholder image
    const placeholderImages = [
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg",
      "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg"
    ];
    
    const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];
    const response = await fetch(randomImage);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  return new Promise((resolve, reject) => {
    // Generate a unique ID for this generation
    const generationId = uuidv4();
    const outputDir = path.join(process.cwd(), 'generated_images');
    const outputPath = path.join(outputDir, `${generationId}.png`);
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Parse the model string to get the correct model path
    let modelPath = '';
    let modelType = 'stable-diffusion';
    
    if (model && model.startsWith('sd_15:')) {
      modelPath = path.join(process.cwd(), 'src', 'models', 'sd15', model.split(':')[1]);
      modelType = 'stable-diffusion';
    } else if (model && model.startsWith('sdxl:')) {
      modelPath = path.join(process.cwd(), 'src', 'models', 'sdxl', model.split(':')[1]);
      modelType = 'stable-diffusion-xl';
    } else {
      // Default to first available SD1.5 model
      const sd15Dir = path.join(process.cwd(), 'src', 'models', 'sd15');
      if (fs.existsSync(sd15Dir)) {
        const models = fs.readdirSync(sd15Dir).filter(file => 
          file.endsWith('.safetensors') || file.endsWith('.ckpt')
        );
        if (models.length > 0) {
          modelPath = path.join(sd15Dir, models[0]);
          modelType = 'stable-diffusion';
        }
      }
    }
    
    if (!modelPath) {
      reject(new Error("No valid model found"));
      return;
    }
    
    // Create a temporary Python script for image generation
    const tempScriptPath = path.join(process.cwd(), 'temp_generate_image.py');
    
    const sampler = 'euler_a';
    const seed = Math.floor(Math.random() * 1000000);
    
    const pythonScript = `
import sdkit
from sdkit.generate import generate_images
from sdkit.models import load_model
from sdkit.utils import log, save_images
import base64
import io
from PIL import Image
import sys

try:
    context = sdkit.Context()
    
    # Load the model
    context.model_paths["${modelType}"] = "${modelPath.replace(/\\/g, '\\\\')}"
    load_model(context, "${modelType}")
    
    # Generate the image
    images = generate_images(
        context,
        prompt="${prompt.replace(/"/g, '\\"')}",
        negative_prompt="${negativePrompt.replace(/"/g, '\\"')}",
        seed=${seed},
        width=512,
        height=512,
        num_inference_steps=30,
        guidance_scale=7.5,
        sampler_name="${sampler}"
    )
    
    # Save the image to disk
    save_images(images, dir_path="${outputDir.replace(/\\/g, '\\\\')}", file_name="${generationId}")
    
    # Also output as base64 for direct use
    img = images[0]
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    print("IMAGE_DATA:" + img_str)
    
    log.info("Generated image successfully!")
except Exception as e:
    log.error(f"Error generating image: {str(e)}")
    print(f"ERROR:{str(e)}")
    sys.exit(1)
`;

    fs.writeFileSync(tempScriptPath, pythonScript);
    
    const pythonProcess = spawn('python', [tempScriptPath]);
    
    let output = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up temporary script
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (err) {
        console.error("Failed to delete temporary script:", err);
      }
      
      if (code !== 0) {
        console.error(`Image generation process exited with code ${code}`);
        reject(new Error(`Image generation failed with code ${code}`));
        return;
      }
      
      // Extract base64 image data
      const imageDataMatch = output.match(/IMAGE_DATA:(.*)/);
      if (imageDataMatch && imageDataMatch[1]) {
        const base64Data = imageDataMatch[1];
        resolve(`data:image/png;base64,${base64Data}`);
      } else if (fs.existsSync(outputPath)) {
        // Fallback to reading the file if the base64 output wasn't found
        const imageBuffer = fs.readFileSync(outputPath);
        const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
        resolve(base64Image);
      } else {
        const errorMatch = output.match(/ERROR:(.*)/);
        reject(new Error(errorMatch ? errorMatch[1] : "Unknown error generating image"));
      }
    });
  });
};

// Initialize SDKit with model paths - for desktop apps
export const initializeSdkit = async (
  sd15Path: string,
  sdxlPath: string
): Promise<boolean> => {
  // Check if we're in a Node.js environment
  const isNodeEnvironment = typeof process !== 'undefined' && 
                           process.versions != null && 
                           process.versions.node != null;
  
  if (!isNodeEnvironment) {
    console.log("Browser environment detected, mocking initialization");
    return true;
  }
  
  return new Promise((resolve, reject) => {
    // Create temp directories if they don't exist
    try {
      if (!fs.existsSync(sd15Path)) {
        fs.mkdirSync(sd15Path, { recursive: true });
      }
      
      if (!fs.existsSync(sdxlPath)) {
        fs.mkdirSync(sdxlPath, { recursive: true });
      }
      
      // Create a temporary Python script to check SDKit installation
      const tempScriptPath = path.join(process.cwd(), 'temp_init_sdkit.py');
      
      const pythonScript = `
import sys
try:
    import sdkit
    print("SDKit_INSTALLED:TRUE")
    sys.exit(0)
except ImportError:
    print("SDKit_INSTALLED:FALSE")
    sys.exit(1)
`;

      fs.writeFileSync(tempScriptPath, pythonScript);
      
      const pythonProcess = spawn('python', [tempScriptPath]);
      
      let output = '';
      
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      pythonProcess.on('close', (code) => {
        // Clean up temporary script
        try {
          fs.unlinkSync(tempScriptPath);
        } catch (err) {
          console.error("Failed to delete temporary script:", err);
        }
        
        resolve(output.includes('SDKit_INSTALLED:TRUE'));
      });
    } catch (error) {
      console.error("Error initializing SDKit directories:", error);
      reject(error);
    }
  });
};

// Load a specific model in SDKit
export const loadSdkitModel = async (modelType: 'sd15' | 'sdxl'): Promise<boolean> => {
  // Check if we're in a Node.js environment
  const isNodeEnvironment = typeof process !== 'undefined' && 
                           process.versions != null && 
                           process.versions.node != null;
  
  if (!isNodeEnvironment) {
    console.log("Browser environment detected, mocking model loading");
    return true;
  }
  
  return new Promise((resolve, reject) => {
    const modelDir = path.join(
      process.cwd(), 
      'src', 
      'models', 
      modelType === 'sd15' ? 'sd15' : 'sdxl'
    );
    
    if (!fs.existsSync(modelDir)) {
      resolve(false);
      return;
    }
    
    const models = fs.readdirSync(modelDir).filter(file => 
      file.endsWith('.safetensors') || file.endsWith('.ckpt')
    );
    
    if (models.length === 0) {
      resolve(false);
      return;
    }
    
    // If models exist in the directory, we count this as success
    // (actual loading happens at generation time)
    resolve(true);
  });
};
