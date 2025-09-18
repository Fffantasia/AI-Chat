import React from "react";
import "./App.css";
import Chat from "components/Chat/Chat";

function App() {
  return (
    <main>
      <h1 className="chat-title">Juniper Chat</h1>
      <div className="chat-container">
        <Chat />
      </div>
    </main>
  );
}

export default App;
