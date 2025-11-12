import React from "react";

export interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
}

// Function to parse and format message text with proper bullet points and spacing
const formatMessageText = (text: string) => {
    // First, normalize the text by fixing common AI formatting issues
    let normalized = text
        // Fix bullet points that are inline with text
        .replace(/\s+-\s+/g, '\n- ')
        // Fix periods followed by dash (common AI mistake)
        .replace(/\.\s*-\s*/g, '.\n- ')
        // Fix double spaces
        .replace(/\s{2,}/g, ' ')
        // Ensure newline after colon when followed by dash
        .replace(/:\s*-\s*/g, ':\n- ')
        .trim();
    
    const lines = normalized.split('\n');
    const elements: JSX.Element[] = [];
    let inList = false;

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        // Skip empty lines but add spacing between sections
        if (!trimmedLine) {
            if (elements.length > 0 && inList) {
                elements.push(<div key={`space-${index}`} className="h-2"></div>);
            }
            inList = false;
            return;
        }

        // Check if line is a bullet point (starts with - or •)
        if (trimmedLine.match(/^[-•]\s+/)) {
            const bulletText = trimmedLine.replace(/^[-•]\s+/, '').trim();

            // Add top margin for first bullet in a list
            if (!inList && elements.length > 0) {
                elements.push(<div key={`margin-top-${index}`} className="h-2"></div>);
            }
            inList = true;

            elements.push(
                <div key={index} className="flex gap-2.5 items-start my-1">
                    <span className="text-indigo-600 font-bold text-lg leading-none mt-0.5 flex-shrink-0">•</span>
                    <span className="flex-1 text-gray-800 leading-relaxed">{bulletText}</span>
                </div>
            );
        }
        // Check if line is a numbered list (starts with number.)
        else if (trimmedLine.match(/^\d+\.\s+/)) {
            const match = trimmedLine.match(/^(\d+)\.\s+(.+)/);
            if (match) {
                const [, number, itemText] = match;

                // Add top margin for first item in a list
                if (!inList && elements.length > 0) {
                    elements.push(<div key={`margin-top-${index}`} className="h-2"></div>);
                }
                inList = true;

                elements.push(
                    <div key={index} className="flex gap-2.5 items-start my-1">
                        <span className="text-indigo-600 font-semibold leading-none mt-0.5 flex-shrink-0 min-w-[1.5rem]">{number}.</span>
                        <span className="flex-1 text-gray-800 leading-relaxed">{itemText}</span>
                    </div>
                );
            }
        }
        // Regular text line (paragraph or heading)
        else {
            // Add bottom margin after list ends
            if (inList && elements.length > 0) {
                elements.push(<div key={`margin-bottom-${index}`} className="h-2"></div>);
            }
            inList = false;

            // Check if it ends with colon (likely a heading/intro)
            if (trimmedLine.endsWith(':')) {
                elements.push(
                    <p key={index} className="font-semibold text-gray-900 mb-1 leading-relaxed">
                        {trimmedLine}
                    </p>
                );
            } else {
                elements.push(
                    <p key={index} className="text-gray-800 my-1.5 leading-relaxed">
                        {trimmedLine}
                    </p>
                );
            }
        }
    });

    return <div>{elements}</div>;
};

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
                        px-4 py-3 text-sm md:text-base
                        ${isUser
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-br-md shadow-md'
                            : 'bg-white text-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100'
                        }
                        break-words
                    `}
                    aria-label={isUser ? 'Your message' : 'Moses reply'}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    ) : (
                        formatMessageText(message.text)
                    )}
                </div>
                {isUser && (
                    <div className="flex-shrink-0 mb-1">
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold shadow-md">
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