from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import requests as http_requests
import os
from dotenv import load_dotenv
load_dotenv()

import traceback
import json
import firebase_admin
from firebase_admin import credentials, firestore

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin
try:
    firebase_creds_env = os.environ.get("FIREBASE_SERVICE_ACCOUNT")
    if firebase_creds_env:
        cred = credentials.Certificate(json.loads(firebase_creds_env))
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase Admin Initialized from Env Var Successfully")
    else:
        cred_path = os.path.join(os.path.dirname(__file__), "firebase_creds.json")
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("Firebase Admin Initialized from Local File Successfully")
        else:
            print("WARNING: No Firebase credentials found. Database features disabled.")
            db = None
except Exception as e:
    print(f"Failed to initialize Firebase Admin: {e}")
    db = None

# In-memory fallback if Firebase isn't configured yet
fallback_sessions = {}

# Initialize Gemini
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    print("Warning: GOOGLE_API_KEY not found in environment variables.")

active_model = "gemini-1.5-flash" # Default model

# Fallback model discovery if 1.5-flash is not available
available_models = []
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            available_models.append(m.name)
    
    if "models/gemini-1.5-flash" not in available_models and "models/gemini-pro" in available_models:
        active_model = "models/gemini-pro"
        print("Falling back to gemini-pro")
    elif "models/gemini-1.5-flash" not in available_models and len(available_models) > 0:
        active_model = available_models[0]
        print(f"Falling back to {active_model}")
except Exception as e:
    print(f"Error fetching models: {e}")

print(f"Active Gemini Model: {active_model}")

# ============================================
# MULTI-MODEL: Grok (xAI) + Groq Providers
# ============================================
GROK_API_KEY = os.getenv("GROK_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def convert_history_to_openai(gemini_history):
    """Convert Gemini-style history [{role, parts}] to OpenAI-style [{role, content}]."""
    messages = []
    for entry in gemini_history:
        role = entry.get("role", "user")
        if role == "model":
            role = "assistant"
        parts = entry.get("parts", [])
        content = parts[0] if parts else ""
        if isinstance(content, dict):
            content = content.get("text", "")
        messages.append({"role": role, "content": str(content)})
    return messages

def chat_grok(prompt, history):
    """Send a chat request to xAI Grok API."""
    if not GROK_API_KEY:
        return "Error: Grok API key not configured. Please add GROK_API_KEY to your environment."
    
    headers = {
        "Authorization": f"Bearer {GROK_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = convert_history_to_openai(history) + [{"role": "user", "content": prompt}]
    
    resp = http_requests.post(
        "https://api.x.ai/v1/chat/completions",
        headers=headers,
        json={"model": "grok-4-1-fast-non-reasoning", "messages": messages},
        timeout=60
    )
    if resp.status_code == 403:
        return "Error: Grok API access denied. Please check your xAI account has billing/credits enabled at console.x.ai."
    if resp.status_code == 401:
        return "Error: Invalid Grok API key. Please check GROK_API_KEY in your environment."
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]

def chat_groq(prompt, history):
    """Send a chat request to Groq API (fast open-source models)."""
    if not GROQ_API_KEY:
        return "Error: Groq API key not configured. Please add GROQ_API_KEY to your environment."
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = convert_history_to_openai(history) + [{"role": "user", "content": prompt}]
    
    resp = http_requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json={"model": "llama-3.3-70b-versatile", "messages": messages},
        timeout=60
    )
    if resp.status_code == 403:
        return "Error: Groq API access denied. Please check your Groq account at console.groq.com."
    if resp.status_code == 401:
        return "Error: Invalid Groq API key. Please check GROQ_API_KEY in your environment."
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]

def save_openai_style_history(uid, session_id, history, prompt, reply):
    """For Grok/Groq: append user+assistant messages and save in Gemini-compatible format."""
    new_history = list(history)
    new_history.append({"role": "user", "parts": [prompt]})
    new_history.append({"role": "model", "parts": [reply]})
    
    if not db or not uid:
        fallback_sessions[session_id] = new_history
        return
    try:
        doc_ref = db.collection('users').document(uid).collection('chat_sessions').document(session_id)
        doc_ref.set({
            'history': new_history,
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
    except Exception as e:
        print(f"Firestore write error (multi-model): {e}")
        fallback_sessions[session_id] = new_history

def serialize_history(history):
    """Converts Gemini history objects into plain dictionaries for storage."""
    serialized = []
    for content in history:
        serialized.append({
            "role": content.role,
            "parts": [part.text for part in content.parts if hasattr(part, 'text')]
        })
    return serialized

def get_chat_history(uid, session_id):
    if not db or not uid:
        return fallback_sessions.get(session_id, [])
    
    try:
        doc_ref = db.collection('users').document(uid).collection('chat_sessions').document(session_id)
        doc = doc_ref.get()
        if doc.exists:
            return doc.to_dict().get('history', [])
        return []
    except Exception as e:
        print(f"Firestore read error: {e}")
        return fallback_sessions.get(session_id, [])

def save_chat_history(uid, session_id, history):
    # Always serialize before saving
    serialized = serialize_history(history)
    
    if not db or not uid:
        fallback_sessions[session_id] = serialized
        return
    
    try:
        doc_ref = db.collection('users').document(uid).collection('chat_sessions').document(session_id)
        doc_ref.set({
            'history': serialized,
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
    except Exception as e:
        print(f"Firestore write error: {e}")
        fallback_sessions[session_id] = serialized

@app.route("/api/chat", methods=["POST"])
@app.route("/chat", methods=["POST"])
def chat_api():
    try:
        data = request.json
        user_prompt = data.get('prompt')
        session_id = data.get('session_id', 'default_session')
        uid = data.get('uid')
        model_provider = data.get('model', 'gemini')  # Default to gemini

        if not user_prompt:
            return jsonify({"error": "Prompt is required"}), 400

        if not uid and db:
            return jsonify({"error": "User ID (uid) is required for persistent chat sessions."}), 400

        # Load history from Firestore or fallback
        history = get_chat_history(uid, session_id)

        # ====== ROUTE TO THE SELECTED MODEL ======
        if model_provider == 'grok':
            reply = chat_grok(user_prompt, history)
            try:
                save_openai_style_history(uid, session_id, history, user_prompt, reply)
            except Exception as save_err:
                print(f"Non-critical history save error: {save_err}")
            return jsonify({"reply": reply})

        elif model_provider == 'groq':
            reply = chat_groq(user_prompt, history)
            try:
                save_openai_style_history(uid, session_id, history, user_prompt, reply)
            except Exception as save_err:
                print(f"Non-critical history save error: {save_err}")
            return jsonify({"reply": reply})

        else:
            # ====== GEMINI (DEFAULT — UNTOUCHED LOGIC) ======
            if not api_key:
                return jsonify({"error": "Google API Key not found. Please follow the steps in walkthrough.md to generate one."}), 500

            model = genai.GenerativeModel(active_model)
            chat = model.start_chat(history=history)
            response = chat.send_message(user_prompt)

            try:
                save_chat_history(uid, session_id, chat.history)
            except Exception as save_err:
                print(f"Non-critical history save error: {save_err}")

            return jsonify({"reply": response.text})

    except Exception as e:
        error_msg = str(e)
        print(f"CRITICAL Error in chat_api: {error_msg}")
        traceback.print_exc()
        
        if "API_KEY_INVALID" in error_msg:
            return jsonify({"error": "Invalid Google API Key. Please check your Vercel environment variables."}), 500
        
        return jsonify({"error": f"Backend Error: {error_msg}"}), 500

@app.route("/api/history", methods=["GET"])
@app.route("/history", methods=["GET"])
def get_history():
    return jsonify(fallback_sessions)

@app.route("/api/health", methods=["GET"])
@app.route("/health", methods=["GET"])
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "ConvoBot API is running"})

if __name__ == "__main__":
    app.run(debug=True)
