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
    <div class="app-container" [class.auth-page]="isAuthPage">
      <app-loading-spinner
        [fullPage]="true"
        [transparent]="!isInitialLoad"
        *ngIf="loading"
      ></app-loading-spinner>
      <app-header *ngIf="!isInitialLoad && !isAuthPage"></app-header>
      <main
        class="main-content"
        *ngIf="!isInitialLoad"
        [class.auth-content]="isAuthPage"
      >
        <router-outlet></router-outlet>
      </main>
      <app-footer *ngIf="!isInitialLoad && !isAuthPage"></app-footer>
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

      .app-container.auth-page {
        min-height: 100vh;
      }

      .main-content.auth-content {
        padding-top: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class AppComponent {
  title = "Mommy Forum";
  loading = true;
  isInitialLoad = true;
  isAuthPage = false;

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

        // Check if current route is login or register
        if (event instanceof NavigationEnd) {
          this.isAuthPage = event.url === "/login" || event.url === "/register";
        }
      }
    });
  }
}
