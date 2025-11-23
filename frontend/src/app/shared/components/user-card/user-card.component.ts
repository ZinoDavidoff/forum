import { Component, Input } from '@angular/core';
import { User } from '../../../core/models/models';

@Component({
  selector: 'app-user-card',
  template: `
    <div class="user-card card">
      <img [src]="user.avatar || 'assets/default-avatar.svg'" [alt]="user.username" class="avatar avatar-lg">
      <h3>{{ user.username }}</h3>
      <p *ngIf="user.bio">{{ user.bio }}</p>
      <div class="user-stats">
        <div><strong>{{ user.reputation }}</strong><br>Reputation</div>
        <div><strong>{{ user.postCount }}</strong><br>Posts</div>
        <div><strong>{{ user.threadCount }}</strong><br>Threads</div>
      </div>
    </div>
  `,
  styles: [`
    .user-card { text-align: center; }
    .user-stats { display: flex; justify-content: space-around; margin-top: var(--spacing-md); padding-top: var(--spacing-md); border-top: 2px solid var(--baby-pink); }
  `]
})
export class UserCardComponent {
  @Input() user!: User;
}
