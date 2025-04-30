import React from "react";
//import Chat from "@/components/Chat/Chat";
import Chat from "./components/Chat/Chat";

function App() {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Chat con IA</h1>
      <div style={{ height: '600px' }}>
        <Chat />
      </div>
    </div>
  );
}

export default App;
