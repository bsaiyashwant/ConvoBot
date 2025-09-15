import React from "react";

function ChatPanel({ messages }) {
  return (
    <div className="flex-1 p-4 h-screen overflow-y-auto bg-white" id="chat-box">
      {messages.map((msg, i) => (
        <div key={i} className="mb-4">
          <p><strong>You:</strong> {msg.user}</p>
          <p><strong>Bot:</strong> {msg.bot}</p>
        </div>
      ))}
    </div>
  );
}

export default ChatPanel;
