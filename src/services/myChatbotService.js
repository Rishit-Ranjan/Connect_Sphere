// This function sends a message to your Python backend and gets a response.
export const getMyPythonChatbotResponse = async (message, userId) => {
    const PYTHON_SERVER_URL = 'http://127.0.0.1:5000/chat';
    try {
        const response = await fetch(PYTHON_SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message, userId: userId }),
        });
        if (!response.ok) {
            // If the server response is not OK (e.g., 400, 500), throw an error.
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }
        const data = await response.json();
        // The Flask server returns a JSON object like: { "reply": "Hello there!" }
        // We extract the 'reply' field.
        return data.reply || "Sorry, I didn't get a valid response.";
    }
    catch (error) {
        console.error("Error communicating with the Python chatbot server:", error);
        // Provide a user-friendly error message
        return "I'm having trouble connecting to my own brain right now. Please make sure the Python server is running.";
    }
};
