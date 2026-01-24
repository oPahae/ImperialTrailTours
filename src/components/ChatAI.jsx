import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { footerInfos, AIQuestions } from '@/utils/constants';

const AIChat = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your ImperialTrailTours travel assistant. How can I help you discover Morocco today?'
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [siteData, setSiteData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const [toursRes, blogsRes, contactsRes] = await Promise.all([
          fetch('/api/tours/get?limit=100'),
          fetch('/api/blogs/get'),
          fetch('/api/contacts/getFaqs'),
        ]);
        const toursData = await toursRes.json();
        const blogsData = await blogsRes.json();
        const contactsData = await contactsRes.json();

        setSiteData({
          tours: toursData.tours,
          blogs: blogsData.blogs,
          company: {
            name: footerInfos.entreprise,
            phone: footerInfos.phone,
            email: footerInfos.tel,
            location: footerInfos.location,
          }
        });

        if (contactsData.faqs && contactsData.faqs.length > 0) {
          setSuggestions(contactsData.faqs.map(contact => contact.question.slice(0, 16)).slice(0, 6));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadSiteData();
  }, []);

  const handleSuggestionClick = async (suggestion) => {
    setInputValue(suggestion);
    if (!suggestion.trim() || isLoading) return;
    const userMessage = suggestion.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    const aiResponse = await getGeminiResponse(userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsLoading(false);
  };

  const getGeminiResponse = async (userMessage) => {
    if (!siteData) {
      return "I'm still loading our travel information. Please try again in a moment.";
    }
    const contextPrompt = `You are a professional travel assistant for ImperialTrailTours, a Morocco travel agency based in Casablanca.
    Company Information:
    - Name: ${siteData.company.name}
    - Location: ${siteData.company.location}
    - Phone: ${siteData.company.phone}
    - Email: ${siteData.company.email}
    Available Tours (${siteData.tours.length} tours):
    ${siteData.tours.slice(0, 20).map(tour =>
      `- ${tour.title} (${tour.days} days, from ${tour.price} $, Type: ${tour.type}, Places: ${tour.places.join(', ')})`
    ).join('\n')}
    Recent Blog Posts:
    ${siteData.blogs.slice(0, 5).map(blog =>
      `- ${blog.title} (Published: ${blog.date})`
    ).join('\n')}
    Instructions:
    - Answer ONLY in English
    - Be helpful, friendly, and professional
    - Provide specific information about tours, prices, and destinations when asked
    - Encourage users to contact us for bookings
    - If asked about tours, mention specific options with prices and durations
    - Keep responses concise and focused`;

    try {
      const res = await fetch(`https://pahae-utils.vercel.app/api/responseAI?data=${contextPrompt}&prompt=User Question: ${userMessage}`);
      const data = await res.json();
      return data.response;
    } catch (err) {
      console.error('Error:', err);
      return `I'm experiencing technical difficulties. Please contact us at ${footerInfos.email} or call ${footerInfos.tel} for immediate assistance.`;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    const aiResponse = await getGeminiResponse(userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={(e) => { setIsOpen(!isOpen); e.stopPropagation() }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${isOpen ? 'scale-0' : 'scale-100'}`}
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        style={{ transformOrigin: 'bottom right' }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">ImperialTrailTours Assistant</h3>
                <p className="text-white/80 text-xs">Your Morocco Travel Guide</p>
              </div>
            </div>
            <button
              onClick={e => { setIsOpen(false); e.stopPropagation() }}
              className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${message.role === 'user'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100'}`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-gray-100">
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {suggestions.length > 0 && (
            <div className="p-2 bg-gray-50 border-t border-gray-100">
              <div className="flex overflow-x-auto gap-2 px-2 py-1">
                {AIQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(question)}
                    className="whitespace-nowrap text-white bg-gradient-to-t from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold duration-200 hover:bg-gray-50 transition-colors"
                  >
                    {question}
                  </button>
                ))}
                <span className='text-amber-400'>|</span>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="whitespace-nowrap text-white bg-gradient-to-t from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold duration-200 hover:bg-gray-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Zone d'input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 items-end">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about tours, destinations..."
                className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent max-h-24 min-h-[42px]"
                rows="1"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl px-4 py-2.5 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;