import { MESSAGE_CONFIG } from "./constants";

export function splitMessageIntoBubbles(message: string): string[] {
  const cleanedMessage = message.trim();

  if (!cleanedMessage) {
    return ["No response generated."];
  }

  const { MAX_WORDS_PER_BUBBLE, MAX_BUBBLES } = MESSAGE_CONFIG;
  const messageParts: string[] = [];

  // Split by double newlines to preserve bullet point structure
  const sections = cleanedMessage.split(/\n\n+/);

  let currentBubble = '';
  let currentWordCount = 0;

  for (const section of sections) {
    const sectionWords = section.split(/\s+/).filter(Boolean);
    const sectionWordCount = sectionWords.length;

    // If adding this section would exceed limit, start new bubble
    if (currentWordCount + sectionWordCount > MAX_WORDS_PER_BUBBLE && currentBubble.trim()) {
      messageParts.push(currentBubble.trim());
      currentBubble = section;
      currentWordCount = sectionWordCount;
    } else {
      // Add section to current bubble with proper spacing
      if (currentBubble) {
        currentBubble += '\n\n' + section;
      } else {
        currentBubble = section;
      }
      currentWordCount += sectionWordCount;
    }

    // Stop if we've reached max bubbles
    if (messageParts.length >= MAX_BUBBLES - 1) {
      break;
    }
  }

  // Add remaining content
  if (currentBubble.trim()) {
    messageParts.push(currentBubble.trim());
  }

  // If no parts were created, return original message
  if (messageParts.length === 0) {
    return [cleanedMessage];
  }

  return messageParts;
}
