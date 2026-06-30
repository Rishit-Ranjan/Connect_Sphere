import React, { useState, useEffect, useRef } from 'react';
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
      return 'Hello How are you? I am ConnectSphere\'s AI assistant. You can ask me about creating posts, notices, direct messages, or what ConnectSphere is.';
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
    <div className="chatbot-container">
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <h3>Chat with us!</h3>
          <button onClick={toggleChat} className="close-btn">
            &times;
          </button>
        </div>
        <div className="chatbot-body" ref={chatBodyRef}>
          {messages.map((message) => (
            <div key={message.id} className={`chat-message ${message.sender}`}>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <form className="chatbot-footer" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
      <button className="chatbot-toggle-button" onClick={toggleChat}>
        💬
      </button>
    </div>
  );
};

export default Chatbot;