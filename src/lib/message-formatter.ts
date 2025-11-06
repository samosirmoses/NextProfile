import { MESSAGE_CONFIG } from "./constants";

export function splitMessageIntoBubbles(message: string): string[] {
  const cleanedMessage = message.trim();

  if (!cleanedMessage) {
    return ["No response generated."];
  }

  const { MAX_WORDS_PER_BUBBLE, MAX_BUBBLES } = MESSAGE_CONFIG;
  const messageParts: string[] = [];

  // Pisahkan berdasarkan paragraf
  const paragraphs = cleanedMessage
    .split(/\n\n+/)
    .filter(p => p.trim() !== '');

  if (paragraphs.length < 1) {
    return [cleanedMessage];
  }

  let currentBubble = '';
  let currentWordCount = 0;

  for (const paragraph of paragraphs) {
    const sentences = paragraph.split(/([.?!])\s+/) || [paragraph];

    for (const sentence of sentences) {
      const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean);
      const sentenceWordCount = sentenceWords.length;

      if (
        currentWordCount + sentenceWordCount > MAX_WORDS_PER_BUBBLE &&
        currentBubble.trim()
      ) {
        messageParts.push(currentBubble.trim());
        currentBubble = sentence.trim();
        currentWordCount = sentenceWordCount;
      } else {
        currentBubble += (currentBubble ? ' ' : '') + sentence.trim();
        currentWordCount += sentenceWordCount;
      }

      if (messageParts.length >= MAX_BUBBLES - 1) {
        break;
      }
    }

    if (messageParts.length >= MAX_BUBBLES - 1) {
      break;
    }

    if (currentWordCount < MAX_WORDS_PER_BUBBLE * 0.8) {
      currentBubble += '\n\n';
    }
  }

  if (currentBubble.trim()) {
    messageParts.push(currentBubble.trim());
  }

  if (messageParts.length >= MAX_BUBBLES) {
    const totalAddedWords = messageParts.reduce(
      (sum, part) => sum + part.split(/\s+/).filter(Boolean).length,
      0
    );
    const allWords = cleanedMessage.split(/\s+/).filter(Boolean);

    if (totalAddedWords < allWords.length) {
      const remainingText = allWords.slice(totalAddedWords).join(' ');
      if (remainingText.trim()) {
        messageParts[messageParts.length - 1] += ' ' + remainingText.trim();
      }
    }
  }

  if (messageParts.length === 0) {
    return [cleanedMessage];
  }

  return messageParts;
}

