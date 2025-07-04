import React, { useState, useMemo } from 'react';
import { Calendar, MessageSquare, ChevronDown, ChevronRight, Clock, FileText } from 'lucide-react';
import { ChatSession, Message } from '../types';

interface ChatHistoryProps {
  sessions: ChatSession[];
  onLoadSession: (session: ChatSession) => void;
  currentSessionId?: string;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  sessions,
  onLoadSession,
  currentSessionId,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped: { [key: string]: ChatSession[] } = {};
    sessions.forEach(session => {
      if (!grouped[session.date]) {
        grouped[session.date] = [];
      }
      grouped[session.date].push(session);
    });
    return grouped;
  }, [sessions]);

  // Get unique dates for filter
  const availableDates = useMemo(() => {
    return Object.keys(sessionsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, [sessionsByDate]);

  // Filter sessions based on selected date
  const filteredSessions = useMemo(() => {
    if (!selectedDate) return sessions;
    return sessionsByDate[selectedDate] || [];
  }, [selectedDate, sessionsByDate]);

  const toggleSessionExpansion = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionPreview = (messages: Message[]) => {
    const firstUserMessage = messages.find(m => m.type === 'user');
    return firstUserMessage ? firstUserMessage.content.substring(0, 50) + '...' : 'No messages';
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-6">
        <MessageSquare className="w-8 h-8 text-violet-400 mx-auto mb-2" />
        <p className="text-violet-600 text-sm">No chat history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Date Filter */}
      <div>
        <label className="block text-sm font-medium text-violet-800 mb-2">
          Filter by Date
        </label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-gradient-to-r from-violet-50 to-purple-50 text-violet-800 shadow-inner"
        >
          <option value="">All Dates</option>
          {availableDates.map(date => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Sessions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {selectedDate ? (
          // Show sessions for selected date
          <div>
            <h4 className="text-sm font-medium text-violet-800 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(selectedDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </h4>
            {filteredSessions.map(session => (
              <div key={session.id} className="border border-violet-200 rounded-xl shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 backdrop-blur-sm">
                <div
                  className={`p-3 cursor-pointer hover:bg-violet-100 transition-all duration-200 rounded-xl ${
                    currentSessionId === session.id ? 'bg-violet-100 border-violet-400' : ''
                  }`}
                  onClick={() => toggleSessionExpansion(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      {expandedSessions.has(session.id) ? (
                        <ChevronDown className="w-4 h-4 text-violet-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-violet-500" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-violet-800 text-sm">{session.topic}</p>
                        <p className="text-xs text-violet-600">{getSessionPreview(session.messages)}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-violet-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(session.messages[0]?.timestamp)}
                          </span>
                          {session.documentName && (
                            <span className="text-xs text-violet-500 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {session.documentName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadSession(session);
                      }}
                      className="px-2 py-1 text-xs bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                      Load
                    </button>
                  </div>
                </div>
                
                {expandedSessions.has(session.id) && (
                  <div className="border-t border-violet-200 p-3 bg-gradient-to-r from-violet-50 to-purple-50">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {session.messages.slice(0, 4).map(message => (
                        <div key={message.id} className="text-xs">
                          <span className={`font-medium ${
                            message.type === 'user' ? 'text-violet-700' : 'text-purple-700'
                          }`}>
                            {message.type === 'user' ? 'You' : 'AI'}:
                          </span>
                          <span className="text-violet-600 ml-2">
                            {message.content.substring(0, 80)}
                            {message.content.length > 80 ? '...' : ''}
                          </span>
                        </div>
                      ))}
                      {session.messages.length > 4 && (
                        <p className="text-xs text-violet-500 italic">
                          +{session.messages.length - 4} more messages
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Show all sessions grouped by date
          Object.entries(sessionsByDate)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, dateSessions]) => (
              <div key={date}>
                <h4 className="text-sm font-medium text-violet-800 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h4>
                <div className="space-y-1 ml-6">
                  {dateSessions.map(session => (
                    <div
                      key={session.id}
                      className={`p-2 rounded-xl cursor-pointer hover:bg-violet-100 transition-all duration-200 border shadow-lg bg-gradient-to-br from-violet-50 to-purple-50 backdrop-blur-sm ${
                        currentSessionId === session.id ? 'bg-violet-100 border-violet-400' : 'border-violet-200'
                      }`}
                      onClick={() => onLoadSession(session)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-violet-800 text-sm">{session.topic}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-violet-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(session.messages[0]?.timestamp)}
                            </span>
                            <span className="text-xs text-violet-500">
                              {session.messages.length} messages
                            </span>
                            {session.documentName && (
                              <span className="text-xs text-violet-500 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {session.documentName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};