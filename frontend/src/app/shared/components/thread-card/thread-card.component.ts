import { Component, Input } from "@angular/core";
import { Thread } from "../../../core/models/models";
import { newlineToBr, stripHtml } from "../../utils/text-formatter.util";

@Component({
  selector: "app-thread-card",
  template: `
    <div class="thread-card card" [routerLink]="['/threads', thread.id]">
      <div class="thread-content">
        <div class="thread-meta">
          <img
            [src]="thread.author.avatar || 'assets/default-avatar.png'"
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
          <button class="action-btn upvote-btn">
            <i-lucide name="chevron-up" [size]="18"></i-lucide>
            {{ thread.upvoteCount || 0 }}
          </button>
          <button class="action-btn downvote-btn">
            <i-lucide name="chevron-down" [size]="18"></i-lucide>
            {{ thread.downvoteCount || 0 }}
          </button>
          <button class="action-btn">
            <i-lucide name="message-square" [size]="18"></i-lucide>
            {{ thread.replyCount }}
          </button>
          <button class="action-btn">
            <i-lucide name="share" [size]="18"></i-lucide>
            Share
          </button>
          <button class="action-btn">
            <i-lucide name="bookmark" [size]="18"></i-lucide>
            Save
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
    `,
  ],
})
export class ThreadCardComponent {
  @Input() thread!: Thread;

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
