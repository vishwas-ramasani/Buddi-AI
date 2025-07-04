import { Message, ChatSession } from '../types';

export const generateTopicFromMessages = (messages: Message[]): string => {
  const firstUserMessage = messages.find(m => m.type === 'user');
  if (!firstUserMessage) return 'New Chat';
  
  const content = firstUserMessage.content.toLowerCase();
  
  // Extract topic based on common patterns
  if (content.includes('what') || content.includes('explain')) {
    const words = firstUserMessage.content.split(' ').slice(0, 5);
    return words.join(' ') + (firstUserMessage.content.split(' ').length > 5 ? '...' : '');
  }
  
  if (content.includes('how')) {
    return 'How-to: ' + firstUserMessage.content.substring(0, 30) + '...';
  }
  
  if (content.includes('summary') || content.includes('summarize')) {
    return 'Summary Request';
  }
  
  if (content.includes('find') || content.includes('search')) {
    return 'Search: ' + firstUserMessage.content.substring(0, 30) + '...';
  }
  
  // Default: use first few words
  const words = firstUserMessage.content.split(' ').slice(0, 4);
  return words.join(' ') + (firstUserMessage.content.split(' ').length > 4 ? '...' : '');
};

export const createChatSession = (
  messages: Message[], 
  documentName?: string
): ChatSession => {
  const firstMessage = messages[0];
  const date = firstMessage ? firstMessage.timestamp.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  
  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date,
    topic: generateTopicFromMessages(messages),
    messages: [...messages],
    documentName,
  };
};

export const saveChatHistory = (sessions: ChatSession[]) => {
  try {
    localStorage.setItem('pdf-qa-chat-history', JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

export const loadChatHistory = (): ChatSession[] => {
  try {
    const saved = localStorage.getItem('pdf-qa-chat-history');
    if (saved) {
      const sessions = JSON.parse(saved);
      // Convert timestamp strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
  }
  return [];
};