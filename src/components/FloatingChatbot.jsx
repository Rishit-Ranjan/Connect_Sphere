import React, { useState, useEffect, useRef } from 'react';
// Import the new Python chatbot service
import { getMyPythonChatbotResponse } from '../services/myChatbotService';
import { getOfflineBotResponse } from '../services/offlineChatbotService';
import { MessageIcon, XIcon, SendIcon, EllipsisVerticalIcon, TrashIcon } from './Icons';
// UPDATE: Changed the AI assistant to a custom bot to reflect the new backend
const customPythonBot = { id: 0, name: 'Python Assistant', email: 'py@connectsphere.com', gender: 'other', avatar: 'https://i.imgur.com/R3a241h.png', role: 'participant', status: 'active', followers: [], following: [] };
const offlineBot = { id: -1, name: 'Offline Bot', email: 'offline@connectsphere.com', gender: 'other', avatar: 'https://i.imgur.com/O6G1A22.png', role: 'participant', status: 'active', followers: [], following: [] };
const FloatingChatbot = ({ currentUser, isOnline }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const chatEndRef = useRef(null);
    const menuRef = useRef(null);
    const currentBot = isOnline ? customPythonBot : offlineBot;
    const storageKey = `chatHistory_${currentUser.id}_${isOnline ? 'online_python' : 'offline'}`; // Updated key for python bot
    const getInitialMessage = React.useCallback(() => ({
        id: Date.now(),
        sender: currentBot,
        text: isOnline
            ? `Hi ${currentUser.name}! I'm your custom Python-powered assistant. How can I help?`
            : `Hi ${currentUser.name}. You seem to be offline. I'm a basic bot with limited functions. Ask 'help' to see what I can do.`,
        timestamp: 'Just now'
    }), [currentBot, isOnline, currentUser.name]);
   
    const [messages, setMessages] = useState(() => {
        try {
            const storedMessages = localStorage.getItem(storageKey);
            if (storedMessages && JSON.parse(storedMessages).length > 0) {
                return JSON.parse(storedMessages);
            }
        }
        catch (error) {
            console.error("Failed to parse chat history from localStorage on init", error);
        }
        return [getInitialMessage()];
    });
    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem(storageKey);
            if (storedMessages && JSON.parse(storedMessages).length > 0) {
                setMessages(JSON.parse(storedMessages));
            }
            else {
                setMessages([getInitialMessage()]);
            }
        }
        catch (error) {
            console.error("Failed to parse chat history from localStorage on status change", error);
            setMessages([getInitialMessage()]);
        }
    }, [isOnline, currentUser.id, getInitialMessage, storageKey]);
    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
        catch (error) {
            console.error("Failed to save chat history to localStorage", error);
        }
    }, [messages, storageKey]);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const handleClearChat = () => {
        const isConfirmed = window.confirm('Are you sure you want to clear the chat history? This action cannot be undone.');
        if (isConfirmed) {
            localStorage.removeItem(storageKey);
            setMessages([getInitialMessage()]);
            setIsMenuOpen(false);
        }
    };
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending)
            return;
        // Fix: Updated type to ChatbotMessage.
        const userMessage = {
            id: Date.now(),
            sender: currentUser,
            text: newMessage,
            timestamp: 'Just now'
        };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsSending(true);
        try {
            const responseText = isOnline
                ? await getMyPythonChatbotResponse(newMessage, currentUser.id)
                : await getOfflineBotResponse(newMessage);
            const botMessage = {
                id: Date.now() + 1,
                sender: currentBot,
                text: responseText,
                timestamp: 'Just now'
            };
            setMessages(prev => [...prev, botMessage]);
        }
        catch (error) {
            console.error("Error getting bot response:", error);
            const errorMessage = {
                id: Date.now() + 1,
                sender: currentBot,
                text: "Sorry, I encountered an error.",
                timestamp: 'Just now'
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsSending(false);
        }
    };
    const UserAvatar = ({ user, className = 'h-10 w-10' }) => (<img className={`${className} rounded-full object-cover`} src={user.avatar} alt={user.name}/>);
    return (<>
      <div className={`fixed bottom-6 right-6 z-40 transition-transform transform ${isOpen ? 'scale-0' : 'scale-100'}`}>
        <button onClick={() => setIsOpen(true)} className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-all duration-300 hover:scale-110" aria-label="Open AI Assistant">
          <MessageIcon className="h-8 w-8"/>
        </button>
      </div>

      <div className={`fixed bottom-0 right-0 sm:bottom-6 sm:right-6 w-full h-full sm:w-96 sm:h-[70vh] max-h-[600px] bg-white dark:bg-secondary rounded-none sm:rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full sm:translate-y-16'}`} style={{ pointerEvents: isOpen ? 'auto' : 'none' }} role="dialog" aria-modal="true" aria-hidden={!isOpen} aria-labelledby="chatbot-heading">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <UserAvatar user={currentBot}/>
              <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-secondary ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            </div>
            <div>
              <p id="chatbot-heading" className="font-bold text-gray-800 dark:text-white">{currentBot.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div ref={menuRef} className="relative">
              <button onClick={() => setIsMenuOpen(prev => !prev)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Chat options">
                <EllipsisVerticalIcon className="h-6 w-6"/>
              </button>
              {isMenuOpen && (<div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-10 p-1.5">
                  <button onClick={handleClearChat} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                    <TrashIcon className="h-5 w-5"/>
                    <span>Clear Chat</span>
                  </button>
                </div>)}
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Close chat">
              <XIcon className="h-6 w-6"/>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isFromCurrentUser = msg.sender.id === currentUser.id;
            const senderUser = msg.sender;
            return (<div key={msg.id} className={`flex items-end gap-2 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {!isFromCurrentUser && <UserAvatar user={senderUser} className="h-8 w-8"/>}
                <div className={`max-w-xs lg:max-w-sm p-3 rounded-2xl shadow-sm ${isFromCurrentUser ? 'bg-primary text-white rounded-br-lg' : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>);
        })}
          <div ref={chatEndRef}/>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="relative">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." disabled={isSending} className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-secondary transition-shadow" aria-label="Chat message input"/>
            <button type="submit" disabled={isSending || !newMessage.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-primary text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary" aria-label="Send message">
              <SendIcon className="h-5 w-5"/>
            </button>
          </form>
        </div>
      </div>
    </>);
};
export default FloatingChatbot;
