import React, { useState, useEffect } from 'react';
import { FileText, MessageCircle, Sparkles, History } from 'lucide-react';
import { PDFUpload } from './components/PDFUpload';
import { ChatInterface } from './components/ChatInterface';
import { ChatHistory } from './components/ChatHistory';
import { PDFDocument, Message, ChatState, ChatSession } from './types';
import { openRouterService } from './services/openRouterService';
import { createChatSession, saveChatHistory, loadChatHistory } from './utils/chatUtils';

function App() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    currentDocument: null,
  });
  
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Load chat history on component mount
  useEffect(() => {
    const savedHistory = loadChatHistory();
    setChatHistory(savedHistory);
  }, []);

  // Save current session when messages change (but not when loading)
  useEffect(() => {
    if (chatState.messages.length > 0 && !chatState.isLoading && chatState.currentDocument) {
      const session = createChatSession(chatState.messages, chatState.currentDocument.name);
      
      setChatHistory(prev => {
        const existingIndex = prev.findIndex(s => s.id === currentSessionId);
        let newHistory;
        
        if (existingIndex >= 0) {
          // Update existing session
          newHistory = [...prev];
          newHistory[existingIndex] = { ...session, id: currentSessionId! };
        } else {
          // Create new session
          newHistory = [session, ...prev];
          setCurrentSessionId(session.id);
        }
        
        saveChatHistory(newHistory);
        return newHistory;
      });
    }
  }, [chatState.messages, chatState.currentDocument, currentSessionId]);

  const handleDocumentUploaded = (document: PDFDocument) => {
    setChatState(prev => ({
      ...prev,
      currentDocument: document,
      messages: [],
    }));
    setCurrentSessionId(null);
  };

  const handleClearDocument = () => {
    setChatState(prev => ({
      ...prev,
      currentDocument: null,
      messages: [],
    }));
    setCurrentSessionId(null);
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!chatState.currentDocument) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      const aiResponse = await openRouterService.generateResponse(
        messageContent,
        chatState.currentDocument.content
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false,
      }));
    }
  };

  const handleLoadSession = (session: ChatSession) => {
    setChatState(prev => ({
      ...prev,
      messages: session.messages,
      // Keep current document if available, otherwise clear
      currentDocument: prev.currentDocument?.name === session.documentName ? prev.currentDocument : null,
    }));
    setCurrentSessionId(session.id);
    setShowHistory(false);
  };

  const handleNewChat = () => {
    setChatState(prev => ({
      ...prev,
      messages: [],
    }));
    setCurrentSessionId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 via-teal-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Buddi👻
            </h1>
            <Sparkles className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Upload your PDF documents and have intelligent conversations about their content. 
            Powered by advanced AI to help you extract insights and find information quickly.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-orange-800">Document Upload</h2>
              </div>
              <PDFUpload
                onDocumentUploaded={handleDocumentUploaded}
                currentDocument={chatState.currentDocument}
                onClearDocument={handleClearDocument}
              />
            </div>

            {/* Enhanced Stats */}
            <div className="bg-gradient-to-br from-emerald-100 to-teal-100 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-emerald-800">Chat Statistics</h3>
                </div>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-2 rounded-xl transition-all duration-200 ${
                    showHistory ? 'bg-emerald-200 text-emerald-800 shadow-inner' : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                  title="Toggle Chat History"
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700">Current Messages</span>
                  <span className="font-semibold text-emerald-800">{chatState.messages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700">Document</span>
                  <span className="font-semibold text-emerald-800">
                    {chatState.currentDocument ? '✓ Loaded' : '○ None'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700">Status</span>
                  <span className={`font-semibold ${chatState.isLoading ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {chatState.isLoading ? 'Processing...' : 'Ready'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-700">Total Sessions</span>
                  <span className="font-semibold text-emerald-800">{chatHistory.length}</span>
                </div>
              </div>

              {chatState.messages.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="w-full px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  Start New Chat
                </button>
              )}
            </div>

            {/* Chat History */}
            {showHistory && (
              <div className="bg-gradient-to-br from-violet-100 to-purple-100 backdrop-blur-sm rounded-2xl p-6 border border-violet-200 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-violet-600" />
                  <h3 className="text-lg font-semibold text-violet-800">Chat History</h3>
                </div>
                <ChatHistory
                  sessions={chatHistory}
                  onLoadSession={handleLoadSession}
                  currentSessionId={currentSessionId}
                />
              </div>
            )}
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="h-[600px]">
              <ChatInterface
                messages={chatState.messages}
                isLoading={chatState.isLoading}
                onSendMessage={handleSendMessage}
                disabled={!chatState.currentDocument}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-8 border-t border-purple-200">
          <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-2xl shadow-lg">
            <p className="font-bold text-lg tracking-wide">
              Vishwas Ramasani's Intellectual Smart Work 🤍
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;