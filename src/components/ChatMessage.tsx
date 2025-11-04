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
                <div className="mr-2 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                        MA
                    </div>
                </div>
            )}
            <div
                className={`p-3 max-w-[75%] ${
                    isUser
                        ? 'bg-blue-600 text-white rounded-lg rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-lg rounded-bl-sm border border-gray-200'
                } transition-all duration-200`}
                aria-label={isUser ? 'User message' : 'Bot message'}
            >
                {message.text}
            </div>
            {isUser && (
                <div className="ml-2 flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm font-semibold">
                        You
                    </div>
                </div>
            )}
        </div>
    );
}
