// This is a simulated version that checks for Ollama first, then falls back to faker if needed
import { faker } from '@faker-js/faker';
import { checkOllamaStatus, generateChatResponse, generateImage, checkStableDiffusionStatus } from './ollamaService';

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
      const imageData = await generateImage(prompt);
      if (imageData) {
        // Check if imageData is already a data URL
        if (imageData.startsWith('data:')) {
          imageUrl = imageData;
        } else {
          imageUrl = `data:image/jpeg;base64,${imageData}`;
        }
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
    id: faker.string.uuid(),
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
export const generateAIResponse = async (message: string, modelName?: string): Promise<{text: string, image?: string}> => {
  // Check if this is an image request
  const isImageRequest = /what.*look.*like|show.*body|show.*picture|send.*photo|send.*pic|selfie/i.test(message.toLowerCase());
  
  // Check if Ollama is available
  try {
    const status = await checkOllamaStatus();
    console.log("Generating AI response. Ollama status:", status);
    
    if (status.isRunning && status.llmAvailable) {
      // Use specified model or fall back to the first available LLM model
      const model = modelName || status.llmModel || status.availableModels.llm[0];
      console.log("Using LLM model:", model);
      return await generateChatResponse(message, model);
    } else {
      console.log("Ollama not available, falling back to simulated responses");
    }
  } catch (error) {
    console.error('Error checking Ollama status:', error);
  }
  
  // Simulate response delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // If it's an image request, generate both text and image
  if (isImageRequest) {
    try {
      const imageUrl = await getUnsplashImage(Math.random() > 0.5 ? 'female' : 'male');
      
      return {
        text: "Here's a photo of me! What do you think? 😊",
        image: imageUrl
      };
    } catch (error) {
      console.error('Error fetching image:', error);
      return {
        text: "I'd love to share a photo, but I'm having trouble with the image right now. Can we chat more first? 😊"
      };
    }
  }
  
  // Regular simulated response
  const responses = [
    "That's interesting! Tell me more about that.",
    "I feel the same way! What else do you enjoy?",
    "Thanks for sharing. I've been thinking about that too.",
    "That's cool! I'd love to try that sometime.",
    "Great question! I've been wondering about that myself.",
    "I appreciate your perspective on that.",
    "I hadn't thought about it that way before.",
    "You make a good point! What else are you curious about?",
    "I agree completely. What are your other thoughts on this?",
    "That sounds amazing! I'd love to hear more."
  ];
  
  // Add occasional questions to keep conversation flowing
  const questions = [
    "What do you like to do on weekends?",
    "Have you seen any good movies lately?",
    "What's your favorite place you've ever traveled to?",
    "Do you have any fun plans coming up?",
    "What's something you're looking forward to?",
    "What's your ideal perfect day like?",
    "If you could have dinner with anyone, who would it be?",
    "What's something you've always wanted to learn?"
  ];
  
  // 30% chance of asking a question
  if (Math.random() < 0.3) {
    return { text: questions[Math.floor(Math.random() * questions.length)] };
  }
  
  return { text: responses[Math.floor(Math.random() * responses.length)] };
};

// Generate multiple profiles
export const generateMultipleProfiles = async (count: number, sdModel?: string) => {
  const profiles = [];
  for (let i = 0; i < count; i++) {
    profiles.push(await generateAIProfile(sdModel));
  }
  return profiles;
};
