import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  template: `
    <div class="app-container">
      <app-header></app-header>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
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
        padding-top: 73px;
      }
    `,
  ],
})
export class AppComponent {
  title = "Mommy Forum";
}
