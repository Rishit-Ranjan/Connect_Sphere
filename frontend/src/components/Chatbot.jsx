import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send } from 'lucide-react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today?', sender: 'bot' },
  ]);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const getBotResponse = (userInput) => {
    const lowerCaseInput = userInput.toLowerCase().trim();

    if (lowerCaseInput.includes('hi')|| lowerCaseInput.includes('hello')|| lowerCaseInput.includes('hy')) {
      return 'Hello How are you? I am CORA ConnectSphere Resource Assistant. You can ask me about creating posts, notices, direct messages, or what ConnectSphere is.';
    }

    if (lowerCaseInput.includes('what is connectsphere')) {
      return 'ConnectSphere is a modern social collaboration platform designed to connect people and facilitate communication through posts, chat rooms, and direct messaging.';
    }

    if (lowerCaseInput.includes('create a post') || lowerCaseInput.includes('make a post')) {
      return 'You can create a new post from the "Feed" tab. Just type your message in the "What\'s on your mind?" box and click "Post".';
    }

    if (lowerCaseInput.includes('notices')) {
      return 'You can view all official notices on the "Notices" tab. Urgent notices are also highlighted on the right sidebar.';
    }

    if (lowerCaseInput.includes('direct message') || lowerCaseInput.includes('dm')) {
      return 'To send a direct message, go to the profile of the user you want to message and click the message icon, or find them in the right sidebar and click "Message".';
    }

    if (lowerCaseInput.includes('rooms')) {
      return 'Rooms are public chat spaces where you can talk with multiple users at once. You can find and join rooms from the "Rooms" tab.';
    }

    return "I'm sorry, I don't understand that. You can ask me about creating posts, notices, direct messages, or what ConnectSphere is.";
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      const userMessage = messages[messages.length - 1].text;
      setTimeout(() => {
        const botResponseText = getBotResponse(userMessage);
        const botMessage = { id: Date.now(), text: botResponseText, sender: 'bot' };
        setMessages((prev) => [...prev, botMessage]);
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);


  return (
    <div className="chatbot-container font-sans select-none">
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="flex items-center gap-3 px-4 py-3.5 bg-white border-b border-slate-100">
          <span className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
            <Bot size={18} className="text-white" />
          </span>
          <span className="min-w-0">
            <span className="block font-display font-bold text-slate-900 text-sm leading-none tracking-tight">
              CORA
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Resource Assistant &bull; Online
            </span>
          </span>
          <button
            onClick={toggleChat}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            title="Close chat"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50" ref={chatBodyRef}>
          {messages.map((message) => (
            message.sender === 'bot' ? (
              <div key={message.id} className="chat-message-bot">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} />
                </span>
                <p>{message.text}</p>
              </div>
            ) : (
              <div key={message.id} className="chat-message-user">
                <p>{message.text}</p>
              </div>
            )
          ))}
        </div>
        <form className="p-3 bg-white border-t border-slate-100 flex gap-2" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Ask CORA anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2 bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-indigo-300 placeholder-slate-400 transition-all min-w-0"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer shadow-sm shrink-0"
            title="Send message"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
      <button className="chatbot-toggle-button" onClick={toggleChat} title={isOpen ? 'Close assistant' : 'Open assistant'}>
        {isOpen ? <X size={22} /> : <Bot size={22} />}
        {!isOpen && <span className="chatbot-toggle-dot" />}
      </button>
    </div>
  );
};

export default Chatbot;
