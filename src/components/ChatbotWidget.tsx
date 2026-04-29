"use client";
/**
 * FORCE REBUILD - 2026-04-21 17:53
 * Fixed syntax errors and removed framer-motion dependencies.
 */

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  timestamp: Date;
}

const QUICK_REPLIES = [
  "Món chạy nhất hôm nay",
  "Combo khuyến mãi",
  "Tìm món lẩu",
  "Quán còn bàn cho 2 người không?",
  "Địa chỉ và giờ mở cửa?",
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Xin chào! Em là trợ lý ảo của quán Ngon 🍜 Em có thể giúp anh/chị kiểm tra bàn trống, món ăn, hoặc đặt chỗ. Anh/chị cần hỗ trợ gì ạ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
      if (!isOpen) setUnreadCount(1);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const addMessage = (role: "bot" | "user", text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, text, timestamp: new Date() },
    ]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    addMessage("user", text);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/webhook/dialogflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-dialogflow-token": "your-secret-dialogflow-token",
        },
        body: JSON.stringify({
          queryResult: {
            queryText: text,
            intent: { displayName: text.includes("hủy") ? "cancel_reservation" : text.includes("kiểm tra") ? "check_reservation" : "default" },
            parameters: text.includes("09") ? { phone_number: text.match(/0\d{9}/)?.[0] } : {},
          },
        }),
      });

      const data = await res.json();
      
      setTimeout(() => {
        addMessage("bot", data.fulfillmentText || "Dạ em gặp chút lỗi, anh/chị thử lại sau nhé!");
        setIsLoading(false);
        if (!isOpen) setUnreadCount(prev => prev + 1);
      }, 1000);

    } catch (error) {
      setTimeout(() => {
        addMessage("bot", "Dạ kết nối với hệ thống đang gián đoạn. Anh/chị vui lòng gọi 0909 123 456 để được hỗ trợ nhanh nhất ạ!");
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
        {showTooltip && !isOpen && (
            <div 
              className="bg-white dark:bg-zinc-900 p-4 rounded-3xl rounded-br-sm shadow-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 max-w-[280px] cursor-pointer group animate-fade-in" 
              onClick={() => setIsOpen(true)}
            >
              <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 leading-snug">
                Chào bạn! Mình có thể giúp gì cho bữa ăn hôm nay không?
              </p>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }} 
                className="absolute -top-2 -right-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

        <button
          onClick={() => { setIsOpen(!isOpen); setShowTooltip(false); }}
          className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center relative hover:scale-105 active:scale-95 ${
            isOpen ? "bg-zinc-900 rotate-90" : "bg-primary shadow-orange-500/20"
          }`}
        >
          {isOpen ? <X className="w-7 h-7 text-white" /> : <MessageCircle className="w-7 h-7 text-white" />}
          
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-white dark:border-zinc-950">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
          <div 
            className="fixed bottom-24 right-6 z-50 w-[90vw] sm:w-[400px] h-[600px] max-h-[80vh] flex flex-col bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-fade-in font-sans"
          >
            <div className="p-6 bg-white dark:bg-zinc-900 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-secondary border-2 border-white dark:border-zinc-900 rounded-full" />
                </div>
                <div>
                  <h4 className="font-black text-zinc-900 dark:text-white leading-none">Trợ lý Quán Ngon</h4>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Trực tuyến</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
              {messages.map((msg, idx) => {
                const isBot = msg.role === "bot";
                const showAvatar = isBot && (idx === 0 || messages[idx-1].role === "user");
                
                return (
                  <div key={msg.id} className={`flex items-end gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
                    {isBot && (
                      <div className={`w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-sm shrink-0 transition-opacity ${showAvatar ? "opacity-100" : "opacity-0"}`}>
                        🍜
                      </div>
                    )}
                    <div className="flex flex-col gap-1 max-w-[75%]">
                      <div className={`px-5 py-3 rounded-3xl text-sm font-medium leading-relaxed ${
                        isBot 
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-sm" 
                          : "bg-primary text-white rounded-br-sm shadow-lg shadow-orange-500/20"
                      }`}>
                        {msg.text}
                      </div>
                      <span className={`text-[9px] font-bold text-zinc-300 dark:text-zinc-600 uppercase tracking-tighter ${isBot ? "text-left ml-1" : "text-right mr-1"}`}>
                        {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-sm shrink-0">
                    🍜
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 px-5 py-3 rounded-3xl rounded-bl-sm flex gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-6 pb-2 overflow-x-auto no-scrollbar flex gap-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="whitespace-nowrap px-4 py-2 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-primary dark:text-orange-400 border border-orange-100 dark:border-orange-500/20 text-[11px] font-black uppercase tracking-tight hover:bg-primary hover:text-white transition-all active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-50 dark:border-zinc-800">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder="Hỏi em bất cứ điều gì..."
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:ring-2 focus:ring-primary dark:text-white outline-none transition-all placeholder:text-zinc-400"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-10 h-10 bg-secondary text-white rounded-xl flex items-center justify-center hover:bg-amber-600 disabled:opacity-40 transition-all active:scale-90"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
