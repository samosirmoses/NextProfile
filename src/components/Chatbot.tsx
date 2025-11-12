"use client";
import React, {useState, useEffect, useRef} from "react";
import { ChatMessage } from "./ChatMessage";
import { sendQuestion } from "@/lib/sendQuestion";
import { useDeviceType } from "@/hooks/useDeviceType";
import { useChatContext } from "@/contexts/ChatContext";

interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
}

interface ChatbotProps {
    onClose?: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose: _onClose }) => {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hey there! 👋 I'm here to help you learn more about Moses. Ask me anything about his work experience, projects, or skills!",
            sender: "bot"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const deviceType = useDeviceType();
    const { conversationHistory, addMessage, clearHistory } = useChatContext();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessageText = inputText.trim();
        if (userMessageText === '' || isLoading) return;

        const newUserMessage: Message = {
            id: Date.now(),
            text: userMessageText,
            sender: "user"
        };

        setMessages(prevMessages => [...prevMessages, newUserMessage]);
        setInputText('');
        setIsLoading(true);

        // Add to conversation history
        addMessage({
            id: `user-${Date.now()}`,
            role: 'user',
            content: userMessageText,
            timestamp: new Date()
        });

        // Simpan pertanyaan ke Firestore (non-blocking)
        sendQuestion(userMessageText).catch(err => {
            console.error('Failed to save question:', err);
        });

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    message: userMessageText,
                    history: conversationHistory
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({message: 'Unable to connect to server.'}));
                const msgText = errorData?.message || 'Failed to connect to AI Assistant.';

                const errorMessage: Message = {
                    id: Date.now() + 1,
                    text: msgText,
                    sender: 'bot'
                };
                setMessages(prevMessages => [...prevMessages, errorMessage]);
                return;
            }

            const data = await response.json();

            if (!data || !data.message) {
                const msgText = 'Invalid response from AI Assistant.';
                const errorMessage: Message = {
                    id: Date.now() + 1,
                    text: msgText,
                    sender: 'bot'
                };
                setMessages(prevMessages => [...prevMessages, errorMessage]);
                return;
            }

            if (data.messageParts && Array.isArray(data.messageParts) && data.messageParts.length > 0) {
                for (let i = 0; i < data.messageParts.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, i === 0 ? 300 : 500));

                    const botResponse: Message = {
                        id: Date.now() + i + 1,
                        text: data.messageParts[i],
                        sender: "bot"
                    };

                    setMessages(prevMessages => [...prevMessages, botResponse]);
                }

                // Add complete response to conversation history
                addMessage({
                    id: `bot-${Date.now()}`,
                    role: 'assistant',
                    content: data.message,
                    timestamp: new Date()
                });
            } else {
                const botResponse: Message = {
                    id: Date.now() + 1,
                    text: data.message,
                    sender: "bot"
                };

                setMessages(prevMessages => [...prevMessages, botResponse]);

                // Add to conversation history
                addMessage({
                    id: `bot-${Date.now()}`,
                    role: 'assistant',
                    content: data.message,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            let errorText = "Sorry, there was a connection error. Please try again.";
            if (error instanceof Error) {
                errorText = error.message;
            }

            const errorMessage: Message = {
                id: Date.now() + 1,
                text: errorText,
                sender: "bot"
            }
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading && inputText.trim() !== '') {
            handleSendMessage({
                preventDefault: () => {},
            } as unknown as React.FormEvent);
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: 1,
                text: "Hey there! 👋 I'm here to help you learn more about Moses. Ask me anything about his work experience, projects, or skills!",
                sender: "bot"
            }
        ]);
        setInputText('');
        clearHistory();
        inputRef.current?.focus();
    };

    return (
        <div
            className="w-full h-full bg-gradient-to-b from-gray-50 to-white overflow-hidden flex flex-col"
            role="region" aria-label="Chatbot">
            {/* Header with Avatar */}
            <header className="relative px-4 sm:px-5 py-3 sm:py-4 md:py-5 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                {/* Decorative gradient line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                M
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        </div>
                        <div>
                            <h2 className="text-base md:text-lg font-bold text-gray-900">
                                Moses
                            </h2>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Available now
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="text-xs font-medium text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-1"
                            onClick={handleClearChat}
                            aria-label="Clear chat"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 overflow-y-auto space-y-4" role="list">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg}/>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-2 px-4 py-3 bg-white text-gray-600 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef}/>
            </div>

            {/* Input Area */}
            <footer className="p-3 sm:p-4 md:p-5 border-t border-gray-200 bg-white">
                {/* Quick suggestions */}
                {messages.length === 1 && !isLoading && (
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                        {['Experience', 'Skills', 'Projects'].map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => setInputText(`Tell me about Moses' ${suggestion.toLowerCase()}`)}
                                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full whitespace-nowrap transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={deviceType === 'mobile' ? "Type a message..." : "Ask me anything about Moses..."}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-3 text-sm md:text-base
                                     bg-gray-50 border border-gray-200 rounded-2xl
                                     text-gray-900 placeholder-gray-400
                                     focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                     transition-all"
                            aria-label="Message input"
                            autoComplete="off"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`
                            flex items-center justify-center
                            w-12 h-12 rounded-2xl
                            transition-all duration-200
                            ${inputText.trim() === '' || isLoading
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                            }
                        `}
                        disabled={inputText.trim() === '' || isLoading}
                        aria-label="Send message"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        )}
                    </button>
                </form>

                {/* Footer text */}
                <p className="text-xs text-center text-gray-400 mt-3">
                    Powered by AI • Response time ~2s
                </p>
            </footer>
        </div>
    );
};

export default Chatbot;