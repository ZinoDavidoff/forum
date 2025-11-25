import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { Router } from "@angular/router";
import { Thread, Category, Post, User } from "../../../core/models/models";

@Component({
  selector: "app-search-dropdown",
  templateUrl: "./search-dropdown.component.html",
  styleUrls: ["./search-dropdown.component.css"],
})
export class SearchDropdownComponent implements OnChanges {
  @Input() searchQuery: string = "";
  @Input() threads: Thread[] = [];
  @Input() categories: Category[] = [];
  @Input() posts: Post[] = [];
  @Input() profiles: User[] = [];
  @Input() threadsTotal: number = 0;
  @Input() categoriesTotal: number = 0;
  @Input() postsTotal: number = 0;
  @Input() profilesTotal: number = 0;
  @Input() isLoading: boolean = false;

  @Output() loadMoreThreads = new EventEmitter<void>();
  @Output() loadMoreCategories = new EventEmitter<void>();
  @Output() loadMorePosts = new EventEmitter<void>();
  @Output() loadMoreProfiles = new EventEmitter<void>();
  @Output() closeDropdown = new EventEmitter<void>();

  displayedThreads: Thread[] = [];
  displayedCategories: Category[] = [];
  displayedPosts: Post[] = [];
  displayedProfiles: User[] = [];

  readonly MAX_ITEMS = 5;

  // Track if we're loading more for each section
  isLoadingMore = {
    threads: false,
    categories: false,
    posts: false,
    profiles: false,
  };

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges) {
    // When threads change, check if we're loading more or resetting
    if (changes["threads"]) {
      if (this.isLoadingMore.threads) {
        // When loading more, the parent component appends to threads array
        // So we just update displayedThreads to show all threads
        this.displayedThreads = this.threads;
        this.isLoadingMore.threads = false;
      } else {
        // Reset to first page - show up to MAX_ITEMS
        this.displayedThreads = this.threads.slice(0, this.MAX_ITEMS);
      }
    }

    if (changes["categories"]) {
      if (this.isLoadingMore.categories) {
        this.displayedCategories = this.categories;
        this.isLoadingMore.categories = false;
      } else {
        this.displayedCategories = this.categories.slice(0, this.MAX_ITEMS);
      }
    }

    if (changes["posts"]) {
      if (this.isLoadingMore.posts) {
        this.displayedPosts = this.posts;
        this.isLoadingMore.posts = false;
      } else {
        this.displayedPosts = this.posts.slice(0, this.MAX_ITEMS);
      }
    }

    if (changes["profiles"]) {
      if (this.isLoadingMore.profiles) {
        this.displayedProfiles = this.profiles;
        this.isLoadingMore.profiles = false;
      } else {
        this.displayedProfiles = this.profiles.slice(0, this.MAX_ITEMS);
      }
    }
  }

  onLoadMoreThreads() {
    this.isLoadingMore.threads = true;
    this.loadMoreThreads.emit();
  }

  onLoadMoreCategories() {
    this.isLoadingMore.categories = true;
    this.loadMoreCategories.emit();
  }

  onLoadMorePosts() {
    this.isLoadingMore.posts = true;
    this.loadMorePosts.emit();
  }

  onLoadMoreProfiles() {
    this.isLoadingMore.profiles = true;
    this.loadMoreProfiles.emit();
  }

  /**
   * Highlight search terms in text
   * Handles both exact phrase and individual words
   * Also highlights partial matches
   */
  highlightText(text: string, query: string): string {
    if (!query || !text) return text;

    // Escape special regex characters
    const escapeRegex = (str: string) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    // Split text into parts that are already highlighted and parts that aren't
    // This prevents double highlighting
    const parts: Array<{ text: string; isHighlighted: boolean }> = [];
    let remainingText = text;
    let lastIndex = 0;

    // First, mark exact phrase matches
    const exactPhrase = escapeRegex(query);
    const exactRegex = new RegExp(exactPhrase, "gi");
    let match;
    const exactMatches: Array<{ start: number; end: number }> = [];

    while ((match = exactRegex.exec(text)) !== null) {
      exactMatches.push({
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    // Now mark individual word matches (if query has multiple words)
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2); // Only words longer than 2 chars

    const wordMatches: Array<{ start: number; end: number }> = [];

    // Always search for individual words if we have multiple words OR no exact matches
    // This ensures we highlight even when searching by words
    if (words.length > 1 || exactMatches.length === 0) {
      words.forEach((word) => {
        const wordRegex = new RegExp(escapeRegex(word), "gi");
        // Reset regex lastIndex to ensure we find all matches
        wordRegex.lastIndex = 0;
        let wordMatch: RegExpExecArray | null;
        while ((wordMatch = wordRegex.exec(text)) !== null) {
          // Check if this match overlaps with an exact match
          const overlaps = exactMatches.some(
            (exact) =>
              wordMatch!.index < exact.end &&
              wordMatch!.index + wordMatch![0].length > exact.start
          );
          if (!overlaps) {
            // Also check if this word match overlaps with any existing word match
            const overlapsWordMatch = wordMatches.some(
              (wm) =>
                wordMatch!.index < wm.end &&
                wordMatch!.index + wordMatch![0].length > wm.start
            );
            if (!overlapsWordMatch) {
              wordMatches.push({
                start: wordMatch.index,
                end: wordMatch.index + wordMatch[0].length,
              });
            }
          }
        }
      });
    }

    // Combine and sort all matches
    const allMatches = [...exactMatches, ...wordMatches].sort(
      (a, b) => a.start - b.start
    );

    // Merge overlapping matches
    const mergedMatches: Array<{ start: number; end: number }> = [];
    allMatches.forEach((match) => {
      const lastMatch = mergedMatches[mergedMatches.length - 1];
      if (lastMatch && match.start <= lastMatch.end) {
        lastMatch.end = Math.max(lastMatch.end, match.end);
      } else {
        mergedMatches.push({ ...match });
      }
    });

    // Build highlighted string
    let highlighted = "";
    let currentIndex = 0;

    mergedMatches.forEach((match) => {
      // Add text before match
      if (match.start > currentIndex) {
        highlighted += text.substring(currentIndex, match.start);
      }
      // Add highlighted match
      highlighted += `<mark class="search-highlight">${text.substring(
        match.start,
        match.end
      )}</mark>`;
      currentIndex = match.end;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      highlighted += text.substring(currentIndex);
    }

    return highlighted || text; // Fallback to original text if something went wrong
  }

  navigateToThread(thread: Thread) {
    this.router.navigate(["/threads", thread.id]);
    this.closeDropdown.emit();
  }

  navigateToCategory(category: Category) {
    // Navigate to home page with categoryId query parameter
    this.router.navigate(["/"], { queryParams: { categoryId: category.id } });
    this.closeDropdown.emit();
  }

  navigateToPost(post: Post) {
    if (post.thread) {
      // Navigate to thread detail page (posts are displayed within threads)
      this.router.navigate(["/threads", post.thread.id]);
      this.closeDropdown.emit();
    }
  }

  navigateToProfile(profile: User) {
    this.router.navigate(["/profile", profile.id]);
    this.closeDropdown.emit();
  }

  /**
   * Truncate text to show search term in context
   * Finds the search term (exact phrase or individual words) and shows surrounding text
   */
  truncateText(text: string, query: string, maxLength: number = 100): string {
    if (!text) return "";
    if (!query) {
      return text.length <= maxLength
        ? text
        : text.substring(0, maxLength) + "...";
    }

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // First try to find exact phrase
    let queryIndex = lowerText.indexOf(lowerQuery);

    // If exact phrase not found, try to find any matching word
    if (queryIndex === -1) {
      const words = query
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 2);

      // Find the first matching word
      for (const word of words) {
        const wordIndex = lowerText.indexOf(word);
        if (wordIndex !== -1) {
          queryIndex = wordIndex;
          break;
        }
      }
    }

    // If still not found, return beginning
    if (queryIndex === -1) {
      return text.length <= maxLength
        ? text
        : text.substring(0, maxLength) + "...";
    }

    // Calculate start position to center around search term
    const contextLength = Math.floor(maxLength / 2);
    let start = Math.max(0, queryIndex - contextLength);

    // Try to start at word boundary
    if (start > 0) {
      const wordBoundary = text.lastIndexOf(" ", start);
      if (wordBoundary > start - 20) {
        start = wordBoundary + 1;
      }
    }

    let end = Math.min(text.length, start + maxLength);

    // Try to end at word boundary
    if (end < text.length) {
      const wordBoundary = text.indexOf(" ", end);
      if (wordBoundary > 0 && wordBoundary < end + 20) {
        end = wordBoundary;
      }
    }

    let result = text.substring(start, end);

    // Add ellipsis if needed
    if (start > 0) {
      result = "..." + result;
    }
    if (end < text.length) {
      result = result + "...";
    }

    return result;
  }

  get hasResults(): boolean {
    return (
      this.threads.length > 0 ||
      this.categories.length > 0 ||
      this.posts.length > 0 ||
      this.profiles.length > 0
    );
  }
}
