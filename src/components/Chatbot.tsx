"use client";
import React, {useState, useEffect, useRef} from "react";
import { ChatMessage } from "./ChatMessage";

interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
}

const Chatbot: React.FC = () => {
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Halo! Saya Personal AI Assistant Kamu. Silakan ajukan pertanyaan apa pun tentang pengalaman dan keahlian Moses!",
            sender: "bot"
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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

        try {
                        const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: userMessageText})
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({message: 'Gagal terhubung ke server.'}));
                throw new Error(errorData.message || 'Gagal terhubung ke AI Assistant.');
            }

            const data = await response.json();

            if (!data || !data.message) {
                throw new Error('Respon tidak valid dari AI Assistant.');
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
            } else {
                const botResponse: Message = {
                    id: Date.now() + 1,
                    text: data.message,
                    sender: "bot"
                };

                setMessages(prevMessages => [...prevMessages, botResponse]);
            }
        } catch (error) {
            let errorText = "⚠️ Ups! Terjadi kesalahan koneksi.";
            if (error instanceof Error) {

                if (error.message.includes('⚠️')) {
                    errorText = error.message;
                } else {
                    errorText = `⚠️ ${error.message}`;
                }
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
                preventDefault: () => {
                },
            } as unknown as React.FormEvent);
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: 1,
                text: "Halo! Saya Personal AI Assistant Kamu. Silakan ajukan pertanyaan apa pun tentang pengalaman dan keahlian Moses!",
                sender: "bot"
            }
        ]);
        setInputText('');
        inputRef.current?.focus();
    };

    return (
        <div
            className="max-w-md w-full h-[800px] bg-gradient-to-br from-blue-50/80 via-white/60 to-gray-200/80 border border-blue-100 shadow-2xl rounded-3xl overflow-hidden flex flex-col font-sans backdrop-blur-xl"
            role="region" aria-label="Chatbot">
            {/* HEADER */}
            <header
                className="p-6 border-b border-blue-100 bg-white/50 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow"
                         aria-label="Online status"></div>
                    <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight" id="chatbot-title">
                        <span className="mr-2">💬</span> Moses AI Assistant
                    </h2>
                </div>
                <button
                    type="button"
                    className="text-xs text-gray-500 px-3 py-1 border border-blue-100 rounded-full hover:bg-blue-50 transition shadow"
                    onClick={handleClearChat}
                    aria-label="Clear chat"
                >
                    Clear
                </button>
            </header>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-transparent" role="list"
                 aria-labelledby="chatbot-title">
                {messages.map(msg => (
                    <ChatMessage key={msg.id} message={msg}/>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div
                            className="flex items-center gap-2 p-3 bg-white/70 text-gray-800 rounded-xl border border-gray-100 animate-pulse shadow-lg">
                            <span
                                className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                            Bot sedang mengetik...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef}/>
            </div>
            <footer className="p-6 border-t border-blue-100 bg-white/50 backdrop-blur-md">
                <form onSubmit={handleSendMessage} className="flex gap-2" aria-label="Send message">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Tanyakan tentang latar belakang karir saya..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 p-3 border border-blue-200 rounded-xl text-gray-900 bg-white/80 focus:outline-none focus:border-blue-400 transition duration-200 shadow-sm"
                        aria-label="Message input"
                        autoComplete="off"
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-br from-blue-600 to-blue-400 text-white font-semibold px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-500 transition duration-200 disabled:opacity-50 flex items-center justify-center shadow-lg"
                        disabled={inputText.trim() === '' || isLoading}
                        aria-label="Send message"
                    >
                        {isLoading ? (
                            <span className="flex items-center">
                                <span
                                    className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Mengirim...
                            </span>
                        ) : (
                            "Kirim"
                        )}
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chatbot;