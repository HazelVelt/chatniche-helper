
import { v4 as uuidv4 } from 'uuid';
import { 
  checkOllamaStatus, 
  generateChatResponse 
} from './ollamaService';
import { checkSdkitStatus, generateImageWithSdkit } from './sdkitService';
import { faker } from '@faker-js/faker';

// Generate an AI profile
export const generateAIProfile = async (modelName?: string) => {
  try {
    // Check if we should use mocked services
    const settingsFromStorage = localStorage.getItem('useMockedServices');
    const useMocked = settingsFromStorage ? JSON.parse(settingsFromStorage) : false;
    
    // Only check real services if not using mocked mode
    let ollamaStatus = { isRunning: false, llmAvailable: false, llmModel: '' };
    let sdkitStatus = { isRunning: false, availableModels: [] };
    
    if (!useMocked) {
      try {
        // Check if Ollama and SDKit are available with shorter timeouts
        ollamaStatus = await checkOllamaStatus();
        sdkitStatus = await checkSdkitStatus();
        console.log("Ollama status:", ollamaStatus);
        console.log("SDKit status:", sdkitStatus);
      } catch (error) {
        console.error("Error checking AI services:", error);
      }
    }
    
    // Generate a random profile
    const gender = Math.random() > 0.5 ? 'female' : 'male';
    const firstName = faker.person.firstName(gender as any);
    const age = Math.floor(Math.random() * 15) + 23; // 23-38
    
    // Standard interests
    const standardInterests = [
      'Photography', 'Hiking', 'Reading', 'Cooking', 'Travel', 
      'Yoga', 'Movies', 'Art', 'Music', 'Dancing', 'Writing',
      'Fitness', 'Technology', 'Food', 'Fashion', 'Sports',
      'Coffee', 'Wine', 'Pets', 'Nature', 'Gaming'
    ];
    
    // NSFW interests - expanded list
    const nsfwInterests = [
      'Pole Dancing', 'Lingerie', 'Body Painting', 'Burlesque', 
      'Figure Drawing', 'Cosplay', 'Life Modeling', 'Fantasy Role-Play',
      'Erotic Literature', 'Nightlife', 'Adult Content Creation',
      'Fetish Fashion', 'Boudoir Photography', 'Risqué Comedy',
      'Adult Entertainment', 'Sensual Dance', 'Alternative Lifestyle',
      'Adult Films', 'Nude Beaches', 'BDSM', 'Kink Culture',
      'Tantra', 'Swinger Lifestyle', 'Exhibitionism'
    ];
    
    // Decide whether to include NSFW interests (20% chance)
    const includeNsfw = Math.random() < 0.2;
    let possibleInterests = [...standardInterests];
    
    if (includeNsfw) {
      // Add some NSFW interests to the mix
      possibleInterests = [...standardInterests, ...nsfwInterests];
    }
    
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
    if (!useMocked && ollamaStatus.isRunning && ollamaStatus.llmAvailable) {
      try {
        const bioPrompt = `Generate a short dating app bio for a ${age} year old ${gender} named ${firstName} who likes ${interests.join(', ')}. Keep it under 150 characters.`;
        const bioResponse = await generateChatResponse(bioPrompt, ollamaStatus.llmModel);
        bio = bioResponse.text || "";
      } catch (error) {
        console.error("Error generating bio with Ollama:", error);
        // Fall back to simulated bio
        bio = generateSimulatedBio(interests);
      }
    } else {
      // Fallback to simulated bio
      bio = generateSimulatedBio(interests);
    }
    
    // For image generation, try using SDKit first
    let imageUrl = "";
    
    // Check if SDKit is available for image generation and not in mocked mode
    if (!useMocked && sdkitStatus.isRunning) {
      try {
        const prompt = `${gender}, young adult, ${age} years old, attractive, portrait photo, highly detailed, photorealistic`;
        console.log("Generating profile image with SDKit, prompt:", prompt);
        const imageData = await generateImageWithSdkit(prompt);
        if (imageData) {
          imageUrl = imageData;
          console.log("Profile image generated successfully with SDKit");
        }
      } catch (error) {
        console.error('Error generating image with SDKit:', error);
        // Fall back to placeholder
        imageUrl = await getPlaceholderImage(gender);
      }
    } else {
      // Fallback to placeholder image
      imageUrl = await getPlaceholderImage(gender);
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
  } catch (error) {
    console.error("Error generating AI profile:", error);
    // Create a basic fallback profile if something goes wrong
    const fallbackProfile = {
      id: uuidv4(),
      name: faker.person.firstName(),
      age: 25,
      location: "Unknown",
      bio: "Hi there! I'm having some trouble with my profile right now, but I'd love to chat!",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
      interests: ["Chat"],
      lastActive: new Date(),
    };
    saveMatchToLocalStorage(fallbackProfile);
    return fallbackProfile;
  }
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

// Get a placeholder image
const getPlaceholderImage = async (gender: string): Promise<string> => {
  try {
    // Use placeholder images since Unsplash isn't working
    const femaleImages = [
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg",
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg"
    ];
    
    const maleImages = [
      "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg",
      "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
      "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg"
    ];
    
    const imagesArray = gender === 'female' ? femaleImages : maleImages;
    const randomImage = imagesArray[Math.floor(Math.random() * imagesArray.length)];
    
    const response = await fetch(randomImage);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching placeholder image:', error);
    return 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg';
  }
};

// Generate a simulated bio
const generateSimulatedBio = (interests: string[]) => {
  const bioParts = [
    ["Adventurous soul", "Creative spirit", "Free thinker", "Outdoor enthusiast", "City explorer", "Wild spirit", "Passionate lover"],
    ["looking for", "searching for", "hoping to find", "on a quest for", "craving", "desiring"],
    ["genuine connections", "meaningful conversations", "new experiences", "someone special", "fun and adventure", "no-strings fun", "wild nights"]
  ];
  
  const bioStart = bioParts[0][Math.floor(Math.random() * bioParts[0].length)];
  const bioMiddle = bioParts[1][Math.floor(Math.random() * bioParts[1].length)];
  const bioEnd = bioParts[2][Math.floor(Math.random() * bioParts[2].length)];
  
  // Added more provocative extras for NSFW profiles
  const bioExtras = [
    `Love ${interests[0].toLowerCase()} and ${interests[1].toLowerCase()}.`,
    `Passionate about ${interests[0].toLowerCase()}.`,
    `When I'm not working, you'll find me ${faker.word.verb()}ing.`,
    `${faker.person.jobTitle()} by day, ${interests[0]} enthusiast by night.`,
    `Ask me about my ${faker.commerce.product().toLowerCase()}.`,
    `Don't be shy, I don't bite... unless you want me to.`,
    `Life's too short for vanilla experiences.`,
    `Open-minded and adventurous in all aspects of life.`
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
    console.log(`Generating AI response for message: ${message}`);
    
    // Check if we should use mocked services
    const settingsFromStorage = localStorage.getItem('useMockedServices');
    const forceMockedImageStorage = localStorage.getItem('forceMockedImage');
    const useMocked = settingsFromStorage ? JSON.parse(settingsFromStorage) : false;
    const forceMockedImage = forceMockedImageStorage ? JSON.parse(forceMockedImageStorage) : false;
    
    const isNsfwRequest = message.toLowerCase().includes('nsfw') || 
                          message.toLowerCase().includes('nude') || 
                          message.toLowerCase().includes('naked');
    
    // Check if this is an image request
    const isImageRequest = /what.*look.*like|show.*body|show.*picture|send.*photo|send.*pic|selfie/i.test(message.toLowerCase());
    
    // If this is an image request, handle it separately to prioritize image generation
    if (isImageRequest) {
      console.log("Detected image request:", message);
      
      // If not using mocked services or not forcing mocked images, try real SDKit
      if (!useMocked && !forceMockedImage) {
        try {
          // Check if SDKit is running
          const sdkitStatus = await checkSdkitStatus();
          
          if (sdkitStatus.isRunning) {
            console.log("Using SDKit for image generation");
            // Construct a good prompt for the image
            let imagePrompt = `attractive person, portrait photo, ${message.replace(/what do you look like|can you show me|send me a pic of you|send a selfie|show me your body/gi, '')}`;
            
            if (imagePrompt.length < 20) {
              imagePrompt = "attractive person, portrait photo, high quality, photorealistic";
            }
            
            try {
              const imageUrl = await generateImageWithSdkit(
                imagePrompt, 
                undefined, // Use default model
                isNsfwRequest // Allow NSFW if requested
              );
              
              console.log("Successfully generated image with SDKit");
              
              // Generate a text response
              const textResponse = "Here's a picture of me. What do you think? 😊";
              
              return {
                text: textResponse,
                image: imageUrl
              };
            } catch (imageError) {
              console.error("Error generating image with SDKit:", imageError);
              // Fall back to placeholder
              const gender = Math.random() > 0.5 ? 'female' : 'male';
              const placeholderImage = await getPlaceholderImage(gender);
              
              return {
                text: "Here's a picture I took recently. What do you think? 😊",
                image: placeholderImage
              };
            }
          } else {
            console.log("SDKit not available, using placeholder");
            const gender = Math.random() > 0.5 ? 'female' : 'male';
            const placeholderImage = await getPlaceholderImage(gender);
            
            return {
              text: "Here's a picture I took recently. What do you think? 😊",
              image: placeholderImage
            };
          }
        } catch (sdCheckError) {
          console.error("Failed to check SDKit status:", sdCheckError);
          // Fall back to placeholder
          const gender = Math.random() > 0.5 ? 'female' : 'male';
          const placeholderImage = await getPlaceholderImage(gender);
          
          return {
            text: "Here's a picture I took recently. What do you think? 😊",
            image: placeholderImage
          };
        }
      } else {
        // In mocked mode or forced mocked image, use placeholder
        console.log("Using placeholder image for image request");
        const gender = Math.random() > 0.5 ? 'female' : 'male';
        const placeholderImage = await getPlaceholderImage(gender);
        
        return {
          text: "Here's a picture I took recently. What do you think? 😊",
          image: placeholderImage
        };
      }
    }
    
    // Text-only response handling
    if (!useMocked) {
      // Try to connect to Ollama for real LLM response
      try {
        const ollamaStatus = await checkOllamaStatus();
        
        if (ollamaStatus.isRunning && ollamaStatus.llmAvailable) {
          console.log("Using Ollama LLM for text response");
          // Generate response with Ollama LLM
          try {
            const aiResponse = await generateChatResponse(message, model);
            console.log("Successfully generated response with Ollama");
            return aiResponse;
          } catch (llmError) {
            console.error("Error generating response with LLM:", llmError);
            // Fall back to simulated response
          }
        }
      } catch (ollamaError) {
        console.error("Failed to check Ollama status:", ollamaError);
      }
    }
    
    console.log("Using simulated response");
    // Generate a simulated flirtatious response
    let response = "";
    
    if (message.includes("hi") || message.includes("hello") || message.length < 10) {
      response = "Hey there! So happy to hear from you! How's your day going? 😊";
    } else if (message.includes("date") || message.includes("meet")) {
      response = "I'd love to meet up sometime! What did you have in mind? I know some great spots around town 🍷";
    } else if (message.includes("hobby") || message.includes("like to do")) {
      response = "I love hiking, photography, and trying new restaurants. What about you? Maybe we could do something together? 📸";
    } else if (isNsfwRequest) {
      // More varied NSFW responses
      const nsfwResponses = [
        "I appreciate your interest! I'm a bit more reserved until I get to know someone better. Why don't we chat more first? Tell me more about yourself! 😉",
        "That's a bit forward, but I like your confidence. Let's get to know each other better first though? 😏",
        "I'm all for adventure, but maybe we should start with something a bit more... casual? What else are you into? 🔥",
        "I'm flattered by your interest! I prefer to take things slow at first, but I'm definitely open-minded once I feel comfortable. What else would you like to know about me? 😘"
      ];
      response = nsfwResponses[Math.floor(Math.random() * nsfwResponses.length)];
    } else {
      // Generic flirty response for anything else
      const genericResponses = [
        "That's really interesting! I'm enjoying getting to know you. What else would you like to talk about? I'm pretty open-minded 😊",
        "I love your vibe! Tell me more about yourself. What do you do for fun on weekends? 😊",
        "You seem like someone I'd really get along with. What's something you're passionate about? 💕",
        "You're fun to chat with! I'm curious - what made you swipe right on me? 😏"
      ];
      response = genericResponses[Math.floor(Math.random() * genericResponses.length)];
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
