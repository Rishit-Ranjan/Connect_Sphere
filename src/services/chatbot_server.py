from flask import Flask, request, jsonify # type: ignore
from flask_cors import CORS # type: ignore
from datetime import datetime # type: ignore
import random, re

# --- Session Management (for context) ---
# For this example, an in-memory dictionary is sufficient.
# The key is userId, the value is a dictionary of session data.
user_sessions = {}
 
# --- Intent-Based Chatbot Logic ---

INTENT_MAP = {
    "greet": {
        "keywords": ["hello", "hi", "hey"],
        "response": "Hello there! I'm a Python-powered bot. How can I assist you today?"
    },
    "status": {
        "keywords": ["how are you"],
        "response": "I'm just a bunch of code, but I'm running smoothly! Thanks for asking."
    },
    "name": {
        "keywords": ["your name"],
        "response": "You can call me PyBot. I'm the Python assistant for ConnectSphere."
    },
    "features": {
        "keywords": ["features", "connectsphere"],
        "response": "ConnectSphere is a social media app where you can share posts, follow users, and chat with an AI assistant... that's me!"
    },
    "time": {
        "keywords": ["time"],
        "action": lambda: f"The current time is {datetime.now().strftime('%I:%M %p')}."
    },
    "help": {
        "keywords": ["help"],
        "response": "I can answer questions about ConnectSphere's features or tell you the time. What do you need help with?"
    },
    "weather": {
        "keywords": ["weather"],
        "response": "I'm not connected to the internet, so I can't check the weather. But I hope it's nice out!"
    },
    "creator": {
        "keywords": ["creator", "who made you"],
        "response": "I was created by a clever developer using Python and Flask for my brain, and React for the beautiful interface you see."
    },
    "thanks": {
        "keywords": ["thanks", "thank you"],
        "response": "You're welcome! Is there anything else I can help with?"
    },
    "goodbye": {
        "keywords": ["bye", "goodbye"],
        "response": "Goodbye! Have a great day."
    },
    # New intent for issue resolution
    "issue_start": {
        "keywords": ["issue", "problem", "can't", "doesn't work", "trouble"],
        "response": "I'm sorry to hear you're having an issue. What seems to be the problem? (e.g., 'login issue', 'posting a message', 'profile update')"
    },
    "issue_login": {
        "keywords": ["login", "log in", "signing in", "password"],
        "response": "For login issues, please first try resetting your password. If that doesn't work, you can contact support at support@connectsphere.com.",
        "context_needed": "issue_start" # This intent is only triggered if we're in an "issue" context
    }
}

FALLBACK_RESPONSES = [
    "That's interesting! Tell me more.",
    "I'm not sure how to respond to that. Can you ask me something else?",
    "I'm still learning. Could you rephrase that?",
    "Sorry, I don't understand. You can ask for 'help' to see what I can do."
]

def get_best_intent(message: str, context: str | None = None) -> str | None:
    """
    Finds the best matching intent.
    This is a simple scoring mechanism. A real NLP model would be more robust.
    """
    lower_message = message.lower()
    best_intent = None
    highest_score = 0

    for intent, data in INTENT_MAP.items():
        # If context is required, and we don't have it, skip this intent
        if "context_needed" in data and data["context_needed"] != context:
            continue

        score = 0
        for keyword in data["keywords"]:
            # Use regex to match whole words for better accuracy
            if re.search(r"\b" + re.escape(keyword) + r"\b", lower_message):
                score += 1
        
        if score > highest_score:
            highest_score = score
            best_intent = intent

    return best_intent if highest_score > 0 else None

def get_bot_response(message: str, user_id: int) -> str:
    """
    Determines the user's intent based on message and context,
    and returns an appropriate response.
    """
    # Ensure session exists for the user
    if user_id not in user_sessions:
        user_sessions[user_id] = {"context": None}

    session = user_sessions[user_id]
    current_context = session.get("context")

    # Greet is a special case that can reset context
    if any(greet in message.lower() for greet in INTENT_MAP["greet"]["keywords"]):
        intent = "greet"
    else:
        intent = get_best_intent(message, current_context)

    # Default to a fallback if no intent is found
    if not intent:
        session["context"] = None # Reset context on misunderstanding
        return random.choice(FALLBACK_RESPONSES)

    # --- Process the determined intent ---
    intent_data = INTENT_MAP[intent]

    # Update context if the intent changes it
    # For example, starting an "issue" flow sets the context.
    if intent == "issue_start":
        session["context"] = "issue_start"
    # If we resolve an issue, clear the context
    elif intent == "issue_login":
        session["context"] = None

    # Execute action or return static response
    if "action" in intent_data:
        return intent_data["action"]()
    
    return intent_data["response"]

    return random.choice(FALLBACK_RESPONSES)

# --- Flask App ---
app = Flask("chatbot_server")
# Enable CORS to allow requests from your React app's origin
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    """Endpoint to receive messages and return chatbot replies."""
    try:
        # Get the message from the POST request's JSON body
        data = request.get_json()
        user_message = data.get("message")
        user_id = data.get("userId") # Get userId for personalization/context

        if not user_message or user_id is None:
            return jsonify({'error': 'No message provided'}), 400

        # Get the bot's reply
        bot_reply = get_bot_response(user_message, user_id)

        # Return the reply in the expected JSON format
        return jsonify({'reply': bot_reply})

    except Exception as e:
        print(f"Error processing chat request: {e}")
        return jsonify({'error': 'An internal error occurred'}), 500

if __name__ == '__main__':
    # Run the Flask app on http://127.0.0.1:5000
    # The host '0.0.0.0' makes it accessible from your local network
    app.run(host='0.0.0.0', port=5000, debug=True)