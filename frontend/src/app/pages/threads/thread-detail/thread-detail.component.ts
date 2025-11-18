import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ThreadService } from "../../../core/services/thread.service";
import { PostService } from "../../../core/services/post.service";
import { Thread, Post } from "../../../core/models/models";

@Component({
  selector: "app-thread-detail",
  template: `
    <div class="home-page">
      <div class="container">
        <div class="reddit-layout">
          <!-- Left Sidebar -->
          <aside class="left-sidebar">
            <div class="sidebar-widget card">
              <h3>About Thread</h3>
              <p class="small-text">Thread discussion and details</p>
            </div>
          </aside>

          <!-- Main Content -->
          <main class="main-feed">
            <div *ngIf="thread" class="thread-detail">
              <div class="card thread-post">
                <div class="thread-meta">
                  <img
                    [src]="thread.author.avatar || 'assets/default-avatar.png'"
                    [alt]="thread.author.username"
                    class="avatar"
                  />
                  <div>
                    <span class="author-name">{{
                      thread.author.username
                    }}</span>
                    <div class="post-time">
                      <span class="time-ago">{{
                        thread.createdAt | date : "short"
                      }}</span>
                    </div>
                  </div>
                </div>
                <h1 class="thread-title">{{ thread.title }}</h1>
                <div class="thread-content" [innerHTML]="thread.content"></div>

                <div class="thread-stats">
                  <span
                    ><i-lucide name="message-square" [size]="16"></i-lucide>
                    {{ getTotalCommentCount() }} comments</span
                  >
                  <span
                    ><i-lucide name="eye" [size]="16"></i-lucide>
                    {{ thread.viewCount }} views</span
                  >
                </div>
              </div>

              <div class="comments-section">
                <div class="comment-sort card">
                  <button class="sort-btn active">Best</button>
                  <button class="sort-btn">Top</button>
                  <button class="sort-btn">New</button>
                  <button class="sort-btn">Old</button>
                </div>

                <app-post-card
                  *ngFor="let post of posts"
                  [post]="post"
                ></app-post-card>
              </div>
            </div>
            <app-loading-spinner *ngIf="loading"></app-loading-spinner>
          </main>

          <!-- Right Sidebar -->
          <aside class="right-sidebar">
            <div class="sidebar-widget card">
              <h3>Thread Stats</h3>
              <div class="stat-item">
                <i-lucide name="message-square" [size]="18"></i-lucide>
                <span>{{ getTotalCommentCount() }} Comments</span>
              </div>
              <div class="stat-item">
                <i-lucide name="eye" [size]="18"></i-lucide>
                <span>{{ thread?.viewCount || 0 }} Views</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .reddit-layout {
        display: grid;
        grid-template-columns: 250px 1fr 312px;
        gap: var(--spacing-md);
        padding: var(--spacing-md) 0;
      }

      .left-sidebar,
      .right-sidebar {
        position: sticky;
        top: 89px;
        height: fit-content;
      }

      .sidebar-widget {
        margin-bottom: var(--spacing-md);
        padding: var(--spacing-md);
      }

      .sidebar-widget h3 {
        font-size: 0.875rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--gray-500);
        margin-bottom: var(--spacing-md);
      }

      .small-text {
        font-size: 0.875rem;
        color: var(--text-light);
        line-height: 1.4;
      }

      .thread-post {
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-md);
      }

      .thread-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
      }

      .author-name {
        font-weight: 700;
        color: var(--text-dark);
        font-size: 0.875rem;
      }

      .post-time {
        font-size: 0.75rem;
        color: var(--text-light);
      }

      .thread-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
        color: var(--text-dark);
      }

      .thread-content {
        margin-bottom: var(--spacing-md);
        color: var(--text-dark);
      }

      .thread-stats {
        display: flex;
        gap: var(--spacing-lg);
        padding-top: var(--spacing-md);
        border-top: var(--border);
        font-size: 0.875rem;
        color: var(--text-light);
      }

      .thread-stats span {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      }

      .comments-section {
        margin-top: var(--spacing-md);
      }

      .comment-sort {
        display: flex;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
      }

      .sort-btn {
        padding: 6px 12px;
        border: none;
        background: none;
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-light);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sort-btn:hover {
        background: var(--gray-100);
      }

      .sort-btn.active {
        background: var(--gray-100);
        color: var(--primary);
      }

      .stat-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) 0;
        font-size: 0.875rem;
        color: var(--text-dark);
      }

      @media (max-width: 1024px) {
        .reddit-layout {
          grid-template-columns: 1fr 312px;
        }

        .left-sidebar {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .reddit-layout {
          grid-template-columns: 1fr;
        }

        .right-sidebar {
          display: none;
        }

        .main-feed {
          max-width: 100%;
        }
      }
    `,
  ],
})
export class ThreadDetailComponent implements OnInit {
  thread: Thread | null = null;
  posts: Post[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private threadService: ThreadService,
    private postService: PostService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params["id"];
    this.loadThread(id);
  }

  getTotalCommentCount(): number {
    return this.countAllPosts(this.posts);
  }

  private countAllPosts(posts: Post[]): number {
    let count = 0;
    for (const post of posts) {
      count++; // Count this post
      if (post.replies && post.replies.length > 0) {
        count += this.countAllPosts(post.replies); // Recursively count nested replies
      }
    }
    return count;
  }

  loadThread(id: string) {
    this.threadService.getThread(id).subscribe({
      next: (thread) => {
        this.thread = thread;
        this.loadPosts(id);
      },
    });
  }

  loadPosts(threadId: string) {
    this.postService.getPostsByThread(threadId).subscribe({
      next: (response) => {
        this.posts = response.data;
        this.loading = false;
      },
    });
  }
}
