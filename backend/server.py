from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from difflib import SequenceMatcher
import random, requests, os, re
from google import genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize the Gemini client
api_key = os.environ.get("GEMINI_API_KEY")
FOUNDRY_URL = os.environ.get("FOUNDRY_URL", "http://127.0.0.1:56013")
# Correct model name from Foundry
LOCAL_MODEL = os.environ.get("LOCAL_MODEL", "Phi-3.5-mini-instruct-generic-cpu:1")

if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None
    print("WARNING: Please set the GEMINI_API_KEY environment variable for fallback support.")

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

def check_foundry_available() -> bool:
    """Check if Foundry server is running and accessible."""
    try:
        response = requests.get(f"{FOUNDRY_URL}/v1/models", timeout=5)
        return response.status_code == 200
    except:
        return False

def call_foundry(message: str, history: list) -> str:
    """Calls Foundry server with phi-3.5-mini model."""
    if not check_foundry_available():
        return None
    
    try:
        # Build conversation context from history
        messages = []
        
        # Add system message
        messages.append({
            "role": "system",
            "content": "You are a friendly, helpful assistant for ConnectSphere, a social networking platform. Keep responses concise and helpful (under 2 sentences when possible). Focus on user support for login, profile management, and general questions."
        })
        
        # Add conversation history (last 5 turns for context)
        for turn in history[-5:]:
            messages.append({"role": "user", "content": turn["user"]})
            messages.append({"role": "assistant", "content": turn["bot"]})
        
        # Add current message
        messages.append({"role": "user", "content": message})
        
        # Correct payload format for Foundry
        payload = {
            "model": LOCAL_MODEL,
            "messages": messages,
            "max_tokens": 200,
            "temperature": 0.7,
            "top_p": 0.9,
            "stream": False
        }
        
        print(f"Calling Foundry at {FOUNDRY_URL}/v1/chat/completions")
        print(f"Using model: {LOCAL_MODEL}")
        
        response = requests.post(
            f"{FOUNDRY_URL}/v1/chat/completions",
            json=payload,
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            response_data = response.json()
            
            # Parse OpenAI-compatible response format
            if "choices" in response_data and len(response_data["choices"]) > 0:
                message_content = response_data["choices"][0].get("message", {}).get("content", "")
                if message_content:
                    return message_content.strip()
            
            print(f"Unexpected response format: {response_data}")
            return None
        else:
            print(f"Foundry returned status {response.status_code}: {response.text}")
            return None
                
    except requests.exceptions.Timeout:
        print("Foundry request timed out")
        return None
    except requests.exceptions.ConnectionError:
        print(f"Cannot connect to Foundry at {FOUNDRY_URL}")
        return None
    except Exception as e:
        print(f"Foundry error: {e}")
        return None

def call_gemini_model(message: str, history: list) -> str:
    """Calls the Gemini API for a generative response."""
    if not client:
        return "I'm having trouble connecting to my AI services. Please check the server configuration."

    try:
        model_id = "gemini-2.0-flash"
        
        # Format conversation for Gemini
        conversation = []
        for turn in history[-5:]:
            conversation.append(f"User: {turn['user']}")
            conversation.append(f"Assistant: {turn['bot']}")
        
        system_instruction = "You are a friendly assistant for ConnectSphere. Keep responses helpful and concise."
        
        chat = client.chats.create(
            model=model_id,
            history=[],
            config={"system_instruction": system_instruction}
        )
        
        full_prompt = "\n".join(conversation)
        if full_prompt:
            full_prompt += f"\nUser: {message}\nAssistant:"
        else:
            full_prompt = f"User: {message}\nAssistant:"
        
        response = chat.send_message(full_prompt)
        return response.text.strip()
        
    except Exception as e:
        print(f"Gemini API error: {e}")
        return "I'm having trouble connecting to my services right now. Please try again in a moment."

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
        # No intent matched - use generative response
        session["context"] = None
        
        # Try Foundry first
        reply = call_foundry(message, session["history"])
        
        # Fallback to Gemini if Foundry fails
        if reply is None:
            print("Foundry not available, falling back to Gemini API")
            reply = call_gemini_model(message, session["history"])
        else:
            print(f"Foundry response: {reply}")
    
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
    foundry_status = check_foundry_available()
    gemini_status = client is not None
    
    # Try to get model info
    models_info = None
    if foundry_status:
        try:
            response = requests.get(f"{FOUNDRY_URL}/v1/models", timeout=3)
            if response.status_code == 200:
                models_info = response.json()
        except:
            pass
    
    return jsonify({
        'status': 'ok',
        'foundry_available': foundry_status,
        'gemini_available': gemini_status,
        'local_model': LOCAL_MODEL,
        'foundry_url': FOUNDRY_URL,
        'available_models': models_info
    })

@app.route('/test_foundry', methods=['GET', 'POST'])
def test_foundry():
    """Test Foundry connection with a simple message."""
    test_message = "Hello, how are you?"
    
    if request.method == 'POST':
        data = request.get_json()
        test_message = data.get("message", test_message)
    
    # Test with a simple message
    response = call_foundry(test_message, [])
    
    return jsonify({
        'test_message': test_message,
        'response': response,
        'model_used': LOCAL_MODEL,
        'foundry_url': FOUNDRY_URL
    })

if __name__ == '__main__':
    print("=" * 50)
    print("ConnectSphere Chatbot Server Starting...")
    print("=" * 50)
    print(f"Local Model: {LOCAL_MODEL}")
    print(f"Foundry URL: {FOUNDRY_URL}")
    print(f"Gemini API configured: {client is not None}")
    print("-" * 50)
    
    # Test Foundry connection
    if check_foundry_available():
        print("Foundry server is running")
        
        # Get model info
        try:
            response = requests.get(f"{FOUNDRY_URL}/v1/models", timeout=3)
            if response.status_code == 200:
                models = response.json()
                print(f"✓ Available models: {models}")
        except Exception as e:
            print(f"⚠️ Could not fetch model info: {e}")
        
        # Test a quick inference
        print("\nTesting Foundry with a simple prompt...")
        test_response = call_foundry("Hello", [])
        if test_response:
            print(f"✓ Foundry test successful: {test_response[:100]}")
        else:
            print("⚠️ Foundry test returned empty response")
    else:
        print("⚠️ Foundry server not available")
        print(f"   Please ensure Foundry is running on {FOUNDRY_URL}")
    
    print("=" * 50)
    print("Server running on http://0.0.0.0:5000")
    print("Health check: http://localhost:5000/health")
    print("Test Foundry: http://localhost:5000/test_foundry")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)