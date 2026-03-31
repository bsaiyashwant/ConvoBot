# ConvoBot v2.0 🤖⚡

> **Your AI-Powered Study Partner** — Chat with multiple AI models from one sleek interface.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-convobotai.vercel.app-blue?style=for-the-badge)](https://convobotai.vercel.app/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-Python-green?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)

## ✨ Features
- **Sleek UI**
- **Persistent Chat History**: Conversations are securely saved to Firebase Firestore, allowing you to pick up right where you left off.
- **Secure Authentication**: Integrated Email/Password and Google Sign-In.
- **Cross-Platform**: Fully responsive design that works on mobile and desktop.
- **24/7 Availability**
- **📥 PDF Export**: Download any chat as a branded PDF for easy sharing and note summaries.

---

## ✨ What's New in v2.0

### 🧠 Multi-Model AI
Switch between **three AI providers** in real-time from the header dropdown:

| Model | Provider | Speed | Best For |
|-------|----------|-------|----------|
| ⚡ **Gemini** | Google AI | Fast | General knowledge, coding, reasoning |
| 🟠 **Mistral** | Mistral AI | Fast | Creative writing, multilingual tasks |
| 🔴 **Groq** | Groq (Llama 3.3 70B) | Ultra-fast | Quick answers, summarization |

### 💬 Chat Management
- **Rename chats** — Click the ✏️ pencil icon on any chat to give it a custom name
- **Delete chats** — Click the 🗑️ trash icon to remove unwanted conversations
- **Persistent names** — Custom chat names are saved across sessions

### 🎨 Neon Drift UI
- Futuristic glassmorphism design with neon accents
- Custom model selector dropdown with brand-colored SVG logos
- Smooth micro-animations and hover effects
- Fully responsive (desktop + mobile)

### 🔐 Authentication
- **Email/Password** sign-up with email verification
- **Google Sign-In** (one-click)
- Resend verification email option on login page

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Firebase project with Auth + Firestore enabled

### 1. Clone & Install

```bash
git clone https://github.com/bsaiyashwant/ConvoBot.git
cd ConvoBot

# Frontend
cd frontend && npm install

# Backend
cd ../api && pip install -r requirements.txt
```

### 2. Configure Environment Variables

**`api/.env`**
```env
GOOGLE_API_KEY=your_google_gemini_api_key
MISTRAL_API_KEY=your_mistral_api_key
GROQ_API_KEY=your_groq_api_key
```

**Get your API keys:**
| Key | Where to Get |
|-----|-------------|
| `GOOGLE_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `MISTRAL_API_KEY` | [Mistral Console](https://console.mistral.ai) (free tier) |
| `GROQ_API_KEY` | [Groq Console](https://console.groq.com) (free tier) |

### 3. Run Locally

```bash
# Terminal 1 — Backend
cd api && python index.py

# Terminal 2 — Frontend
cd frontend && npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

---

## 👥 Team podmAAn

Built with ❤️ by the **podmAAn** team at KL University.

---

## 📄 License

This project is built for educational purposes as part of the 2nd Year, 2nd Semester curriculum at KLH University.
