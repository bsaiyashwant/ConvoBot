import React, { useState, useEffect } from "react";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { v4 as uuidv4 } from "uuid";
import Sidebar from "./Sidebar";
import ChatPanel from "./ChatPanel";

function App() {
  const [input, setInput] = useState("");
  const [chatSessions, setChatSessions] = useState({});
  const [currentSession, setCurrentSession] = useState("");

  useEffect(() => {
    // Create first session on load
    const id = uuidv4();
    setCurrentSession(id);
    setChatSessions({ [id]: [] });
  }, []);

  const switchSession = (id) => {
    setCurrentSession(id);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { user: input, bot: "..." };
    setChatSessions((prev) => ({
      ...prev,
      [currentSession]: [...(prev[currentSession] || []), userMsg],
    }));
    setInput("");

    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", {
        prompt: input,
        session_id: currentSession,
      });
      const botReply = res.data.reply;
      setChatSessions((prev) => {
        const updated = [...prev[currentSession]];
        updated[updated.length - 1].bot = botReply;
        return { ...prev, [currentSession]: updated };
      });
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById("chat-box");
    html2pdf().from(element).save("ConvoBot_Chat.pdf");
  };

  const newChat = () => {
    const id = uuidv4();
    setCurrentSession(id);
    setChatSessions((prev) => ({ ...prev, [id]: [] }));
  };

  return (
    <div className="flex h-screen">
      <Sidebar chats={chatSessions} currentId={currentSession} switchSession={switchSession} />
      <div className="flex flex-col w-3/4">
        <ChatPanel messages={chatSessions[currentSession] || []} />
        <div className="flex p-4 bg-gray-200 gap-2">
          <input
            type="text"
            className="flex-1 p-2 rounded border"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded">
            Send
          </button>
          <button onClick={newChat} className="bg-yellow-600 text-white px-4 rounded">
            New Chat
          </button>
          <button onClick={downloadPDF} className="bg-green-600 text-white px-4 rounded">
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
