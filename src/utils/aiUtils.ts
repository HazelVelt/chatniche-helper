
import { v4 as uuidv4 } from 'uuid';
import { 
  checkOllamaStatus, 
  generateImageWithStableDiffusion, 
  checkStableDiffusionStatus, 
  generateChatResponse 
} from './ollamaService';
import { faker } from '@faker-js/faker';

// Generate an AI profile
export const generateAIProfile = async (modelName?: string) => {
  // Check if Ollama and SD WebUI are available
  const ollamaStatus = await checkOllamaStatus();
  const sdStatus = await checkStableDiffusionStatus();
  
  console.log("Ollama status:", ollamaStatus);
  console.log("SD WebUI status:", sdStatus);
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate a random profile
  const gender = Math.random() > 0.5 ? 'female' : 'male';
  const firstName = faker.person.firstName(gender as any);
  const age = Math.floor(Math.random() * 15) + 23; // 23-38
  
  // List of possible interests
  const possibleInterests = [
    'Photography', 'Hiking', 'Reading', 'Cooking', 'Travel', 
    'Yoga', 'Movies', 'Art', 'Music', 'Dancing', 'Writing',
    'Fitness', 'Technology', 'Food', 'Fashion', 'Sports',
    'Coffee', 'Wine', 'Pets', 'Nature', 'Gaming'
  ];
  
  // Randomly select 3-5 interests
  const numInterests = Math.floor(Math.random() * 3) + 3;
  const interests = [];
  for (let i = 0; i < numInterests; i++) {
    const randomIndex = Math.floor(Math.random() * possibleInterests.length);
    interests.push(possibleInterests[randomIndex]);
    possibleInterests.splice(randomIndex, 1);
  }
  
  // Generate a bio using simulated LLM or Ollama if available
  let bio = "";
  if (ollamaStatus.isRunning && ollamaStatus.llmAvailable) {
    try {
      const bioPrompt = `Generate a short dating app bio for a ${age} year old ${gender} named ${firstName} who likes ${interests.join(', ')}. Keep it under 150 characters.`;
      const bioResponse = await generateChatResponse(bioPrompt, ollamaStatus.llmModel);
      bio = bioResponse.text;
    } catch (error) {
      console.error("Error generating bio with Ollama:", error);
      // Fall back to simulated bio
      bio = generateSimulatedBio(interests);
    }
  } else {
    // Fallback to simulated bio
    bio = generateSimulatedBio(interests);
  }
  
  // For image generation, try using Stable Diffusion first
  let imageUrl = "";
  
  // Check if Stable Diffusion WebUI is available for image generation
  if (sdStatus.isRunning) {
    try {
      const prompt = `${gender}, young adult, ${age} years old, attractive, portrait photo, highly detailed, photorealistic`;
      console.log("Generating profile image with prompt:", prompt);
      const imageData = await generateImageWithStableDiffusion(prompt);
      if (imageData) {
        imageUrl = imageData;
        console.log("Profile image generated successfully");
      }
    } catch (error) {
      console.error('Error generating image with Stable Diffusion:', error);
      // Fall back to Unsplash
      imageUrl = await getUnsplashImage(gender);
    }
  } else {
    // Fallback to Unsplash image
    imageUrl = await getUnsplashImage(gender);
  }
  
  // Add this profile to matches so it appears in chat
  const profile = {
    id: uuidv4(),
    name: firstName,
    age,
    location: faker.location.city(),
    bio,
    image: imageUrl,
    interests,
    lastActive: faker.date.recent(),
  };
  
  // Save to matches in localStorage
  saveMatchToLocalStorage(profile);
  
  return profile;
};

// Save a match to localStorage
const saveMatchToLocalStorage = (match: any) => {
  const existingMatches = JSON.parse(localStorage.getItem('matches') || '[]');
  if (!existingMatches.some((m: any) => m.id === match.id)) {
    existingMatches.push({
      id: match.id,
      name: match.name,
      age: match.age,
      bio: match.bio,
      image: match.image
    });
    localStorage.setItem('matches', JSON.stringify(existingMatches));
    console.log(`Added match ${match.name} to localStorage`);
    
    // Also ensure there's a conversation for this match
    const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    if (!conversations.some((c: any) => c.id === match.id)) {
      conversations.push({
        id: match.id,
        matchName: match.name,
        matchImage: match.image,
        lastActive: new Date().toISOString(),
        messages: []
      });
      localStorage.setItem('conversations', JSON.stringify(conversations));
      console.log(`Created conversation for ${match.name}`);
    }
  }
};

// Get an image from Unsplash
const getUnsplashImage = async (gender: string): Promise<string> => {
  try {
    const categories = ['person', 'portrait', 'fashion', 'model'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const genderParam = gender === 'female' ? 'woman' : 'man';
    const unsplashUrl = `https://source.unsplash.com/featured/800x1000/?${category},${genderParam}`;
    
    const response = await fetch(unsplashUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return 'https://source.unsplash.com/featured/800x1000/?person';
  }
};

// Generate a simulated bio
const generateSimulatedBio = (interests: string[]) => {
  const bioParts = [
    ["Adventurous soul", "Creative spirit", "Free thinker", "Outdoor enthusiast", "City explorer"],
    ["looking for", "searching for", "hoping to find", "on a quest for"],
    ["genuine connections", "meaningful conversations", "new experiences", "someone special", "fun and adventure"]
  ];
  
  const bioStart = bioParts[0][Math.floor(Math.random() * bioParts[0].length)];
  const bioMiddle = bioParts[1][Math.floor(Math.random() * bioParts[1].length)];
  const bioEnd = bioParts[2][Math.floor(Math.random() * bioParts[2].length)];
  
  const bioExtras = [
    `Love ${interests[0].toLowerCase()} and ${interests[1].toLowerCase()}.`,
    `Passionate about ${interests[0].toLowerCase()}.`,
    `When I'm not working, you'll find me ${faker.word.verb()}ing.`,
    `${faker.person.jobTitle()} by day, ${interests[0]} enthusiast by night.`,
    `Ask me about my ${faker.commerce.product().toLowerCase()}.`
  ];
  
  const randomExtra = bioExtras[Math.floor(Math.random() * bioExtras.length)];
  return `${bioStart} ${bioMiddle} ${bioEnd}. ${randomExtra}`;
};

// Generate an AI response for chat - uses Ollama if available
export const generateAIResponse = async (
  message: string, 
  model: string = 'llama3'
): Promise<{ text?: string; image?: string }> => {
  try {
    const isNsfwRequest = message.toLowerCase().includes('nsfw') || 
                        message.toLowerCase().includes('nude') || 
                        message.toLowerCase().includes('naked');
    
    // Check if this is an image request
    const isImageRequest = /what.*look.*like|show.*body|show.*picture|send.*photo|send.*pic|selfie/i.test(message.toLowerCase());
    
    // For image requests, try to generate an image
    if (isImageRequest) {
      try {
        // Try to check if SD is running
        const sdStatus = await checkStableDiffusionStatus();
        
        if (sdStatus.isRunning) {
          console.log("Using Stable Diffusion for image generation");
          // Construct a good prompt for the image
          let imagePrompt = `attractive person, ${message.replace(/what do you look like|can you show me|send me a pic of you|send a selfie|show me your body/gi, '')}`;
          
          if (imagePrompt.length < 20) {
            imagePrompt = "attractive person, portrait photo, high quality, photorealistic";
          }
          
          try {
            const imageUrl = await generateImageWithStableDiffusion(
              imagePrompt, 
              undefined, // Use default model
              isNsfwRequest // Allow NSFW if requested
            );
            
            // Generate a text response
            const textResponse = "Here's a picture of me. What do you think? 😊";
            
            return {
              text: textResponse,
              image: imageUrl
            };
          } catch (imageError) {
            console.error("Error generating image with SD:", imageError);
            // Fall back to Unsplash for image
            const gender = Math.random() > 0.5 ? 'female' : 'male';
            const unsplashImage = await getUnsplashImage(gender);
            
            return {
              text: "Here's a picture I took recently. What do you think? 😊",
              image: unsplashImage
            };
          }
        }
      } catch (sdCheckError) {
        console.error("Failed to check SD status:", sdCheckError);
      }
      
      // Fallback to text-only response if image generation fails
      return {
        text: "I'd love to show you a picture, but I'm having trouble with my camera right now. Maybe you can send me one of you instead? 😊",
      };
    }
    
    // Text-only response
    // Try to connect to Ollama
    try {
      const ollamaStatus = await checkOllamaStatus();
      
      if (ollamaStatus.isRunning && ollamaStatus.llmAvailable) {
        // Try to generate response with Ollama LLM
        try {
          const aiResponse = await generateChatResponse(message, model);
          return aiResponse;
        } catch (llmError) {
          console.error("Error generating response with LLM:", llmError);
          // Fall back to simulated response
        }
      }
    } catch (ollamaError) {
      console.error("Failed to check Ollama status:", ollamaError);
    }
    
    // Fallback response if Ollama is not available
    // Generate a flirtatious response based on the message
    let response = "";
    
    if (message.includes("hi") || message.includes("hello") || message.length < 10) {
      response = "Hey there! So happy to hear from you! How's your day going? 😊";
    } else if (message.includes("date") || message.includes("meet")) {
      response = "I'd love to meet up sometime! What did you have in mind? I know some great spots around town 🍷";
    } else if (message.includes("hobby") || message.includes("like to do")) {
      response = "I love hiking, photography, and trying new restaurants. What about you? Maybe we could do something together? 📸";
    } else if (isNsfwRequest) {
      response = "I appreciate your interest! I'm a bit more reserved until I get to know someone better. Why don't we chat more first? Tell me more about yourself! 😉";
    } else {
      // Generic flirty response for anything else
      response = "That's really interesting! I'm enjoying getting to know you. What else would you like to talk about? I'm pretty open-minded 😊";
    }
    
    return { text: response };
  } catch (error) {
    console.error("Error generating AI response:", error);
    return { 
      text: "Sorry, I couldn't connect to the AI service right now. Let's chat later!" 
    };
  }
};

// Generate multiple profiles
export const generateMultipleProfiles = async (count: number, sdModel?: string) => {
  const profiles = [];
  for (let i = 0; i < count; i++) {
    profiles.push(await generateAIProfile(sdModel));
  }
  return profiles;
};
