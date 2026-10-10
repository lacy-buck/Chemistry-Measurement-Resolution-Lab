import React, { useState } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { getTutorAnswer } from '../data/tutorKnowledge';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext?: any;
}

interface Message {
  role: 'user' | 'tutor';
  text: string;
}

const QUICK_QUESTIONS = [
  'Why do I need to write 4.00 cm instead of 4 cm if it lands right on the line?',
  'How do I determine which decimal place to estimate to?',
  'Why is a graduated cylinder more accurate than a beaker?',
  'What is parallax error and how do I avoid it when reading a meniscus?',
];

export const AITutorModal: React.FC<AITutorModalProps> = ({ isOpen, onClose, currentContext }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'tutor',
      text: "Hello! I'm your Chemistry Lab Tutor. Ask me any questions about scale resolution, how to estimate the last digit, significant figures in measurements, or reading liquid glassware!",
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText: string) => {
    const query = questionText.trim();
    if (!query || isLoading) return;

    // Append user query
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setInputQuery('');
    setIsLoading(true);

    // Provide immediate, realistic pedagogical response in-browser
    setTimeout(() => {
      const reply = getTutorAnswer(query, currentContext);
      setMessages((prev) => [...prev, { role: 'tutor', text: reply }]);
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Tutor Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Chemistry Lab Tutor
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                  Lab Mentor
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Ask any question about scale graduations, resolution, and meniscus reading
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'tutor' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-3.5 whitespace-pre-line text-xs ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs rounded-tr-none font-medium'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                {m.text}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 shrink-0 mt-0.5 shadow-2xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-700 p-2 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Lab Tutor is explaining the chemistry principle...</span>
            </div>
          )}
        </div>

        {/* Quick Suggested Chips */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex flex-wrap gap-1.5">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition disabled:opacity-50 text-left truncate max-w-[280px] shadow-2xs cursor-pointer"
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question about scale resolution or measurements..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:opacity-50 shadow-2xs"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
