"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
}

const QUICK_REPLIES = [
  "Quán còn bàn cho 2 người không?",
  "Hôm nay còn gà nướng không?",
  "Địa chỉ quán ở đâu?",
  "Giờ mở cửa mấy giờ?",
];

const STATIC_RESPONSES: Record<string, string> = {
  "địa chỉ": "Dạ quán ở 123 Nguyễn Huệ, Q.1, TP.HCM ạ! Anh/chị cần hướng dẫn đường đi không?",
  "giờ mở cửa": "Dạ quán mở cửa từ 10:00 sáng đến 10:00 tối mỗi ngày ạ!",
  "số điện thoại": "Dạ số điện thoại quán là 0909 123 456 ạ!",
  "phí dịch vụ": "Dạ quán không thu phí dịch vụ ạ. Chỉ tính tiền theo thực đơn!",
  "wifi": "Dạ quán có WiFi miễn phí ạ! Mật khẩu nhân viên sẽ cung cấp khi ngồi vào bàn.",
};

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Xin chào! Em là trợ lý ảo của quán 🍜 Em có thể giúp anh/chị kiểm tra bàn trống, món ăn, hoặc đặt chỗ. Hỏi em nhé!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackCount, setFallbackCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const addMessage = (role: "bot" | "user", text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role, text },
    ]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    addMessage("user", text);
    setInput("");
    setIsLoading(true);

    // Kiểm tra câu trả lời tĩnh trước
    const lower = text.toLowerCase();
    const staticKey = Object.keys(STATIC_RESPONSES).find((k) => lower.includes(k));
    if (staticKey) {
      setTimeout(() => {
        addMessage("bot", STATIC_RESPONSES[staticKey]);
        setIsLoading(false);
        setFallbackCount(0);
      }, 500);
      return;
    }

    // Gọi API kiểm tra bàn/món hoặc đặt bàn
    try {
      // Detect intent đơn giản phía client, gọi API backend
      let endpoint = "/api/webhook/dialogflow";
      let intentName = "default";

      if (lower.includes("bàn") || lower.includes("chỗ") || lower.includes("người")) {
        const match = lower.match(/(\d+)\s*người/);
        const partySize = match ? match[1] : "2";
        
        const res = await fetch("/api/tables");
        const { tables } = await res.json();
        const available = tables.filter(
          (t: any) => t.status === "EMPTY" && !t.lockedUntil
        );
        const fitting = available.filter((t: any) => t.capacity >= Number(partySize));
        
        if (fitting.length > 0) {
          addMessage(
            "bot",
            `Dạ hệ thống ghi nhận hiện đang có ${fitting.length} bàn phù hợp cho ${partySize} người ạ! ` +
            `Anh/chị cho em số điện thoại để nhân viên báo lại check thực tế và giữ chỗ cho mình nhé? 😊`
          );
        } else {
          const cleaning = tables.filter((t: any) => t.status === "CLEANING").length;
          if (cleaning > 0) {
            addMessage("bot", `Dạ hiện bàn đang được dọn dẹp ạ ☝️ Khoảng 5-10 phút nữa là có chỗ. Anh/chị chờ được không ạ?`);
          } else {
            addMessage("bot", `Dạ hiện tại quán đang khá đông, bàn chưa trống ạ 😢 Anh/chị muốn để lại số điện thoại không?`);
          }
        }
        setFallbackCount(0);
      } else if (lower.includes("còn") || lower.includes("hết") || lower.includes("món")) {
        const res = await fetch("/api/menu");
        const { items } = await res.json();
        
        // Tìm tên món trong câu hỏi
        const foundItem = items.find((item: any) =>
          lower.includes(item.name.toLowerCase().split(" ").slice(-1)[0])
        );
        
        if (foundItem) {
          if (foundItem.stockQuantity === 0 || !foundItem.isAvailable) {
            addMessage("bot", `Dạ rất tiếc, hôm nay quán đã hết "${foundItem.name}" rồi ạ 😢`);
          } else {
            addMessage(
              "bot",
              `Dạ món "${foundItem.name}" hiện còn ${foundItem.stockQuantity} suất, giá ${foundItem.price.toLocaleString("vi-VN")}đ ạ! Anh/chị muốn đặt bàn không ạ?`
            );
          }
        } else {
          addMessage("bot", `Dạ em tìm không thấy món đó trong thực đơn hôm nay ạ 🙏 Anh/chị muốn xem menu đầy đủ không?`);
        }
        setFallbackCount(0);
      } else {
        // Fallback
        const newCount = fallbackCount + 1;
        setFallbackCount(newCount);
        
        if (newCount >= 2) {
          // 🚨 PM FIX: Human Handoff sau 2 lần không hiểu
          addMessage(
            "bot",
            `Dạ yêu cầu này hơi chi tiết, để em báo nhân viên trực page nhảy vào hỗ trợ mình ngay nhé! Hoặc anh/chị gọi thẳng: 📞 0909 123 456 🙏`
          );
          setFallbackCount(0);
          // Trigger handoff notification
          fetch("/api/webhook/dialogflow", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-dialogflow-token": process.env.NEXT_PUBLIC_DIALOGFLOW_TOKEN || "",
            },
            body: JSON.stringify({
              queryResult: {
                queryText: text,
                intent: { displayName: "human_handoff" },
                parameters: { isHandoff: true },
              },
            }),
          }).catch(() => {});
        } else {
          addMessage(
            "bot",
            `Dạ em chưa hiểu lắm ạ 😅 Anh/chị có thể hỏi về bàn trống, món ăn, hoặc đặt chỗ nhé!`
          );
        }
      }
    } catch {
      addMessage("bot", "Dạ hệ thống đang bận, anh/chị thử lại sau hoặc gọi 0909 123 456 nhé!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4">
          {showTooltip && (
            <div className="bg-white px-4 py-3 rounded-2xl rounded-br-sm shadow-xl shadow-amber-500/10 border border-zinc-100 flex items-center gap-2 animate-bounce cursor-pointer relative" onClick={() => setIsOpen(true)}>
              <span className="text-sm font-medium text-zinc-700">
                👋 Chào bạn, mình là trợ lý Quán Ngon, bạn muốn đặt bàn ngay không?
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }} 
                className="absolute -top-2 -right-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                aria-label="Đóng tooltip"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <button
            onClick={() => { setIsOpen(true); setShowTooltip(false); }}
            className="w-16 h-16 rounded-full bg-amber-500 text-white shadow-2xl shadow-amber-300 hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center hover:scale-110 shrink-0"
            aria-label="Mở chatbot"
          >
            <MessageCircle className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
              1
            </span>
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px] flex flex-col bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                🤖
              </div>
              <div>
                <p className="font-black text-white text-sm">Trợ lý Quán</p>
                <p className="text-xs text-amber-100">Phản hồi trong vài giây</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: "360px" }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-amber-500 text-white rounded-tr-sm"
                      : "bg-zinc-100 text-zinc-800 rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-zinc-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span className="text-sm text-zinc-400">Đang trả lời...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-zinc-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Nhắn tin cho quán..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
