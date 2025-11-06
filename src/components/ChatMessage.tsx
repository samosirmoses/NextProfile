import React from "react";

export interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
}

export const ChatMessage: React.FC<{ message: Message }> = ({message}) => {
    const isUser = message.sender === "user";
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`} role="listitem">
            <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[75%]`}>
                {!isUser && (
                    <div className="flex-shrink-0 mb-1">
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-md">
                            M
                        </div>
                    </div>
                )}
                <div
                    className={`
                        px-4 py-2.5 md:py-3 text-sm md:text-base
                        ${isUser
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-br-md shadow-md'
                            : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                        }
                        break-words
                    `}
                    aria-label={isUser ? 'Your message' : 'Moses reply'}
                >
                    <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                </div>
                {isUser && (
                    <div className="flex-shrink-0 mb-1">
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
