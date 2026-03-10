from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
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
    if not db or not uid:
        fallback_sessions[session_id] = history
        return
    
    try:
        doc_ref = db.collection('users').document(uid).collection('chat_sessions').document(session_id)
        doc_ref.set({
            'history': history,
            'updated_at': firestore.SERVER_TIMESTAMP
        }, merge=True)
    except Exception as e:
        print(f"Firestore write error: {e}")
        fallback_sessions[session_id] = history

@app.route("/api/chat", methods=["POST"])
def chat_api():
    try:
        data = request.json
        user_prompt = data.get('prompt')
        session_id = data.get('session_id', 'default_session')
        uid = data.get('uid')

        if not api_key:
            return jsonify({"error": "Google API Key not found. Please follow the steps in walkthrough.md to generate one."}), 500
        
        if not user_prompt:
            return jsonify({"error": "Prompt is required"}), 400

        if not uid and db: # If Firebase is active but no UID is provided
            return jsonify({"error": "User ID (uid) is required for persistent chat sessions."}), 400

        # Load history from Firestore or fallback
        history = get_chat_history(uid, session_id)

        # Initialize the chat session with history
        model = genai.GenerativeModel(active_model)
        chat = model.start_chat(history=history)

        response = chat.send_message(user_prompt)
        
        # Save updated history back to Firestore or fallback
        save_chat_history(uid, session_id, chat.history)

        return jsonify({"reply": response.text})

    except Exception as e:
        print(f"Error in chat_api: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "Failed to connect to Gemini. Check your API Key and internet connection."}), 500

@app.route("/api/history", methods=["GET"])
def get_history():
    return jsonify(chat_sessions)

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "ConvoBot API is running"})

if __name__ == "__main__":
    app.run(debug=True)
