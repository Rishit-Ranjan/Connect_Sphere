/* eslint-disable no-unused-vars */
// AI features have been disabled by removing the API dependency.
// These functions return default values to prevent app errors.
export const generateChatResponse = async (_newMessage) => {
    console.warn("Gemini API has been removed. Chat response feature is disabled.");
    // This function is not currently used by the floating chatbot, but we'll keep a safe default.
    return "AI features are not available.";
};
export const generateReplySuggestions = async (lastMessage) => {
    console.warn("Gemini API has been removed. Reply suggestion feature is disabled.");
    return [];
};
