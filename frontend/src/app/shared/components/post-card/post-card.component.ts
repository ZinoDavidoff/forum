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
    <!-- Edit Box - Replaces entire comment-thread when editing -->
    <div *ngIf="isEditingPost" class="reply-box">
      <div class="reply-box-header">
        <img
          [src]="currentUser?.avatar || 'assets/default-avatar.svg'"
          [alt]="currentUser?.username || 'User'"
          class="avatar avatar-sm"
        />
        <span class="reply-label">Replying to {{ post.author.username }}</span>
        <button class="editor-close-btn" (click)="cancelEditingPost()">
          <i-lucide name="x" [size]="16"></i-lucide>
        </button>
      </div>
      <textarea
        [(ngModel)]="editPostContent"
        placeholder="What are your thoughts?"
        class="reply-textarea"
        rows="4"
      ></textarea>
      <div class="reply-box-footer">
        <button class="btn btn-sm btn-outline" (click)="cancelEditingPost()">
          Cancel
        </button>
        <button
          class="btn btn-sm btn-primary"
          (click)="savePostEdit()"
          [disabled]="!editPostContent.trim() || submittingPostEdit"
        >
          <i-lucide
            name="loader-2"
            [size]="14"
            *ngIf="submittingPostEdit"
            class="spinner"
          ></i-lucide>
          <span *ngIf="!submittingPostEdit">Save</span>
          <span *ngIf="submittingPostEdit">Saving...</span>
        </button>
      </div>
    </div>

    <!-- View Mode -->
    <div *ngIf="!isEditingPost" class="comment-thread">
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
          <span
            class="dot"
            *ngIf="post.updatedAt && post.updatedAt !== post.createdAt"
            >•</span
          >
          <span
            class="edited-indicator"
            *ngIf="post.updatedAt && post.updatedAt !== post.createdAt"
            >edited</span
          >
          <div class="post-actions-menu" *ngIf="canEditOrDeletePost()">
            <button class="menu-btn" (click)="togglePostMenu($event)">
              <i-lucide name="more-vertical" [size]="16"></i-lucide>
            </button>
            <div class="dropdown-menu" *ngIf="showPostMenu">
              <button class="dropdown-item" (click)="startEditingPost()">
                <i-lucide name="edit-3" [size]="14"></i-lucide>
                Edit
              </button>
              <button
                class="dropdown-item delete"
                (click)="confirmDeletePost()"
              >
                <i-lucide name="trash" [size]="14"></i-lucide>
                Delete
              </button>
            </div>
          </div>
        </div>
        <div class="comment-content" [innerHTML]="formattedContent"></div>
        <div class="comment-actions">
          <button
            class="action-btn upvote-btn"
            [class.active]="userReaction === 'upvote'"
            (click)="handleUpvote()"
          >
            <i-lucide name="chevron-up" [size]="16"></i-lucide>
            {{ post.upvoteCount || 0 | compactNumber }}
          </button>
          <button
            class="action-btn downvote-btn"
            [class.active]="userReaction === 'downvote'"
            (click)="handleDownvote()"
          >
            <i-lucide name="chevron-down" [size]="16"></i-lucide>
            {{ post.downvoteCount || 0 | compactNumber }}
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
              View {{ post.replyCount | compactNumber }}
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
              Hide {{ post.replyCount | compactNumber }}
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
              (postDeleted)="onNestedPostDeleted($event)"
            ></app-post-card>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <app-confirm-modal
          [isOpen]="showDeletePostModal"
          [title]="'Delete Comment'"
          [message]="
            'Are you sure you want to delete this comment? This action cannot be undone.'
          "
          [confirmText]="'Delete'"
          [loadingText]="'Deleting...'"
          [isLoading]="deletingPost"
          (confirm)="deletePost()"
          (close)="showDeletePostModal = false"
        ></app-confirm-modal>
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
        position: relative;
      }

      .post-actions-menu {
        margin-left: auto;
        position: relative;
      }

      .menu-btn {
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
      }

      .menu-btn:hover {
        background: var(--gray-100);
        color: var(--text-primary);
      }

      .dropdown-menu {
        position: absolute;
        top: calc(100% + 4px);
        right: 0;
        background: var(--bg-primary);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        min-width: 130px;
        z-index: 100;
        animation: fadeIn 0.15s ease-out;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        width: 100%;
        padding: 8px 16px;
        border: none;
        background: none;
        color: var(--text-dark);
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.15s ease;
        text-align: left;
      }

      .dropdown-item:hover {
        background: var(--gray-50);
      }

      .dropdown-item.delete {
        color: var(--primary);
      }

      .dropdown-item.delete:hover {
        background: var(--primary-50);
      }

      .dropdown-item:first-child {
        border-radius: var(--radius-md) var(--radius-md) 0 0;
      }

      .dropdown-item:last-child {
        border-radius: 0 0 var(--radius-md) var(--radius-md);
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

      .edited-indicator {
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
        background: var(--bg-primary);
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
  @Output() postDeleted = new EventEmitter<{
    postId: string;
    deletedCount: number;
    newReplyCount: number;
  }>();

  showReplies: boolean = false;
  loadingReplies: boolean = false;
  repliesLoadedFromServer: boolean = false;
  userReaction: string | null = null;
  currentUser: any = null;
  showReplyBox: boolean = false;
  replyContent: string = "";
  submittingReply: boolean = false;
  showPostMenu: boolean = false;
  showDeletePostModal: boolean = false;
  deletingPost: boolean = false;
  isEditingPost: boolean = false;
  editPostContent: string = "";
  submittingPostEdit: boolean = false;

  constructor(
    private postService: PostService,
    private reactionService: ReactionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Use data from post if available (provided by backend)
    if (this.post.userReaction !== undefined) {
      this.userReaction = this.post.userReaction;
    }

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      this.showPostMenu = false;
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
            this.post.userReaction = null;
          } else {
            if (this.userReaction === "downvote") {
              this.post.downvoteCount = Math.max(
                0,
                this.post.downvoteCount - 1
              );
            }
            this.post.upvoteCount++;
            this.userReaction = "upvote";
            this.post.userReaction = "upvote";
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
            this.post.userReaction = null;
          } else {
            if (this.userReaction === "upvote") {
              this.post.upvoteCount = Math.max(0, this.post.upvoteCount - 1);
            }
            this.post.downvoteCount++;
            this.userReaction = "downvote";
            this.post.userReaction = "downvote";
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
    // Close edit mode if opening reply box
    if (!this.showReplyBox) {
      this.isEditingPost = false;
    }
    this.showReplyBox = !this.showReplyBox;
    if (!this.showReplyBox) {
      this.replyContent = "";
    }
  }

  submitReply() {
    if (!this.replyContent.trim()) return;

    if (this.submittingReply) {
      return; // Prevent double submission
    }

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
              // Check if the new reply is already in the loaded replies (prevent duplicates)
              const replyExistsInLoaded = loadedReplies.some(
                (r: Post) => r.id === newPost.id
              );
              if (replyExistsInLoaded) {
                // If it's already in loaded replies, just use the loaded ones
                this.post.replies = loadedReplies;
              } else {
                // Otherwise, add the new reply at the beginning
                this.post.replies = [newReply, ...loadedReplies];
              }
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
              const newReply = {
                ...newPost,
                replies: [],
                author: this.currentUser,
              };
              // Check if reply doesn't already exist (prevent duplicates)
              const replyExists = this.post.replies.some(
                (r: Post) => r.id === newPost.id
              );
              if (!replyExists) {
                this.post.replies.unshift(newReply);
              }
              this.repliesLoadedFromServer = true;
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
          const newReply = {
            ...newPost,
            replies: [],
            author: this.currentUser,
          };
          // Check if reply doesn't already exist (prevent duplicates)
          const replyExists = this.post.replies.some(
            (r: Post) => r.id === newPost.id
          );
          if (!replyExists) {
            this.post.replies.unshift(newReply);
          }
          this.repliesLoadedFromServer = true;
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

  onNestedPostDeleted(event: {
    postId: string;
    deletedCount: number;
    newReplyCount: number;
  }) {
    // Remove the deleted post from the replies array
    if (this.post.replies) {
      this.post.replies = this.post.replies.filter(
        (r) => r.id !== event.postId
      );
      // Decrement parent's reply count by the number of posts deleted
      this.post.replyCount = Math.max(
        0,
        (this.post.replyCount || 0) - event.deletedCount
      );
      // Propagate the event upward to update the thread's total count
      this.postDeleted.emit(event);
    }
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

  canEditOrDeletePost(): boolean {
    return (
      this.currentUser &&
      this.post &&
      this.currentUser.id === this.post.author.id
    );
  }

  togglePostMenu(event: Event) {
    event.stopPropagation();
    this.showPostMenu = !this.showPostMenu;
  }

  startEditingPost() {
    this.editPostContent = this.post.content;
    this.isEditingPost = true;
    this.showPostMenu = false;
    // Close reply box if opening edit mode
    this.showReplyBox = false;
  }

  cancelEditingPost() {
    this.isEditingPost = false;
    this.editPostContent = "";
  }

  savePostEdit() {
    if (!this.editPostContent.trim()) {
      return;
    }

    this.submittingPostEdit = true;
    this.postService
      .updatePost(this.post.id, { content: this.editPostContent })
      .subscribe({
        next: (updatedPost) => {
          this.post.content = updatedPost.content;
          this.post.updatedAt =
            updatedPost.updatedAt || new Date().toISOString();
          this.isEditingPost = false;
          this.submittingPostEdit = false;
        },
        error: (error) => {
          console.error("Error updating post:", error);
          this.submittingPostEdit = false;
        },
      });
  }

  confirmDeletePost() {
    this.showPostMenu = false;
    this.showDeletePostModal = true;
  }

  deletePost() {
    this.deletingPost = true;
    this.postService.deletePost(this.post.id).subscribe({
      next: (response: any) => {
        this.deletingPost = false;
        this.showDeletePostModal = false;
        // Emit event to parent with deletion info
        this.postDeleted.emit({
          postId: this.post.id,
          deletedCount: response.deletedCount || 1,
          newReplyCount: response.newReplyCount || 0,
        });
      },
      error: (error) => {
        console.error("Error deleting post:", error);
        this.deletingPost = false;
      },
    });
  }
}
