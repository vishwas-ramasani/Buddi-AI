export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  topic?: string;
}

export interface PDFDocument {
  name: string;
  content: string;
  uploadedAt: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentDocument: PDFDocument | null;
}

export interface ChatSession {
  id: string;
  date: string;
  topic: string;
  messages: Message[];
  documentName?: string;
}

export interface ChatHistory {
  sessions: ChatSession[];
}