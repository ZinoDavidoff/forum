import { Component, Input } from "@angular/core";

@Component({
  selector: "app-loading-spinner",
  template: `
    <div class="spinner-overlay" *ngIf="fullPage">
      <div class="spinner-content">
        <div class="ripple-container">
          <div class="ripple-circle ripple-1"></div>
          <div class="ripple-circle ripple-2"></div>
          <div class="ripple-circle ripple-3"></div>
          <div class="baby-icon">
            <i-lucide name="baby" [size]="64"></i-lucide>
          </div>
        </div>
      </div>
    </div>
    <div class="spinner-container" *ngIf="!fullPage">
      <div class="spinner"><i-lucide name="baby" [size]="48"></i-lucide></div>
      <p>Loading...</p>
    </div>
  `,
  styles: [
    `
      .spinner-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }

      .spinner-content {
        text-align: center;
      }

      .ripple-container {
        position: relative;
        width: 150px;
        height: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .ripple-circle {
        position: absolute;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        box-shadow: 0 0 0 0 var(--primary-500);
        animation: ripple 1.5s ease-out infinite;
      }

      .ripple-1 {
        animation-delay: 0s;
      }

      .ripple-2 {
        animation-delay: 0.5s;
      }

      .ripple-3 {
        animation-delay: 1s;
      }

      .baby-icon {
        position: relative;
        z-index: 10;
        color: var(--primary-500);
        line-height: 0;
        border-radius: 50%;
      }

      ::ng-deep .baby-icon svg {
        box-shadow: 0 0 32px 16px var(--primary-500);
        border-radius: 50%;
      }

      @keyframes ripple {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 120, 81, 0.8);
          transform: scale(1);
        }
        100% {
          box-shadow: 0 0 0 20px rgba(255, 120, 81, 0);
          transform: scale(1.5);
        }
      }

      .spinner-container {
        text-align: center;
        padding: var(--spacing-xxl);
      }

      .spinner {
        font-size: 3rem;
        color: var(--primary-500);
        animation: float 2s ease-in-out infinite;
      }
    `,
  ],
})
export class LoadingSpinnerComponent {
  @Input() fullPage = false;
}
