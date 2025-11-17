import { Component, Input } from "@angular/core";
import { Thread } from "../../../core/models/models";

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
          <span class="time-ago">2h ago</span>
          <span *ngIf="thread.isPinned" class="badge badge-pink">Pinned</span>
          <span *ngIf="thread.isLocked" class="badge badge-blue">Locked</span>
        </div>

        <h3 class="thread-title">{{ thread.title }}</h3>
        <p class="thread-excerpt">{{ thread.content.substring(0, 200) }}...</p>

        <div class="thread-actions">
          <button class="action-btn">
            <i-lucide name="message-square" [size]="18"></i-lucide>
            {{ thread.replyCount }} Comments
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
        margin-bottom: var(--spacing-sm);
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
        line-height: 1.5;
      }

      .thread-actions {
        display: flex;
        gap: var(--spacing-sm);
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: none;
        border: none;
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-light);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .action-btn:hover {
        background: var(--gray-100);
      }
    `,
  ],
})
export class ThreadCardComponent {
  @Input() thread!: Thread;
}
