import { Injectable } from "@nestjs/common";
import sanitizeHtml from "sanitize-html";

@Injectable()
export class ModerationService {
  sanitizeContent(content: string): string {
    return sanitizeHtml(content, {
      allowedTags: [
        "b",
        "i",
        "em",
        "strong",
        "a",
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "blockquote",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ],
      allowedAttributes: {
        a: ["href", "title", "target"],
        img: ["src", "alt"],
      },
    });
  }

  containsProfanity(content: string): boolean {
    const profanityWords = ["bad", "inappropriate"]; // Add your list
    const lowerContent = content.toLowerCase();
    return profanityWords.some((word) => lowerContent.includes(word));
  }
}
