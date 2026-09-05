import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ChatAssistant = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ASSISTANT', content: 'Namaste! I am the RuralNex AI. How can I help you analyze your business feasibility today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add User Message
    const newMessages = [...messages, { role: 'USER', content: input }];
    setMessages(newMessages);
    setInput('');
    
    // Mock AI Response with tool execution note
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'ASSISTANT', 
          content: 'Based on the deterministic backend calculation, your maximum loan eligibility under the Micro Finance Scheme is ₹90,000. Is there any specific part of the SWOT analysis you\'d like me to explain further?' 
        }
      ]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-xl border w-80 h-96 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <h3 className="font-semibold">RuralNex AI Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">&times;</button>
          </div>
          
          {/* Chat Window */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50 flex flex-col space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-2 text-sm ${
                  msg.role === 'USER' ? 'bg-primary text-primary-foreground' : 'bg-white border text-gray-800'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          
          {/* Input Area */}
          <div className="p-3 bg-white border-t flex space-x-2">
            <input 
              type="text" 
              className="flex-1 border rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary"
              placeholder="Ask about finances or SWOT..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition flex items-center justify-center"
        >
          💬 <span className="ml-2 font-medium">Ask AI</span>
        </button>
      )}
    </div>
  );
};

export default ChatAssistant;
