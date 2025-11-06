'use client';

import { useState } from "react";
import { useDeviceType } from "@/hooks/useDeviceType";
import Chatbot from "./Chatbot";

export default function ChatWindow() {
    const [isOpen, setIsOpen] = useState(false);
    const deviceType = useDeviceType();

    return (
        <>
            {/* Chat Button - Professional design */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-5 right-5 md:bottom-8 md:right-8
                           w-16 h-16 md:w-[70px] md:h-[70px]
                           bg-gradient-to-br from-indigo-600 to-purple-600
                           hover:from-indigo-700 hover:to-purple-700
                           rounded-2xl shadow-2xl
                           flex items-center justify-center
                           transition-all duration-300 z-50
                           hover:scale-105 hover:rotate-3
                           group"
                aria-label="Chat with Moses"
            >
                <svg
                    className="w-8 h-8 md:w-9 md:h-9 text-white group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                </svg>
                {/* Notification dot */}
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    {deviceType === 'mobile' && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                            onClick={() => setIsOpen(false)}
                        />
                    )}

                    {/* Chat Container */}
                    <div
                        className={`
                            fixed z-50 bg-white
                            ${deviceType === 'mobile'
                                ? 'inset-0 m-0 rounded-none'
                                : deviceType === 'tablet'
                                ? 'bottom-5 right-5 w-[90vw] max-w-md h-[650px] rounded-3xl'
                                : 'bottom-28 right-8 w-[440px] h-[680px] rounded-3xl'
                            }
                            shadow-2xl border border-gray-200
                            transition-all duration-300
                        `}
                    >
                        {/* Close button for mobile */}
                        {deviceType === 'mobile' && (
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-5 right-5 z-10
                                           w-11 h-11
                                           bg-white/90 backdrop-blur-md
                                           text-gray-700 rounded-full
                                           flex items-center justify-center
                                           hover:bg-white transition-all
                                           shadow-lg border border-gray-200"
                                aria-label="Close chat"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}

                        {/* Chatbot Component */}
                        <Chatbot onClose={() => setIsOpen(false)} />
                    </div>
                </>
            )}
        </>
    );
}