from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from difflib import SequenceMatcher
import random, requests, os, re
from google import genai
from dotenv import load_dotenv
import sys
import io

# Fix Windows console encoding issues
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Load environment variables from .env file
# Load environment variables from .env file
base_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(base_dir, ".."))

# Potential env file locations
env_files = [
    os.path.join(base_dir, ".env"),
    os.path.join(root_dir, ".env"),
    os.path.join(root_dir, ".env.local"),
]

for env_file in env_files:
    if os.path.exists(env_file):
        print(f"Loading environment from: {env_file}")
        load_dotenv(env_file, override=True)

# Initialize the Gemini client
api_key = os.environ.get("GEMINI_API_KEY")

if api_key:
    client = genai.Client(api_key=api_key)
    print(f"Gemini API client initialized successfully.")
else:
    client = None
    print("WARNING: Please set the GEMINI_API_KEY environment variable for the chatbot to work.")

user_sessions = {}

INTENT_MAP = {
    "greeting": {
        "keywords": ["hello", "hi", "hey", "good morning", "good afternoon"],
        "response": lambda: random.choice(["Hello! How can I help you with ConnectSphere today?", "Hi there! What can I do for you?"])
    },
    "issue_start": {
        "keywords": ["help", "problem", "issue", "error", "not working", "broken"],
        "response": "I can help with that. Is it related to login, profile, or something else?"
    },
    "issue_login": {
        "keywords": ["login", "password", "sign in", "authentication", "forgot password"],
        "response": "For login issues, please try resetting your password or checking your email verification. Would you like me to guide you through the password reset process?",
        "context_needed": "issue_start"
    },
    "issue_profile": {
        "keywords": ["profile", "account", "settings", "update", "change"],
        "response": "I can help you with profile management. What would you like to update?",
        "context_needed": "issue_start"
    },
    "goodbye": {
        "keywords": ["bye", "goodbye", "see you", "thanks", "thank you"],
        "response": lambda: random.choice(["Goodbye! Feel free to reach out if you need more help.", "You're welcome! Have a great day!"])
    }
}

def fuzzy_match(message: str, keyword: str) -> float:
    return SequenceMatcher(None, message.lower(), keyword.lower()).ratio()

def get_best_intent(message: str, context: str | None = None) -> str | None:
    lower_message = message.lower()
    best_intent, highest_score = None, 0
    for intent, data in INTENT_MAP.items():
        if "context_needed" in data and data["context_needed"] != context:
            continue
        best_score = max(fuzzy_match(lower_message, kw) for kw in data["keywords"])
        if best_score > highest_score:
            highest_score, best_intent = best_score, intent
    return best_intent if highest_score >= 0.55 else None


def call_gemini_model(message: str, history: list) -> str:
    """Calls the Gemini API for a generative response."""
    if not client:
        return "I'm having trouble connecting to my AI services. Please check the server configuration."

    try:
        model_id = "gemini-2.5-flash"
        
        # Format conversation for Gemini
        conversation = []
        for turn in history[-5:]:
            conversation.append(f"User: {turn['user']}")
            conversation.append(f"Assistant: {turn['bot']}")
        
        system_instruction = "You are a friendly assistant for ConnectSphere. Keep responses helpful and concise."
        
        # Combine history and current message into a single prompt for simpler execution
        full_prompt = system_instruction + "\n\n"
        if conversation:
            full_prompt += "Previous conversation:\n" + "\n".join(conversation) + "\n\n"
        full_prompt += f"User: {message}\nAssistant:"
        
        print(f"Generating Gemni response for user message...")
        response = client.models.generate_content(
            model=model_id,
            contents=full_prompt
        )
        
        return response.text.strip()
        
    except Exception as e:
        error_msg = str(e).lower()
        if "429" in error_msg or "quota" in error_msg:
            print(f"Gemini API Rate Limit: {e}")
            return "I'm receiving too many requests right now. Please wait a few seconds and try again."
        
        print(f"Gemini API error: {e}")
        return "I'm having trouble connecting to my AI services. Please try again in a moment."

def get_bot_response(message: str, user_id: int) -> str:
    if user_id not in user_sessions:
        user_sessions[user_id] = {"context": None, "history": []}
    session = user_sessions[user_id]
    context = session["context"]
    
    # Check for intent first
    intent = get_best_intent(message, context)
    if intent:
        data = INTENT_MAP[intent]
        
        # Update context based on intent
        if intent == "issue_start":
            session["context"] = "issue_start"
        elif intent in ["issue_login", "issue_profile"]:
            session["context"] = None
        elif intent == "goodbye":
            session["context"] = None
        
        reply_source = data.get("response") or data.get("action")
        if callable(reply_source):
            reply = reply_source()
        else:
            reply = reply_source
    else:
        # Use generative response (Gemini API)
        session["context"] = None
        reply = call_gemini_model(message, session["history"])
        print(f"Gemini API response: {reply[:50]}...")
    
    # Add to history and maintain reasonable size
    session["history"].append({"user": message, "bot": reply})
    if len(session["history"]) > 10:
        session["history"] = session["history"][-10:]
    
    return reply

# --- Flask App ---
app = Flask("chatbot_server")
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    """Endpoint to receive messages and return chatbot replies."""
    try:
        data = request.get_json()
        user_message = data.get("message")
        user_id = data.get("userId")

        if not user_message or user_id is None:
            return jsonify({'error': 'No message or userId provided'}), 400

        bot_reply = get_bot_response(user_message, user_id)
        return jsonify({'reply': bot_reply})

    except Exception as e:
        print(f"Error processing chat request: {e}")
        return jsonify({'error': 'An internal error occurred'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    gemini_status = client is not None
    
    return jsonify({
        'status': 'ok',
        'gemini_available': gemini_status,
        'model': "gemini-2.0-flash"
    })


if __name__ == '__main__':
    print("=" * 50)
    print("ConnectSphere Chatbot Server Starting...")
    print("=" * 50)
    print(f"Gemini API configured: {client is not None}")
    print("-" * 50)
    
    if client:
        print("[OK] Gemini API is configured and ready.")
    else:
        print("[WARNING] Gemini API key NOT FOUND.")
        print("   Please set the GEMINI_API_KEY environment variable.")
    
    print("=" * 50)
    print("Server running on http://0.0.0.0:5000")
    print("Health check: http://localhost:5000/health")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)