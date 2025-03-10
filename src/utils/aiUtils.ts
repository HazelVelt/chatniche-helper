
// This is a simulated version that checks for Ollama first, then falls back to faker if needed
import { faker } from '@faker-js/faker';
import { checkOllamaStatus, generateChatResponse, generateProfileImage } from './ollamaService';

// Generate an AI profile
export const generateAIProfile = async (modelName?: string) => {
  // Check if Ollama is available first
  const status = await checkOllamaStatus();
  
  // If Ollama is running with required models, use it
  // Otherwise fall back to simulated data
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
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
  
  // Generate a bio using simulated LLM
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
  
  const bio = `${bioStart} ${bioMiddle} ${bioEnd}. ${randomExtra}`;
  
  // Check if Stable Diffusion is available for image generation
  let imageUrl = '';
  if (status.isRunning && status.stableDiffusionAvailable) {
    try {
      // Use the specified model or fall back to the first available SD model
      const sdModel = modelName || status.availableModels.stableDiffusion[0] || 'sd';
      const imageData = await generateProfileImage(`person, ${gender}, portrait, headshot`, sdModel);
      if (imageData) {
        imageUrl = `data:image/jpeg;base64,${imageData}`;
      }
    } catch (error) {
      console.error('Error generating image with Stable Diffusion:', error);
    }
  }
  
  // If image generation failed, fall back to placeholder
  if (!imageUrl) {
    const imageIndex = Math.floor(Math.random() * 10) + 1;
    imageUrl = `https://source.unsplash.com/random/600x800?portrait,${gender},${imageIndex}`;
  }
  
  return {
    id: faker.string.uuid(),
    name: firstName,
    age,
    location: faker.location.city(),
    bio,
    imageUrl,
    interests,
    lastActive: faker.date.recent(),
  };
};

// Generate an AI response for chat - uses Ollama if available
export const generateAIResponse = async (message: string, modelName?: string) => {
  // Check if Ollama is available
  try {
    const status = await checkOllamaStatus();
    
    if (status.isRunning && status.llmAvailable) {
      // Use specified model or fall back to the first available LLM model
      const model = modelName || status.llmModel || status.availableModels.llm[0];
      return await generateChatResponse(message, model);
    }
  } catch (error) {
    console.error('Error checking Ollama status:', error);
  }
  
  // Fallback to simulated responses if Ollama is not available
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
    return questions[Math.floor(Math.random() * questions.length)];
  }
  
  return responses[Math.floor(Math.random() * responses.length)];
};

// Generate multiple profiles
export const generateMultipleProfiles = async (count: number, sdModel?: string) => {
  const profiles = [];
  for (let i = 0; i < count; i++) {
    profiles.push(await generateAIProfile(sdModel));
  }
  return profiles;
};
