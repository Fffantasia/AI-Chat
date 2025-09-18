import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import { FiCopy, FiCheck } from "react-icons/fi";
import { IoSend, IoStop, IoArrowDown } from "react-icons/io5";
import ThemeToggle from "components/ThemeToggle/ThemeToggle";
import ClearButton from "components/ClearButton/ClearButton";

const loadingPhrases = [
  "Cargando la inteligencia artificial",
  "Desenrollando parámetros neuronales",
  "Despertando a Falcon 🦅",
  "Preparando respuestas brillantes",
  "Haciendo café para la IA ☕️",
  "Pensando en chistes inteligentes",
  "Conectando sinapsis digitales",
  "Optimizando tokens y pensamientos"
]

export default function Chat() {
  const [currentPhrase, setCurrentPhrase] = useState(loadingPhrases[0]);
  const lastPhrasesRef = useRef([loadingPhrases[0]]);
  const [isPhraseFading, setIsPhraseFading] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const controllerRef = useRef(null);
  const textareaRef = useRef(null);
  const thinkingIntervalRef = useRef(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    //Check if model is ready
    const checkModelReady = async () => {
      try {
        const res = await fetch("http://localhost:8000/status");
        const data = await res.json();
        if (data.ready && !data.busy) {
          setIsModelReady(true);
        } else {
          setTimeout(checkModelReady, 2000);
        }
      } catch (err) {
        setTimeout(checkModelReady, 2000);
      }
    };
    checkModelReady();

    //Interval for loading phrases
    const interval = setInterval(() => {
      setIsPhraseFading(true);
      setTimeout(() => {
        const recent = lastPhrasesRef.current.slice(-2);
        let newPhrase;
        do {
          newPhrase = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
        } while (recent.includes(newPhrase));

        lastPhrasesRef.current.push(newPhrase);
        setCurrentPhrase(newPhrase);
        setIsPhraseFading(false);
      }, 300);
    }, 2500);

    const savedChat = localStorage.getItem("currentChat");
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
      scrollToBottom();
    }

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant" && last.content?.startsWith("Pensando")) return;

    if (messages.length > 0) {
      localStorage.setItem("currentChat", JSON.stringify(messages));
    }
  }, [messages]);

  const handleClearChat = () => {
    handleStop();
    setShowScrollButton(false);
    localStorage.removeItem("currentChat");
    setMessages([]);
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;

    const maxLines = 8;
    const lineHeight = 24;
    const maxHeight = maxLines * lineHeight;

    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";

    textarea.scrollTop = textarea.scrollHeight;
  };

  const scrollToBottom = () => {
    const chatBox = chatBoxRef.current;
    if (!chatBox) return;
    requestAnimationFrame(() => {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
      });
    });
  };

  const handleScroll = () => {
    const chatBox = chatBoxRef.current;
    const isAtBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < 40;
    setShowScrollButton(!isAtBottom);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    let assistantMessage = "";
    const streamedMessages = [...updatedMessages];
    setMessages([
      ...streamedMessages,
      { role: "assistant", content: "Pensando..." }
    ]);
    scrollToBottom();

    let dotCount = 1;
    thinkingIntervalRef.current = setInterval(() => {
      dotCount = (dotCount % 3) + 1;
      const dots = ".".repeat(dotCount);
      setMessages([
        ...streamedMessages,
        { role: "assistant", content: `Pensando${dots}` }
      ]);
    }, 500);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
        signal: controller.signal
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (thinkingIntervalRef.current) {
          clearInterval(thinkingIntervalRef.current);
          thinkingIntervalRef.current = null;
        }
        assistantMessage += chunk;

        setMessages([
          ...streamedMessages,
          { role: "assistant", content: assistantMessage }
        ]);
        scrollToBottom();
      }
    } catch (err) {
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }

      //Clear the messages progressively if the processing is aborted
      if (err.name === "AbortError") {
        //Clear AI message
        for (let i = assistantMessage.length; i >= 0; i--) {
          await new Promise((r) => setTimeout(r, 15));
          const shortened = assistantMessage.slice(0, i);
          setMessages([
            ...streamedMessages,
            { role: "assistant", content: shortened }
          ]);
        }

        //Clear user message
        for (let i = input.length; i >= 0; i--) {
          await new Promise((r) => setTimeout(r, 15));
          const userShortened = input.slice(0, i);
          setMessages([
            ...messages,
            { role: "user", content: userShortened }
          ]);
        }

        setMessages(messages);
      } else {
        console.error("Error al enviar mensaje:", err);
        setMessages([
          ...updatedMessages,
          { role: "assistant", content: "⚠️ Error al generar respuesta." }
        ]);
      }
    } finally {
      setIsLoading(false);
      if (thinkingIntervalRef.current) {
        clearInterval(thinkingIntervalRef.current);
        thinkingIntervalRef.current = null;
      }
      controllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (controllerRef.current) controllerRef.current.abort();
  };

  if (!isModelReady) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className={`loading-phrase ${isPhraseFading ? "fade-out" : ""}`}>{currentPhrase}</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-toolbar">
        <ThemeToggle />
        <ClearButton handleClear={handleClearChat}/>
      </div>

      <div className="chat-box" ref={chatBoxRef} onScroll={handleScroll}>
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-chat-message">
              👋 Escribe tu primera pregunta para comenzar la conversación
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-header">
                  {msg.role === "assistant" && msg.content && (
                    <>
                      <strong>🤖 Asistente</strong>
                      {!isLoading && (
                        <button
                          className="copy-button"
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedMessageIndex(idx);
                            setTimeout(() => setCopiedMessageIndex(null), 2000);
                          }}
                          title="Copiar"
                        >
                          {copiedMessageIndex === idx ? <FiCheck /> : <FiCopy />}
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))
          )}
        </div>

        <button
          className={`scroll-to-bottom-button ${showScrollButton ? "visible" : ""}`}
          onClick={scrollToBottom}
        >
          <IoArrowDown size={28} />
        </button>
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            adjustTextareaHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Esperando respuesta..." : "Escribe tu mensaje..."}
          disabled={isLoading}
          rows={1}
        />
        <div className="chat-button-wrapper">
          {isLoading && <div className="chat-button-loader" />}
          <button
            className="chat-button"
            onClick={isLoading ? handleStop : handleSend}
          >
            {isLoading ? <IoStop size={20} /> : <IoSend size={20} />}
          </button>
        </div>
      </div>
    </div >
  );
}