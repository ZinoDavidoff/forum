import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Post } from "../../../core/models/models";
import { PostService } from "../../../core/services/post.service";
import { newlineToBr } from "../../utils/text-formatter.util";
import {
  ReactionService,
  ReactionType,
} from "../../../core/services/reaction.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-post-card",
  template: `
    <div class="comment-thread">
      <div class="comment-left">
        <img
          [src]="post.author.avatar || 'assets/default-avatar.svg'"
          [alt]="post.author.username"
          class="avatar avatar-sm"
        />
      </div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="author-name">{{ post.author.username }}</span>
          <span class="author-badge" *ngIf="isOriginalAuthor">Author</span>
          <span class="dot">•</span>
          <span class="post-time">{{ post.createdAt | timeAgo }}</span>
        </div>
        <div class="comment-content" [innerHTML]="formattedContent"></div>
        <div class="comment-actions">
          <button
            class="action-btn upvote-btn"
            [class.active]="userReaction === 'upvote'"
            (click)="handleUpvote()"
          >
            <i-lucide name="chevron-up" [size]="16"></i-lucide>
            {{ post.upvoteCount || 0 }}
          </button>
          <button
            class="action-btn downvote-btn"
            [class.active]="userReaction === 'downvote'"
            (click)="handleDownvote()"
          >
            <i-lucide name="chevron-down" [size]="16"></i-lucide>
            {{ post.downvoteCount || 0 }}
          </button>
          <button
            class="action-btn"
            (click)="toggleReplyBox()"
            [disabled]="isThreadLocked"
          >
            <i-lucide name="message-circle" [size]="16"></i-lucide>
            Reply
          </button>
        </div>

        <!-- Reply Box -->
        <div *ngIf="showReplyBox" class="reply-box">
          <div class="reply-box-header">
            <img
              [src]="currentUser?.avatar || 'assets/default-avatar.svg'"
              [alt]="currentUser?.username || 'User'"
              class="avatar avatar-sm"
            />
            <span class="reply-label"
              >Replying to {{ post.author.username }}</span
            >
            <button class="editor-close-btn" (click)="toggleReplyBox()">
              <i-lucide name="x" [size]="16"></i-lucide>
            </button>
          </div>
          <textarea
            [(ngModel)]="replyContent"
            placeholder="What are your thoughts?"
            class="reply-textarea"
            rows="4"
          ></textarea>
          <div class="reply-box-footer">
            <button class="btn btn-sm btn-outline" (click)="toggleReplyBox()">
              Cancel
            </button>
            <button
              class="btn btn-sm btn-primary"
              (click)="submitReply()"
              [disabled]="!replyContent.trim() || submittingReply"
            >
              <i-lucide
                name="loader-2"
                [size]="14"
                *ngIf="submittingReply"
                class="spinner"
              ></i-lucide>
              <span *ngIf="!submittingReply">Reply</span>
              <span *ngIf="submittingReply">Posting...</span>
            </button>
          </div>
        </div>

        <!-- Nested Replies -->
        <div class="nested-replies" *ngIf="post.replyCount > 0">
          <!-- Show collapsed state with expand button -->
          <button
            *ngIf="!showReplies"
            class="action-btn expand-replies-btn"
            (click)="loadAndShowReplies()"
            [disabled]="loadingReplies"
          >
            <i-lucide name="corner-down-right" [size]="14"></i-lucide>
            <span *ngIf="!loadingReplies">
              View {{ post.replyCount }}
              {{ post.replyCount === 1 ? "reply" : "replies" }}
            </span>
            <span *ngIf="loadingReplies">Loading...</span>
          </button>

          <!-- Show expanded replies -->
          <div *ngIf="showReplies && post.replies && post.replies.length > 0">
            <button
              class="action-btn collapse-replies-btn"
              (click)="toggleReplies()"
            >
              <i-lucide name="corner-down-right" [size]="14"></i-lucide>
              Hide {{ post.replyCount }}
              {{ post.replyCount === 1 ? "reply" : "replies" }}
            </button>
            <app-post-card
              *ngFor="let reply of post.replies"
              [post]="reply"
              [isNested]="true"
              [originalAuthorId]="originalAuthorId"
              [threadId]="post.thread?.id || threadId"
              [isThreadLocked]="isThreadLocked"
              (replyAdded)="onNestedReplyAdded()"
            ></app-post-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .comment-thread {
        display: flex;
        gap: 8px;
        padding: 8px 0;
      }

      .comment-left {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 24px;
        flex-shrink: 0;
      }

      .comment-body {
        flex: 1;
        min-width: 0;
        padding-top: 2px;
      }

      .comment-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
        font-size: 0.75rem;
      }

      .author-name {
        font-weight: 700;
        color: var(--text-dark);
        font-size: 0.75rem;
      }

      .author-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        background: var(--primary-100);
        color: var(--primary);
        border-radius: 4px;
        font-weight: 600;
      }

      .dot {
        color: var(--gray-400);
        font-size: 0.75rem;
      }

      .post-time {
        color: var(--text-light);
      }

      .comment-content {
        line-height: 1.5;
        margin-bottom: 8px;
        color: var(--text-dark);
        font-size: 0.875rem;
      }

      .comment-actions {
        display: flex;
        gap: 4px;
        margin-bottom: 8px;
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

      .action-btn:hover:not(:disabled) {
        background: var(--gray-100);
      }

      .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .upvote-btn.active {
        color: var(--primary);
        background: var(--primary-50);
      }

      .downvote-btn.active {
        color: var(--primary);
        background: var(--primary-50);
      }

      .vote-btn {
        gap: 6px;
      }

      .nested-replies {
        margin-left: 0;
        padding-left: 0;
      }

      .expand-replies-btn:hover:not(:disabled) {
        background: var(--gray-100);
      }

      .expand-replies-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .collapse-replies-btn:hover {
        background: var(--gray-100);
      }

      /* Reply Box Styles */
      .reply-box {
        margin: 8px 0;
        padding: 12px;
        background: var(--gray-50);
        border-radius: var(--radius-md);
        border: 1px solid var(--gray-200);
        animation: fadeIn 0.2s ease-out;
      }

      .reply-box-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .reply-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-dark);
        flex: 1;
      }

      .editor-close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background-color 0.15s ease;
        color: var(--text-secondary);
        flex-shrink: 0;
      }

      .editor-close-btn:hover {
        background: var(--gray-200);
        color: var(--text-primary);
      }

      .reply-textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--gray-300);
        border-radius: var(--radius-sm);
        background: var(--white);
        font-size: 0.875rem;
        line-height: 1.5;
        color: var(--text-dark);
        resize: vertical;
        outline: none;
        font-family: inherit;
        margin-bottom: 8px;
      }

      .reply-textarea:focus {
        outline: none;
        border-color: var(--primary);
        background: var(--bg-primary);
        box-shadow: 0 0 0 3px var(--primary-100);
      }

      .reply-textarea::placeholder {
        color: var(--text-tertiary);
      }

      .reply-box-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .btn-sm {
        padding: 4px 12px;
        font-size: 0.75rem;
      }

      .spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  @Input() isNested: boolean = false;
  @Input() originalAuthorId?: string;
  @Input() threadId?: string;
  @Input() isThreadLocked: boolean = false;
  @Output() replyAdded = new EventEmitter<void>();

  showReplies: boolean = false;
  loadingReplies: boolean = false;
  repliesLoadedFromServer: boolean = false;
  userReaction: string | null = null;
  currentUser: any = null;
  showReplyBox: boolean = false;
  replyContent: string = "";
  submittingReply: boolean = false;

  constructor(
    private postService: PostService,
    private reactionService: ReactionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadUserReaction();
      }
    });
  }

  loadUserReaction() {
    this.reactionService.getUserPostReaction(this.post.id).subscribe({
      next: (response) => {
        this.userReaction = response?.type || null;
      },
      error: () => {
        this.userReaction = null;
      },
    });
  }

  handleUpvote() {
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }

    this.reactionService
      .addPostReaction(this.post.id, ReactionType.UPVOTE)
      .subscribe({
        next: () => {
          if (this.userReaction === "upvote") {
            this.post.upvoteCount = Math.max(0, this.post.upvoteCount - 1);
            this.userReaction = null;
          } else {
            if (this.userReaction === "downvote") {
              this.post.downvoteCount = Math.max(
                0,
                this.post.downvoteCount - 1
              );
            }
            this.post.upvoteCount++;
            this.userReaction = "upvote";
          }
        },
        error: (error) => {
          console.error("Error adding upvote:", error);
        },
      });
  }

  handleDownvote() {
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }

    this.reactionService
      .addPostReaction(this.post.id, ReactionType.DOWNVOTE)
      .subscribe({
        next: () => {
          if (this.userReaction === "downvote") {
            this.post.downvoteCount = Math.max(0, this.post.downvoteCount - 1);
            this.userReaction = null;
          } else {
            if (this.userReaction === "upvote") {
              this.post.upvoteCount = Math.max(0, this.post.upvoteCount - 1);
            }
            this.post.downvoteCount++;
            this.userReaction = "downvote";
          }
        },
        error: (error) => {
          console.error("Error adding downvote:", error);
        },
      });
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

  toggleReplyBox() {
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }
    if (this.isThreadLocked) {
      return;
    }
    this.showReplyBox = !this.showReplyBox;
    if (!this.showReplyBox) {
      this.replyContent = "";
    }
  }

  submitReply() {
    if (!this.replyContent.trim()) return;

    if (this.isThreadLocked) {
      return;
    }

    // Get threadId from post.thread or from input (for nested replies)
    const threadId = this.post.thread?.id || this.threadId;
    if (!threadId) {
      console.error("No threadId available for reply");
      return;
    }

    this.submittingReply = true;
    const postData = {
      content: this.replyContent,
      threadId: threadId,
      parentPostId: this.post.id,
    };

    this.postService.createPost(postData).subscribe({
      next: (newPost) => {
        // If replies weren't loaded from the server yet, load them first
        if (!this.repliesLoadedFromServer && this.post.replyCount > 0) {
          // Load existing replies from server, then add the new one
          this.postService.getReplies(this.post.id).subscribe({
            next: (response) => {
              const loadedReplies = response.data.map((reply: Post) => ({
                ...reply,
                replies: [],
              }));
              // Add the new reply at the beginning
              const newReply = {
                ...newPost,
                replies: [],
                author: this.currentUser,
              };
              this.post.replies = [newReply, ...loadedReplies];
              this.repliesLoadedFromServer = true;
              this.post.replyCount = (this.post.replyCount || 0) + 1;
              this.replyContent = "";
              this.showReplyBox = false;
              this.showReplies = true;
              this.submittingReply = false;
              this.replyAdded.emit();
            },
            error: (error) => {
              console.error("Error loading existing replies:", error);
              // Still add the new reply even if loading fails
              if (!this.post.replies) {
                this.post.replies = [];
              }
              this.post.replies.unshift({
                ...newPost,
                replies: [],
                author: this.currentUser,
              });
              this.post.replyCount = (this.post.replyCount || 0) + 1;
              this.replyContent = "";
              this.showReplyBox = false;
              this.showReplies = true;
              this.submittingReply = false;
              this.replyAdded.emit();
            },
          });
        } else {
          // Replies were already loaded, or this is the first reply
          if (!this.post.replies) {
            this.post.replies = [];
          }
          // Add the new reply with the current user as author
          this.post.replies.unshift({
            ...newPost,
            replies: [],
            author: this.currentUser,
          });
          this.post.replyCount = (this.post.replyCount || 0) + 1;
          this.replyContent = "";
          this.showReplyBox = false;
          this.showReplies = true;
          this.submittingReply = false;
          this.replyAdded.emit();
        }
      },
      error: (error) => {
        console.error("Error creating reply:", error);
        this.submittingReply = false;
      },
    });
  }

  onNestedReplyAdded() {
    this.post.replyCount = (this.post.replyCount || 0) + 1;
    this.replyAdded.emit();
  }

  get formattedContent(): string {
    return newlineToBr(this.post.content || "");
  }

  get isOriginalAuthor(): boolean {
    return (
      !!this.originalAuthorId && this.post.author.id === this.originalAuthorId
    );
  }

  loadAndShowReplies() {
    if (this.repliesLoadedFromServer) {
      this.showReplies = true;
      return;
    }

    this.loadingReplies = true;
    this.postService.getReplies(this.post.id).subscribe({
      next: (response) => {
        this.post.replies = response.data.map((reply: Post) => ({
          ...reply,
          replies: [],
        }));
        this.repliesLoadedFromServer = true;
        this.showReplies = true;
        this.loadingReplies = false;
      },
      error: (error) => {
        console.error("Error loading replies:", error);
        this.loadingReplies = false;
      },
    });
  }

  toggleReplies() {
    this.showReplies = !this.showReplies;
  }
}
