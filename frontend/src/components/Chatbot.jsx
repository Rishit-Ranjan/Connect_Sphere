import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chatbot-header">
          <h3>Chat with us!</h3>
          <button onClick={toggleChat} className="close-btn">
            &times;
          </button>
        </div>
        <div className="chatbot-body">
          {/* Messages will go here */}
          <p>Hello! How can I help you today?</p>
        </div>
        <div className="chatbot-footer">
          <input type="text" placeholder="Type a message..." />
          <button>Send</button>
        </div>
      </div>
      <button className="chatbot-toggle-button" onClick={toggleChat}>
        💬
      </button>
    </div>
  );
};

export default Chatbot;