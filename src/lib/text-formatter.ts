/**
 * Utility functions to clean and format AI responses
 * Removes excessive Markdown formatting while keeping simple structure
 */

/**
 * Remove problematic Markdown but keep simple formatting
 */
export function stripMarkdown(text: string): string {
  let cleaned = text;
  
  // Remove bold: **text** or __text__
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');
  cleaned = cleaned.replace(/__(.+?)__/g, '$1');
  
  // Remove italic: *text* (single asterisk) but NOT bullet points
  // Only remove if it's clearly italic (surrounded by text)
  cleaned = cleaned.replace(/(\w)\*(.+?)\*(\w)/g, '$1$2$3');
  
  // Remove headings: # ## ###
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // KEEP bullet points and numbered lists - they're useful!
  // We'll normalize them instead of removing
  
  // Remove code blocks: ```code``` (using [\s\S] instead of 's' flag)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code: `code`
  cleaned = cleaned.replace(/`(.+?)`/g, '$1');
  
  // Remove strikethrough: ~~text~~
  cleaned = cleaned.replace(/~~(.+?)~~/g, '$1');
  
  // Clean up multiple spaces
  cleaned = cleaned.replace(/[ \t]+/g, ' ');
  
  // Clean up multiple newlines (keep max 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

/**
 * Format text for better readability in chat
 * Keeps bullet points and lists for structure
 */
export function formatForChat(text: string): string {
  // Strip problematic markdown but keep structure
  let formatted = stripMarkdown(text);
  
  // Normalize bullet points to simple dash format
  formatted = formatted.replace(/^[\s]*[•*]\s+/gm, '- ');
  
  // Ensure proper spacing after periods
  formatted = formatted.replace(/\.(\S)/g, '. $1');
  
  // Ensure proper spacing after commas
  formatted = formatted.replace(/,(\S)/g, ', $1');
  
  // Clean up extra whitespace but preserve line breaks
  formatted = formatted.split('\n').map(line => line.trim()).join('\n');
  
  return formatted;
}

/**
 * Check if text contains problematic Markdown formatting
 */
export function hasMarkdown(text: string): boolean {
  const markdownPatterns = [
    /\*\*.*?\*\*/,  // Bold
    /__.*?__/,      // Bold alt
    /^#{1,6}\s/m,   // Headings
    /```[\s\S]*?```/,   // Code blocks (using [\s\S] instead of 's' flag)
    /`.*?`/,        // Inline code
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
}