// A simple rule-based offline chatbot service.
export const getOfflineBotResponse = async (message) => {
    const lowerCaseMessage = message.toLowerCase();
    // Simulate network delay for a more realistic feel
    await new Promise(resolve => setTimeout(resolve, 300));
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
        return "Hello there! I am the offline assistant. I can help with some basic questions while you're disconnected.";
    }
    if (lowerCaseMessage.includes('help')) {
        return "I can answer questions about ConnectSphere's features or tell you the time. What do you need help with?";
    }
    if (lowerCaseMessage.includes('time')) {
        return `The current time is ${new Date().toLocaleTimeString()}.`;
    }
    if (lowerCaseMessage.includes('features') || lowerCaseMessage.includes('connectsphere')) {
        return "ConnectSphere allows you to share posts, follow users, and chat. The online AI Assistant provides more advanced features like post generation.";
    }
    if (lowerCaseMessage.includes('offline') || lowerCaseMessage.includes('online')) {
        return "It seems you are currently offline. My functions are limited, but I'll do my best to help. Full AI capabilities will be restored when you reconnect.";
    }
    if (lowerCaseMessage.includes('thanks') || lowerCaseMessage.includes('thank you')) {
        return "You're welcome!";
    }
    return "I'm sorry, I have limited functionality offline and can't understand that request. Please try asking about 'help' or 'features'.";
};
