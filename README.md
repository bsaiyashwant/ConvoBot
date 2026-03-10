# ConvoBot 🤖

ConvoBot is a premium, AI-powered study tool and chat assistant inspired by the modern aesthetic of ChatGPT. It features a clean, professional interface, persistent chat history through Firebase, and is powered by Google's Gemini 1.5 Flash model.

## 🚀 Live Demo
Check out the live application here: [https://convobotai.vercel.app/](https://convobotai.vercel.app/)

## ✨ Features
- **ChatGPT-Inspired UI**: A sleek, dark-themed interface with glassmorphism effects and professional typography.
- **Persistent Chat History**: Conversations are securely saved to Firebase Firestore, allowing you to pick up right where you left off.
- **Secure Authentication**: Integrated Firebase Auth for Email/Password and Google Sign-In.
- **Powered by Gemini AI**: Leverages Google's state-of-the-art Gemini 1.5 Flash model for fast and accurate responses.
- **Cross-Platform**: Fully responsive design that works on mobile and desktop.
- **24/7 Availability**: Hosted on Vercel for constant up-time.

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, Axios, React Router.
- **Backend**: Python, Flask, Flask-CORS.
- **Database & Auth**: Firebase (Firestore & Authentication).
- **AI Engine**: Google Generative AI (Gemini).
- **Deployment**: Vercel.

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables:

### Backend (`api/.env`)
`GOOGLE_API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/).
`FIREBASE_SERVICE_ACCOUNT`: (For production) Your Firebase service account JSON string.

### Frontend (`frontend/.env`)
`GENERATE_SOURCEMAP=false`

## 🏃 Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/bsaiyashwant/ConvoBot.git
cd ConvoBot
```

### 2. Setup Backend
```bash
cd api
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python index.py
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install
npm start
```

## 📄 License
Created with ❤️ by team podmAAn.
