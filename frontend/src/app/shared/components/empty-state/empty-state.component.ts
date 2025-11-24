import { Component, Input } from "@angular/core";

@Component({
  selector: "app-empty-state",
  template: `
    <div class="empty-state-container">
      <div class="icon-container">
        <div class="baby-icon">
          <i-lucide name="baby" [size]="64"></i-lucide>
        </div>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message">{{ message }}</p>
      <button
        *ngIf="showActionButton"
        class="btn btn-primary"
        (click)="onAction()"
      >
        <i-lucide [name]="actionIcon" [size]="18"></i-lucide>
        {{ actionText }}
      </button>
    </div>
  `,
  styles: [
    `
      .empty-state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-height: 300px;
      }

      .icon-container {
        margin-bottom: var(--spacing-lg);
      }

      .baby-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--bg-primary);
        line-height: 0;
        border-radius: 50%;
        background: var(--primary);
        padding: 0.5rem;
      }

      .empty-title {
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--text-dark);
        margin: 0 0 var(--spacing-sm) 0;
      }

      .empty-message {
        font-size: 0.875rem;
        color: var(--text-light);
        margin: 0 0 var(--spacing-lg) 0;
        max-width: 400px;
      }

      .btn {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-xs);
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() title: string = "Nothing here yet";
  @Input() message: string = "Be the first one to start the conversation!";
  @Input() showActionButton: boolean = false;
  @Input() actionText: string = "Get Started";
  @Input() actionIcon: string = "plus";
  @Input() onActionClick?: () => void;

  onAction() {
    if (this.onActionClick) {
      this.onActionClick();
    }
  }
}
