import { Component, Input } from "@angular/core";
import { Post } from "../../../core/models/models";

@Component({
  selector: "app-post-card",
  template: `
    <div class="comment-thread">
      <div class="comment-left">
        <img
          [src]="post.author.avatar || 'assets/default-avatar.png'"
          [alt]="post.author.username"
          class="avatar avatar-sm"
        />
        <div class="thread-line"></div>
      </div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="author-name">{{ post.author.username }}</span>
          <span class="dot">•</span>
          <span class="post-time">{{ post.createdAt | date : "short" }}</span>
        </div>
        <div class="comment-content" [innerHTML]="post.content"></div>
        <div class="comment-actions">
          <button class="action-btn">
            <i-lucide name="chevron-up" [size]="16"></i-lucide>
            {{ post.likeCount || 0 }}
            <i-lucide name="chevron-down" [size]="16"></i-lucide>
          </button>
          <button class="action-btn">
            <i-lucide name="message-circle" [size]="16"></i-lucide>
            Reply
          </button>
          <button class="action-btn">
            <i-lucide name="share" [size]="16"></i-lucide>
            Share
          </button>
        </div>

        <!-- Nested Replies -->
        <div
          class="nested-replies"
          *ngIf="post.replies && post.replies.length > 0"
        >
          <!-- Show collapsed state with expand button -->
          <button
            *ngIf="!showReplies"
            class="expand-replies-btn"
            (click)="toggleReplies()"
          >
            <i-lucide name="corner-down-right" [size]="14"></i-lucide>
            View {{ getTotalNestedCount() }}
            {{ getTotalNestedCount() === 1 ? "reply" : "replies" }}
          </button>

          <!-- Show expanded replies -->
          <div *ngIf="showReplies">
            <app-post-card
              *ngFor="let reply of post.replies"
              [post]="reply"
              [isNested]="true"
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

      .thread-line {
        width: 2px;
        background: var(--gray-300);
        flex: 1;
        margin-top: 4px;
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

      .action-btn:hover {
        background: var(--gray-100);
      }

      .action-btn:first-child {
        padding: 2px 4px;
      }

      .nested-replies {
        margin-left: 0;
        padding-left: 0;
      }

      .expand-replies-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        margin: 4px 0;
        background: none;
        border: none;
        border-radius: 2px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--reddit-orange);
        cursor: pointer;
        transition: all 0.1s ease;
      }

      .expand-replies-btn:hover {
        background: var(--gray-100);
      }
    `,
  ],
})
export class PostCardComponent {
  @Input() post!: Post;
  @Input() isNested: boolean = false;
  showReplies: boolean = false;

  toggleReplies() {
    this.showReplies = !this.showReplies;
  }

  getTotalNestedCount(): number {
    if (!this.post.replies || this.post.replies.length === 0) {
      return 0;
    }
    return this.countAllReplies(this.post.replies);
  }

  private countAllReplies(replies: Post[]): number {
    let count = 0;
    for (const reply of replies) {
      count++; // Count this reply
      if (reply.replies && reply.replies.length > 0) {
        count += this.countAllReplies(reply.replies); // Recursively count nested replies
      }
    }
    return count;
  }
}
