import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { switchMap } from "rxjs/operators";
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
                        thread.createdAt | timeAgo
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

                <!-- Load More Button -->
                <div class="load-more-container" *ngIf="hasMorePosts">
                  <button
                    class="load-more-btn"
                    (click)="loadMorePosts()"
                    [disabled]="loadingMore"
                  >
                    <i-lucide
                      name="loader-2"
                      [size]="16"
                      *ngIf="loadingMore"
                      class="spinner"
                    ></i-lucide>
                    <span *ngIf="!loadingMore"> View More Comments </span>
                    <span *ngIf="loadingMore">Loading...</span>
                  </button>
                </div>
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
        top: 102px;
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

      .load-more-container {
        display: flex;
        justify-content: center;
        padding: var(--spacing-md) 0;
      }

      .load-more-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: none;
        border: none;
        border-radius: 2px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--reddit-orange);
        cursor: pointer;
        transition: all 0.1s ease;
      }

      .load-more-btn:hover:not(:disabled) {
        background: var(--gray-100);
      }

      .load-more-btn:disabled {
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
  loadingMore = false;
  currentPage = 1;
  totalPosts = 0;
  lastPage = 1;

  constructor(
    private route: ActivatedRoute,
    private threadService: ThreadService,
    private postService: PostService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params["id"];
    this.loadThreadData(id);
  }

  getTotalCommentCount(): number {
    return this.totalPosts || this.posts.length;
  }

  get hasMorePosts(): boolean {
    return this.currentPage < this.lastPage;
  }

  loadThreadData(id: string) {
    this.loading = true;
    this.currentPage = 1;
    this.threadService
      .getThread(id)
      .pipe(
        switchMap((thread) => {
          this.thread = thread;
          return this.postService.getPostsByThread(id, this.currentPage);
        })
      )
      .subscribe({
        next: (response) => {
          this.posts = response.data.map((post: Post) => ({
            ...post,
            replies: [], // Initialize with empty replies for lazy loading
          }));
          this.totalPosts = response.total;
          this.lastPage = response.lastPage;
          this.currentPage = response.page;
          this.loading = false;
        },
        error: (error) => {
          console.error("Error loading thread data:", error);
          this.loading = false;
        },
      });
  }

  loadMorePosts() {
    if (!this.thread || this.loadingMore || !this.hasMorePosts) {
      return;
    }

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;

    this.postService.getPostsByThread(this.thread.id, nextPage).subscribe({
      next: (response) => {
        const newPosts = response.data.map((post: Post) => ({
          ...post,
          replies: [], // Initialize with empty replies for lazy loading
        }));
        this.posts = [...this.posts, ...newPosts];
        this.currentPage = response.page;
        this.loadingMore = false;
      },
      error: (error) => {
        console.error("Error loading more posts:", error);
        this.loadingMore = false;
      },
    });
  }
}
