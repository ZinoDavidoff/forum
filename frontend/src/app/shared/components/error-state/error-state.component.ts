import { Component, Input } from "@angular/core";

@Component({
  selector: "app-error-state",
  template: `
    <div class="error-state-container">
      <div class="icon-container">
        <div class="error-icon">
          <i-lucide name="baby" [size]="64"></i-lucide>
        </div>
      </div>
      <h3 class="error-title">{{ title }}</h3>
      <p class="error-message">{{ message }}</p>
      <button class="btn btn-primary" (click)="onRetry()">
        <i-lucide name="refresh-cw" [size]="18"></i-lucide>
        {{ retryText }}
      </button>
    </div>
  `,
  styles: [
    `
      .error-state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xxl);
        text-align: center;
        min-height: 300px;
      }

      .icon-container {
        margin-bottom: var(--spacing-lg);
      }

      .error-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--bg-primary);
        line-height: 0;
        border-radius: 50%;
        background: var(--primary);
        padding: 0.5rem;
      }

      .error-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-dark);
        margin: 0 0 var(--spacing-sm) 0;
      }

      .error-message {
        font-size: 1rem;
        color: var(--text-light);
        margin: 0 0 var(--spacing-xl) 0;
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
export class ErrorStateComponent {
  @Input() title: string = "Something went wrong";
  @Input() message: string =
    "We encountered an error while loading the content. Please try again.";
  @Input() retryText: string = "Try Again";
  @Input() onRetryClick?: () => void;

  onRetry() {
    if (this.onRetryClick) {
      this.onRetryClick();
    }
  }
}

