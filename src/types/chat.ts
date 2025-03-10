
export interface Message {
  id: string;
  sender: 'user' | 'match';
  text: string;
  timestamp: Date;
  read?: boolean;
}

export interface Conversation {
  id: string;
  matchName: string;
  matchImage: string;
  lastActive: Date;
  messages: Message[];
}

export interface Match {
  id: string;
  name: string;
  image: string;
  age: number;
  bio: string;
}

export interface ModelSettings {
  llmModel: string;
  stableDiffusionModel: string;
}
