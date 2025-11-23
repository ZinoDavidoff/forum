import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-confirm-modal",
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="close-btn" (click)="onClose()">
            <i-lucide name="x" [size]="20"></i-lucide>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline btn-sm" (click)="onClose()">
            Cancel
          </button>
          <button
            class="btn btn-primary btn-sm"
            (click)="onConfirm()"
            [disabled]="isLoading"
          >
            <i-lucide
              name="loader-2"
              [size]="14"
              *ngIf="isLoading"
              class="spinner"
            ></i-lucide>
            <span *ngIf="!isLoading">{{ confirmText }}</span>
            <span *ngIf="isLoading">{{ loadingText }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }

      .modal-content {
        background: var(--bg-primary);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        max-width: 450px;
        width: 90%;
        animation: slideUp 0.2s ease-out;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--gray-200);
      }

      .modal-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-dark);
        margin: 0;
      }

      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background-color 0.15s ease;
        color: var(--text-secondary);
      }

      .close-btn:hover {
        background: var(--gray-100);
        color: var(--text-primary);
      }

      .modal-body {
        padding: var(--spacing-lg);
      }

      .modal-body p {
        margin: 0;
        color: var(--text-light);
        font-size: 0.9375rem;
        line-height: 1.6;
      }

      .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--spacing-sm);
        padding: var(--spacing-lg);
        border-top: 1px solid var(--gray-200);
      }

      .btn-danger {
        background: var(--primary);
        color: var(--bg-primary);
        border: 1px solid var(--primary);
      }

      .btn-danger:hover:not(:disabled) {
        background: var(--primary); 
        border-color: var(--primary);
      }

      .btn-danger:disabled {
        opacity: 0.6;
        cursor: not-allowed;
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
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class ConfirmModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = "Confirm Action";
  @Input() message: string = "Are you sure you want to proceed?";
  @Input() confirmText: string = "Confirm";
  @Input() loadingText: string = "Processing...";
  @Input() isLoading: boolean = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onClose() {
    if (!this.isLoading) {
      this.close.emit();
    }
  }
}

