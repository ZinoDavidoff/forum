import { Component } from "@angular/core";

@Component({
  selector: "app-loading-spinner",
  template: `
    <div class="spinner-container">
      <div class="spinner"><i-lucide name="baby" [size]="48"></i-lucide></div>
      <p>Loading...</p>
    </div>
  `,
  styles: [
    `
      .spinner-container {
        text-align: center;
        padding: var(--spacing-xxl);
      }
      .spinner {
        font-size: 3rem;
        animation: float 2s ease-in-out infinite;
      }
      @keyframes float {
        0%,
        100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-20px);
        }
      }
    `,
  ],
})
export class LoadingSpinnerComponent {}
