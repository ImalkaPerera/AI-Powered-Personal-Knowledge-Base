import { useState, useRef, useEffect } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I have read your documents. Ask me anything about them." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    
    // 1. Add User Message immediately
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // 2. Call Backend
      const { data } = await api.post("/chat", { message: userMessage });
      
      // 3. Add AI Response
      setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
    } catch (error) {
      console.error("Chat failed", error);
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto p-6"> 
      {/* Header */}
      <div className="mb-4 flex items-center gap-2 border-b pb-4">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-800">AI Assistant</h1>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200 shadow-inner">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-blue-600" : "bg-purple-600"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4">
        <form
          onSubmit={handleSend}
          className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 outline-none text-gray-700 placeholder-gray-400"
            placeholder="Ask about your documents..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
      </div>
    </Layout>
  );
};

export default Chat;