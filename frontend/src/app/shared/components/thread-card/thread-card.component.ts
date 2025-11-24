import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Thread } from "../../../core/models/models";
import { newlineToBr, stripHtml } from "../../utils/text-formatter.util";
import {
  ReactionService,
  ReactionType,
} from "../../../core/services/reaction.service";
import { BookmarkService } from "../../../core/services/bookmark.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-thread-card",
  template: `
    <div class="thread-card card">
      <div class="thread-content" (click)="navigateToThread($event)">
        <div class="thread-meta">
          <img
            [src]="thread.author.avatar || 'assets/default-avatar.svg'"
            [alt]="thread.author.username"
            class="avatar avatar-sm"
          />
          <span class="author-name">{{ thread.author.username }}</span>
          <span class="dot">•</span>
          <span class="time-ago">{{ thread.createdAt | timeAgo }}</span>
          <div class="badge-container">
            <span *ngIf="thread.isPinned" class="badge badge-pink"
              ><i-lucide name="pin" [size]="16"></i-lucide
            ></span>
            <span *ngIf="thread.isLocked" class="badge badge-blue"
              ><i-lucide name="lock" [size]="16"></i-lucide
            ></span>
          </div>
        </div>

        <h3 class="thread-title">{{ thread.title }}</h3>
        <p class="thread-excerpt" [innerHTML]="getExcerptHtml()"></p>

        <div class="thread-actions">
          <button
            class="action-btn upvote-btn"
            [class.active]="userReaction === 'upvote'"
            (click)="handleUpvote($event)"
          >
            <i-lucide name="chevron-up" [size]="18"></i-lucide>
            {{ thread.upvoteCount || 0 | compactNumber }}
          </button>
          <button
            class="action-btn downvote-btn"
            [class.active]="userReaction === 'downvote'"
            (click)="handleDownvote($event)"
          >
            <i-lucide name="chevron-down" [size]="18"></i-lucide>
            {{ thread.downvoteCount || 0 | compactNumber }}
          </button>
          <button class="action-btn">
            <i-lucide name="message-square" [size]="18"></i-lucide>
            {{ thread.replyCount | compactNumber }}
          </button>
          <button class="action-btn" (click)="handleShare($event)">
            <i-lucide name="share" [size]="18"></i-lucide>
            Share
          </button>
          <button
            class="action-btn"
            [class.active]="isBookmarked"
            (click)="handleBookmark($event)"
          >
            <i-lucide
              [name]="isBookmarked ? 'bookmark-check' : 'bookmark'"
              [size]="18"
            ></i-lucide>
            {{ isBookmarked ? "Saved" : "Save" }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .thread-card {
        display: flex;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        cursor: pointer;
        margin-bottom: 0;
      }

      .thread-card:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-2px);
        border-color: var(--primary-200);
      }

      .thread-content {
        flex: 1;
        min-width: 0;
      }

      .thread-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        margin-bottom: var(--spacing-xs);
        font-size: 0.75rem;
        color: var(--text-light);
      }

      .author-name {
        font-weight: 600;
        color: var(--text-dark);
      }

      .dot {
        color: var(--gray-400);
      }

      .thread-title {
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: var(--spacing-xs);
        color: var(--text-dark);
      }

      .thread-excerpt {
        color: var(--text-light);
        margin-bottom: var(--spacing-sm);
        font-size: 0.875rem;
      }

      .thread-actions {
        display: flex;
        gap: var(--spacing-sm);
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: none;
        border: none;
        border-radius: 2px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-light);
        cursor: pointer;
        transition: all 0.1s ease;
      }

      .action-btn:hover {
        background: var(--gray-100);
      }

      .vote-btn {
        gap: 6px;
      }

      .badge-container {
        margin-left: auto;
      }

      .upvote-btn.active {
        color: var(--primary);
        background: var(--primary-50);
      }

      .downvote-btn.active {
        color: #ff6b6b;
        background: #ffebee;
      }

      .action-btn.active {
        color: var(--primary);
        background: var(--primary-50);
      }
    `,
  ],
})
export class ThreadCardComponent implements OnInit {
  @Input() thread!: Thread;
  userReaction: string | null = null;
  isBookmarked: boolean = false;
  currentUser: any = null;

  constructor(
    private reactionService: ReactionService,
    private bookmarkService: BookmarkService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Use data from thread if available (provided by backend)
    if (this.thread.userReaction !== undefined) {
      this.userReaction = this.thread.userReaction;
    }
    if (this.thread.isBookmarked !== undefined) {
      this.isBookmarked = this.thread.isBookmarked;
    }
  }

  handleUpvote(event: Event) {
    event.stopPropagation();
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }

    this.reactionService
      .addThreadReaction(this.thread.id, ReactionType.UPVOTE)
      .subscribe({
        next: () => {
          if (this.userReaction === "upvote") {
            this.thread.upvoteCount = Math.max(0, this.thread.upvoteCount - 1);
            this.userReaction = null;
            this.thread.userReaction = null;
          } else {
            if (this.userReaction === "downvote") {
              this.thread.downvoteCount = Math.max(
                0,
                this.thread.downvoteCount - 1
              );
            }
            this.thread.upvoteCount++;
            this.userReaction = "upvote";
            this.thread.userReaction = "upvote";
          }
        },
        error: (error) => {
          console.error("Error adding upvote:", error);
        },
      });
  }

  handleDownvote(event: Event) {
    event.stopPropagation();
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }

    this.reactionService
      .addThreadReaction(this.thread.id, ReactionType.DOWNVOTE)
      .subscribe({
        next: () => {
          if (this.userReaction === "downvote") {
            this.thread.downvoteCount = Math.max(
              0,
              this.thread.downvoteCount - 1
            );
            this.userReaction = null;
            this.thread.userReaction = null;
          } else {
            if (this.userReaction === "upvote") {
              this.thread.upvoteCount = Math.max(
                0,
                this.thread.upvoteCount - 1
              );
            }
            this.thread.downvoteCount++;
            this.userReaction = "downvote";
            this.thread.userReaction = "downvote";
          }
        },
        error: (error) => {
          console.error("Error adding downvote:", error);
        },
      });
  }

  handleBookmark(event: Event) {
    event.stopPropagation();
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }

    if (this.isBookmarked) {
      this.bookmarkService.removeBookmark(this.thread.id).subscribe({
        next: () => {
          this.isBookmarked = false;
          this.thread.isBookmarked = false;
        },
        error: (error) => {
          console.error("Error removing bookmark:", error);
        },
      });
    } else {
      this.bookmarkService.addBookmark(this.thread.id).subscribe({
        next: () => {
          this.isBookmarked = true;
          this.thread.isBookmarked = true;
        },
        error: (error) => {
          console.error("Error adding bookmark:", error);
        },
      });
    }
  }

  handleShare(event: Event) {
    event.stopPropagation();
    const url = `${window.location.origin}/threads/${this.thread.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: this.thread.title,
          text: stripHtml(this.thread.content).substring(0, 100) + "...",
          url: url,
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            this.copyToClipboard(url);
          }
        });
    } else {
      this.copyToClipboard(url);
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
      });
  }

  navigateToThread(event: Event) {
    this.router.navigate(["/threads", this.thread.id]);
  }

  getExcerpt(): string {
    if (!this.thread?.content) return "";
    const textContent = stripHtml(this.thread.content);
    if (textContent.length <= 200) {
      return textContent;
    }
    return textContent.substring(0, 200) + "...";
  }

  getExcerptHtml(): string {
    const excerpt = this.getExcerpt();
    return newlineToBr(excerpt);
  }
}
