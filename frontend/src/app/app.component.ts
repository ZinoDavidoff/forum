import { Component } from "@angular/core";
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from "@angular/router";

@Component({
  selector: "app-root",
  template: `
    <div class="app-container">
      <app-loading-spinner
        [fullPage]="true"
        [transparent]="!isInitialLoad"
        *ngIf="loading"
      ></app-loading-spinner>
      <app-header *ngIf="!isInitialLoad"></app-header>
      <main class="main-content" *ngIf="!isInitialLoad">
        <router-outlet></router-outlet>
      </main>
      <app-footer *ngIf="!isInitialLoad"></app-footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .main-content {
        flex: 1;
        padding-top: 86px;
      }
    `,
  ],
})
export class AppComponent {
  title = "Mommy Forum";
  loading = true;
  isInitialLoad = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loading = false;
        this.isInitialLoad = false;
      }
    });
  }
}
