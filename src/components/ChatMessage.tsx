import React from "react";

export interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
}

export const ChatMessage: React.FC<{ message: Message }> = ({message}) => {
    const isUser = message.sender === "user";
    return (
        <div className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'} w-full`} role="listitem">
            {!isUser && (
                <div className={"mr-2 flex-shrink-0"}>
                  <span
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center text-gray-700 font-bold shadow-md">
                      🤖
                  </span>
                </div>
            )}
            <div
                className={`p-3 max-w-[75%] shadow-lg backdrop-blur-md ${
                    isUser
                        ? 'bg-gradient-to-br from-gray-900 to-gray-700 text-white rounded-xl rounded-br-none'
                        : 'bg-white/70 text-gray-900 rounded-xl rounded-tl-none border border-gray-100'
                } transition-all duration-300`}
                aria-label={isUser ? 'User message' : 'Bot message'}
            >
                {message.text}
            </div>
            {isUser && (
                <div className="ml-2 flex-shrink-0">
                    <span
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-600 flex items-center justify-center text-white font-bold shadow-md">🧑</span>
                </div>
            )}
        </div>
    );
}
