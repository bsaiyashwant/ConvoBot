# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")  # Replace with real key
model = genai.GenerativeModel(model_name="models/gemini-1.5-flash")
chat = model.start_chat()

app = Flask(__name__)
CORS(app)

chat_sessions = {}  # session_id => [{"user": ..., "bot": ...}]

@app.route("/chat", methods=["POST"])
def chat_api():
    data = request.json
    session_id = data.get("session_id")
    prompt = data.get("prompt")

    if session_id not in chat_sessions:
        chat_sessions[session_id] = []

    try:
        response = chat.send_message(prompt)
        bot_reply = response.text
        chat_sessions[session_id].append({"user": prompt, "bot": bot_reply})
        return jsonify({"reply": bot_reply})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/history", methods=["GET"])
def get_history():
    return jsonify(chat_sessions)

if __name__ == "__main__":
    app.run(debug=True)
