from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from difflib import SequenceMatcher
import random, requests  # requests for local LLM endpoints
import re

# remove spacy dependency if it's unreliable in your env
# import spacy
# nlp = spacy.load("en_core_web_sm")

user_sessions = {}
# keep existing INTENT_MAP as is

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

def call_local_llm(message: str, history: list[str]) -> str:
    # Example: Ollama local server on port 11434
    # You can swap this with another local engine (gpt4all, localai)
    try:
        payload = {
            "model": "mistral",  # whatever model you downloaded locally
            "prompt": f"You are a friendly assistant for ConnectSphere.\nUser: {message}\nAssistant:",
            "max_tokens": 150
        }
        r = requests.post("http://127.0.0.1:11434/api/generate", json=payload, timeout=10)
        r.raise_for_status()
        return r.json().get("response", "Sorry, I couldn't think of a response.")
    except Exception:
        # fallback to a non-API local template
        return "Sorry, I don't understand fully yet, but I can help with login and profile issues."

def get_bot_response(message: str, user_id: int) -> str:
    if user_id not in user_sessions:
        user_sessions[user_id] = {"context": None, "history": []}
    session = user_sessions[user_id]
    context = session["context"]
    intent = get_best_intent(message, context)
    if intent:
        data = INTENT_MAP[intent]
        if intent == "issue_start": session["context"] = "issue_start"
        elif intent == "issue_login": session["context"] = None
        if "action" in data: reply = data["action"]()
        else: reply = data["response"]
    else:
        # generative fallback.
        session["context"] = None
        reply = call_local_llm(message, session["history"])
    session["history"].append({"user": message, "bot": reply})
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
            return jsonify({'error': 'No message provided'}), 400

        bot_reply = get_bot_response(user_message, user_id)
        return jsonify({'reply': bot_reply})

    except Exception as e:
        print(f"Error processing chat request: {e}")
        return jsonify({'error': 'An internal error occurred'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)