/**
 * Text formatting utilities for displaying content with proper formatting
 */

/**
 * Converts newline characters to HTML <br> tags
 * @param text - The text content with newline characters
 * @returns HTML string with <br> tags for line breaks
 */
export function newlineToBr(text: string): string {
  if (!text) return "";
  return text.replace(/\n/g, "<br>");
}

/**
 * Strips HTML tags from a string and returns plain text
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

/**
 * Truncates text to a specified length and adds ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param suffix - Suffix to add when truncated (default: "...")
 * @returns Truncated text with suffix if needed
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}

/**
 * Formats text for HTML display by converting newlines to <br> tags
 * and optionally stripping existing HTML
 * @param content - The content to format
 * @param stripExistingHtml - Whether to strip HTML tags first (default: false)
 * @returns Formatted HTML string
 */
export function formatTextForDisplay(
  content: string,
  stripExistingHtml: boolean = false
): string {
  if (!content) return "";

  let text = content;
  if (stripExistingHtml) {
    text = stripHtml(text);
  }

  return newlineToBr(text);
}
