"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chat } from "@/ai/flows/chat-flow";
import { getSubjects, getTopics } from "@/lib/data";

interface Message {
  sender: "user" | "ai";
  text: string;
}

export function AIChat({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      sender: "ai",
      text: "Hello! I'm your SyllabiQ assistant. How can I help you with your studies or the platform today?",
    },
  ]);
  const [inputValue, setInputValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [userData, setUserData] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole");
      const data = localStorage.getItem("onboardingData");
      setUserRole(role);
      if (data) {
        setUserData(JSON.parse(data));
      }
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === "" || isTyping) return;

    const userMessage: Message = { sender: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await chat({
        message: inputValue,
        userRole: userRole || "Student",
        userData: userData || {},
        subjects: getSubjects(),
        topics: getTopics(),
      });
      
      const aiMessage: Message = { sender: "ai", text: response };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error("AI chat error:", error);
      const errorMessage: Message = {
        sender: "ai",
        text: "Sorry, I'm having a little trouble thinking right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-lg h-[70vh] bg-card rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold">AI Assistant</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.sender === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.sender === "ai" && (
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    </Avatar>
                  )}
                   <div
                    className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                 <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
                    </Avatar>
                     <div className="max-w-xs p-3 rounded-2xl bg-secondary rounded-bl-none">
                         <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" />
                        </div>
                    </div>
                </div>
              )}
               <div ref={messagesEndRef} />
            </div>
            
            {/* Input Form */}
            <footer className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about a topic..."
                  className="flex-1"
                  autoComplete="off"
                />
                <Button type="submit" size="icon" disabled={isTyping}>
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
