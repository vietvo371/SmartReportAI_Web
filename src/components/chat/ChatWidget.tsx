"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
    id: number;
    role: "user" | "assistant" | "system";
    content: string;
    created_at: string;
}

interface ChatSession {
    id: number;
    messages: Message[];
}

const WELCOME_MESSAGE = `👋 Xin chào! Tôi là trợ lý AI của SmartReportAI.

Tôi có thể giúp bạn:
✅ Tạo báo cáo sự cố
✅ Hướng dẫn sử dụng hệ thống
✅ Trả lời thắc mắc
✅ Giải thích tính năng

Bạn muốn hỏi gì?`;

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionId, setSessionId] = useState<number | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Load chat history when opened
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            loadChatHistory();
        }
    }, [isOpen]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    const loadChatHistory = async () => {
        try {
            const response = await fetch("/api/chat");
            const data = await response.json();

            if (data.success && data.session) {
                setSessionId(data.session.id);
                setMessages(data.session.messages);
            } else {
                // Show welcome message for new users
                setMessages([
                    {
                        id: 0,
                        role: "assistant",
                        content: WELCOME_MESSAGE,
                        created_at: new Date().toISOString(),
                    },
                ]);
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now(),
            role: "user",
            content: inputValue,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);
        setIsTyping(true);

        try {
            // Prepare conversation history for API (last 10 messages for context)
            const conversationHistory = messages
                .slice(-10)
                .map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                }));

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: inputValue,
                    sessionId: sessionId,
                    conversationHistory: conversationHistory, // For anonymous users
                }),
            });

            const data = await response.json();

            if (data.success) {
                const aiMessage: Message = {
                    id: data.messageId || Date.now(),
                    role: "assistant",
                    content: data.message,
                    created_at: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, aiMessage]);

                // If authenticated, save session ID
                if (data.sessionId) {
                    setSessionId(data.sessionId);
                }
            } else {
                throw new Error(data.error || "Failed to send message");
            }
        } catch (error: any) {
            console.error("Send message error:", error);

            const errorMessage: Message = {
                id: Date.now(),
                role: "assistant",
                content: `❌ ${error.message || "Đã xảy ra lỗi. Vui lòng thử lại."}`,
                created_at: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm("Bạn có chắc muốn xóa toàn bộ lịch sử chat?")) return;

        try {
            const response = await fetch("/api/chat", { method: "DELETE" });
            const data = await response.json();

            if (data.success) {
                setMessages([
                    {
                        id: 0,
                        role: "assistant",
                        content: WELCOME_MESSAGE,
                        created_at: new Date().toISOString(),
                    },
                ]);
                setSessionId(null);
            }
        } catch (error) {
            console.error("Clear history error:", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-shadow"
                        aria-label="Open chat"
                    >
                        <Image
                            src="/images/chat/chatbot.png"
                            alt="Chat"
                            width={56}
                            height={56}
                            className="object-contain"
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-stroke bg-white shadow-2xl dark:border-strokedark dark:bg-boxdark"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-stroke bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 text-white dark:border-strokedark">
                            <div className="flex items-center gap-2">
                                <Image
                                    src="/images/chat/chatbot.png"
                                    alt="AI"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                />
                                <div>
                                    <h3 className="text-sm font-semibold">SmartReport AI</h3>
                                    <p className="text-xs opacity-90">Trợ lý thông minh</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleClearHistory}
                                    className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
                                    title="Xóa lịch sử"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-lg p-1.5 hover:bg-white/20 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-2 ${message.role === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-900 dark:bg-meta-4 dark:text-white"
                                            }`}
                                    >
                                        {message.role === "assistant" ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-meta-4 rounded-2xl px-4 py-3">
                                        <div className="flex gap-1">
                                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="border-t border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4">
                            <div className="flex items-end gap-2">
                                <textarea
                                    ref={inputRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Nhập tin nhắn... (Enter để gửi)"
                                    disabled={isLoading}
                                    rows={1}
                                    className="flex-1 resize-none rounded-xl border border-stroke bg-white px-4 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-strokedark dark:bg-boxdark dark:text-white disabled:opacity-50"
                                    style={{
                                        maxHeight: "120px",
                                        minHeight: "40px",
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Shift + Enter</span> để xuống dòng
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Fullscreen Overlay */}
            <style jsx global>{`
        @media (max-width: 640px) {
          .fixed.bottom-6.right-6.z-50.flex.h-\\[600px\\] {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            border-radius: 0;
            margin: 0;
          }
        }
      `}</style>
        </>
    );
}
