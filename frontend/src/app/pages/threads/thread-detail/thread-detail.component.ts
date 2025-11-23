import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PostService } from "../../../core/services/post.service";
import { Thread, Post, Category } from "../../../core/models/models";
import { ThreadDetailData } from "../../../core/resolvers/thread-detail.resolver";
import {
  newlineToBr,
  stripHtml,
} from "../../../shared/utils/text-formatter.util";
import {
  ReactionService,
  ReactionType,
} from "../../../core/services/reaction.service";
import { BookmarkService } from "../../../core/services/bookmark.service";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-thread-detail",
  template: `
    <div class="home-page">
      <div class="container">
        <div class="reddit-layout">
          <!-- Left Sidebar -->
          <aside class="left-sidebar">
            <div class="sidebar-widget card">
              <h3>Popular Topics</h3>
              <div class="topic-list">
                <a
                  class="topic-item"
                  [routerLink]="['/']"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: true }"
                >
                  <div class="topic-content">
                    <i-lucide name="home" [size]="20"></i-lucide>
                    <span>All Topics</span>
                  </div>
                  <span class="thread-count-badge">{{
                    totalThreads | compactNumber
                  }}</span>
                </a>
                <a
                  *ngFor="let category of categories"
                  class="topic-item"
                  [routerLink]="['/']"
                  [queryParams]="{ categoryId: category.id }"
                  routerLinkActive="active"
                >
                  <div class="topic-content">
                    <i-lucide
                      [name]="category.icon || 'message-square'"
                      [size]="20"
                    ></i-lucide>
                    <span>{{ category.name }}</span>
                  </div>
                  <span class="thread-count-badge">{{
                    category.threadCount | compactNumber
                  }}</span>
                </a>
              </div>
            </div>
          </aside>

          <!-- Main Content -->
          <main class="main-feed">
            <div *ngIf="thread" class="thread-detail">
              <div class="card thread-post">
                <div class="thread-meta">
                  <img
                    [src]="thread.author.avatar || 'assets/default-avatar.svg'"
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
                <div class="thread-content">
                  <span [innerHTML]="displayedContentHtml"></span>
                  <button
                    *ngIf="isContentLong"
                    class="see-more-btn"
                    (click)="toggleContent()"
                  >
                    {{ isContentExpanded ? "See less" : "See more" }}
                  </button>
                </div>

                <div class="thread-actions">
                  <button
                    class="action-btn upvote-btn"
                    [class.active]="userReaction === 'upvote'"
                    (click)="handleUpvote()"
                  >
                    <i-lucide name="chevron-up" [size]="18"></i-lucide>
                    {{ thread.upvoteCount || 0 }}
                  </button>
                  <button
                    class="action-btn downvote-btn"
                    [class.active]="userReaction === 'downvote'"
                    (click)="handleDownvote()"
                  >
                    <i-lucide name="chevron-down" [size]="18"></i-lucide>
                    {{ thread.downvoteCount || 0 }}
                  </button>
                  <button
                    class="action-btn"
                    (click)="toggleReplyBox()"
                    [disabled]="thread.isLocked"
                  >
                    <i-lucide name="message-circle" [size]="18"></i-lucide>
                    Reply
                  </button>
                  <button class="action-btn" (click)="handleShare()">
                    <i-lucide name="share" [size]="18"></i-lucide>
                    Share
                  </button>
                  <button
                    class="action-btn"
                    [class.active]="isBookmarked"
                    (click)="handleBookmark()"
                  >
                    <i-lucide
                      [name]="isBookmarked ? 'bookmark-check' : 'bookmark'"
                      [size]="18"
                    ></i-lucide>
                    {{ isBookmarked ? "Saved" : "Save" }}
                  </button>
                </div>
              </div>

              <!-- Reply Box -->
              <div *ngIf="showReplyBox" class="card reply-box">
                <div class="editor-container">
                  <div class="editor-row">
                    <img
                      [src]="currentUser?.avatar || 'assets/default-avatar.svg'"
                      [alt]="currentUser?.username || 'User'"
                      class="avatar avatar-sm"
                    />
                    <span class="reply-label"
                      >Reply as {{ currentUser?.username }}</span
                    >
                    <button class="editor-close-btn" (click)="toggleReplyBox()">
                      <i-lucide name="x" [size]="18"></i-lucide>
                    </button>
                  </div>

                  <div class="editor-divider"></div>

                  <div class="editor-row">
                    <textarea
                      [(ngModel)]="replyContent"
                      placeholder="What are your thoughts?"
                      class="editor-content reply-textarea"
                      rows="6"
                    ></textarea>
                  </div>

                  <div class="editor-divider"></div>

                  <div class="editor-footer">
                    <div></div>
                    <div class="editor-actions">
                      <button
                        class="btn btn-outline btn-sm"
                        (click)="toggleReplyBox()"
                      >
                        Cancel
                      </button>
                      <button
                        class="btn btn-primary btn-sm"
                        (click)="submitReply()"
                        [disabled]="!replyContent.trim() || submittingReply"
                      >
                        <i-lucide
                          name="loader-2"
                          [size]="16"
                          *ngIf="submittingReply"
                          class="spinner"
                        ></i-lucide>
                        <span *ngIf="!submittingReply">Post Reply</span>
                        <span *ngIf="submittingReply">Posting...</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="comments-section">
                <div class="comment-sort card" *ngIf="!thread.isLocked">
                  <button
                    class="sort-btn"
                    [class.active]="selectedSort === 'best'"
                    (click)="selectSort('best')"
                  >
                    <i-lucide name="award" [size]="18"></i-lucide> Best
                  </button>
                  <button
                    class="sort-btn"
                    [class.active]="selectedSort === 'top'"
                    (click)="selectSort('top')"
                  >
                    <i-lucide name="trending-up" [size]="18"></i-lucide> Top
                  </button>
                  <button
                    class="sort-btn"
                    [class.active]="selectedSort === 'new'"
                    (click)="selectSort('new')"
                  >
                    <i-lucide name="star" [size]="18"></i-lucide> New
                  </button>
                </div>

                <app-loading-spinner
                  *ngIf="loadingMore && posts.length === 0"
                ></app-loading-spinner>

                <app-post-card
                  *ngFor="let post of posts"
                  [post]="post"
                  [originalAuthorId]="thread ? thread.author.id : undefined"
                  [threadId]="thread.id"
                  [isThreadLocked]="thread.isLocked"
                  (replyAdded)="onReplyAdded()"
                ></app-post-card>

                <!-- Load More Button -->
                <div
                  class="load-more-container"
                  *ngIf="hasMorePosts && posts.length > 0"
                >
                  <button
                    class="action-btn load-more-btn"
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
        grid-template-columns: 300px 1fr 250px;
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

      .topic-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
      }

      .topic-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        border-radius: var(--radius-md);
        color: var(--text-dark);
        transition: all 0.2s ease;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .topic-item .topic-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex: 1;
      }

      .topic-item:hover {
        background: var(--gray-100);
      }

      .topic-item.active {
        background: var(--primary-50);
        color: var(--primary);
        font-weight: 600;
      }

      .thread-count-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 28px;
        padding: 2px 6px;
        background: var(--gray-200);
        color: var(--text-primary);
        border-radius: var(--radius-lg);
        font-size: 0.6875rem;
        font-weight: 700;
        transition: all 0.2s ease;
      }

      .topic-item:hover .thread-count-badge {
        background: var(--gray-300);
      }

      .topic-item.active .thread-count-badge {
        background: var(--primary-100);
        color: var(--primary);
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
        font-size: 1.125rem;
        font-weight: 600;
        margin-bottom: var(--spacing-md);
        color: var(--text-dark);
      }

      .thread-content {
        margin-bottom: var(--spacing-md);
        color: var(--text-dark);
        font-size: 0.875rem;
        line-height: 1.6;
      }

      .see-more-btn {
        background: none;
        border: none;
        color: var(--primary);
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        padding: 0;
        margin-left: 4px;
        transition: all 0.2s ease;
        text-decoration: none;
      }

      .see-more-btn:hover {
        color: var(--primary-600);
      }

      .thread-actions {
        display: flex;
        gap: var(--spacing-sm);
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
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        background: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-weight: 600;
        font-size: 0.875rem;
        color: var(--text-light);
        transition: all 0.2s ease;
      }

      .sort-btn:hover {
        background: var(--gray-100);
      }

      .sort-btn.active {
        background: var(--gray-100);
        color: var(--text-dark);
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

      .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border: none;
        background: none;
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--primary);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .thread-actions .action-btn {
        color: var(--text-light);
        font-size: 0.75rem;
      }

      .action-btn:hover:not(:disabled) {
        background: var(--gray-100);
      }

      .action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .upvote-btn.active {
        color: var(--primary) !important;
        background: var(--primary-50);
      }

      .downvote-btn.active {
        color: var(--primary) !important;
        background: var(--primary-50);
      }

      .action-btn.active {
        color: var(--primary) !important;
        background: var(--primary-50);
      }

      .vote-btn {
        gap: 6px;
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

      /* Reply Box Styles */
      .reply-box {
        margin-bottom: var(--spacing-md);
        padding: 0;
        animation: fadeIn 0.2s ease-out;
      }

      .editor-container {
        display: flex;
        flex-direction: column;
      }

      .editor-row {
        padding: var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
      }

      .reply-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--text-dark);
        flex: 1;
      }

      .editor-divider {
        height: 1px;
        background: var(--gray-200);
        margin: 0;
      }

      .editor-close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background-color 0.15s ease;
        color: var(--text-secondary);
        flex-shrink: 0;
      }

      .editor-close-btn:hover {
        background: var(--gray-100);
        color: var(--text-primary);
      }

      .editor-content {
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        font-size: 0.875rem;
        line-height: 1.6;
        color: var(--text-dark);
        resize: vertical;
        outline: none;
        font-family: inherit;
        min-height: 150px;
        border-radius: 0;
      }

      .reply-textarea {
        min-height: 120px;
      }

      .editor-content:hover,
      .editor-content:focus {
        background: transparent;
        border: none;
        outline: none;
        box-shadow: none;
      }

      .editor-content::placeholder {
        color: var(--text-tertiary);
      }

      .editor-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-md);
      }

      .editor-actions {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 1024px) {
        .reddit-layout {
          grid-template-columns: 1fr 250px;
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

        .thread-actions {
          gap: 0;
        }
      }
    `,
  ],
})
export class ThreadDetailComponent implements OnInit {
  thread: Thread | null = null;
  posts: Post[] = [];
  categories: Category[] = [];
  totalThreads = 0;
  loadingMore = false;
  currentPage = 1;
  totalPosts = 0;
  lastPage = 1;
  isContentExpanded = false;
  selectedSort: string = "best";
  userReaction: string | null = null;
  isBookmarked: boolean = false;
  currentUser: any = null;
  showReplyBox: boolean = false;
  replyContent: string = "";
  submittingReply: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private reactionService: ReactionService,
    private bookmarkService: BookmarkService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user && this.thread) {
        this.loadUserReaction();
        this.loadBookmarkStatus();
      }
    });

    const data = this.route.snapshot.data[
      "threadDetailData"
    ] as ThreadDetailData;
    if (data) {
      this.thread = data.thread;
      this.posts = (data.posts.data || []).map((post: Post) => ({
        ...post,
        replies: [],
      }));
      this.totalPosts = data.posts.total;
      this.lastPage = data.posts.lastPage;
      this.currentPage = data.posts.page;
      this.categories = data.categories;
      this.totalThreads = this.categories.reduce(
        (sum, cat) => sum + (cat.threadCount || 0),
        0
      );

      if (this.currentUser && this.thread) {
        this.loadUserReaction();
        this.loadBookmarkStatus();
      }
    }
  }

  loadUserReaction() {
    if (!this.thread) return;
    this.reactionService.getUserThreadReaction(this.thread.id).subscribe({
      next: (response) => {
        this.userReaction = response?.type || null;
      },
      error: () => {
        this.userReaction = null;
      },
    });
  }

  loadBookmarkStatus() {
    if (!this.thread) return;
    this.bookmarkService.isBookmarked(this.thread.id).subscribe({
      next: (response) => {
        this.isBookmarked = response?.isBookmarked || false;
      },
      error: () => {
        this.isBookmarked = false;
      },
    });
  }

  handleUpvote() {
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }

    if (!this.thread) return;

    this.reactionService
      .addThreadReaction(this.thread.id, ReactionType.UPVOTE)
      .subscribe({
        next: () => {
          if (!this.thread) return;
          if (this.userReaction === "upvote") {
            this.thread.upvoteCount = Math.max(0, this.thread.upvoteCount - 1);
            this.userReaction = null;
          } else {
            if (this.userReaction === "downvote") {
              this.thread.downvoteCount = Math.max(
                0,
                this.thread.downvoteCount - 1
              );
            }
            this.thread.upvoteCount++;
            this.userReaction = "upvote";
          }
        },
        error: (error) => {
          console.error("Error adding upvote:", error);
        },
      });
  }

  handleDownvote() {
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }

    if (!this.thread) return;

    this.reactionService
      .addThreadReaction(this.thread.id, ReactionType.DOWNVOTE)
      .subscribe({
        next: () => {
          if (!this.thread) return;
          if (this.userReaction === "downvote") {
            this.thread.downvoteCount = Math.max(
              0,
              this.thread.downvoteCount - 1
            );
            this.userReaction = null;
          } else {
            if (this.userReaction === "upvote") {
              this.thread.upvoteCount = Math.max(
                0,
                this.thread.upvoteCount - 1
              );
            }
            this.thread.downvoteCount++;
            this.userReaction = "downvote";
          }
        },
        error: (error) => {
          console.error("Error adding downvote:", error);
        },
      });
  }

  handleBookmark() {
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }

    if (!this.thread) return;

    if (this.isBookmarked) {
      this.bookmarkService.removeBookmark(this.thread.id).subscribe({
        next: () => {
          this.isBookmarked = false;
        },
        error: (error) => {
          console.error("Error removing bookmark:", error);
        },
      });
    } else {
      this.bookmarkService.addBookmark(this.thread.id).subscribe({
        next: () => {
          this.isBookmarked = true;
        },
        error: (error) => {
          console.error("Error adding bookmark:", error);
        },
      });
    }
  }

  handleShare() {
    if (!this.thread) return;
    const url = `${window.location.origin}/threads/${this.thread.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: this.thread.title,
          text: stripHtml(this.thread.content).substring(0, 100) + "...",
          url: url,
        })
        .catch((error) => {
          if (error.name !== "AbortError") {
            this.copyToClipboard(url);
          }
        });
    } else {
      this.copyToClipboard(url);
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
      });
  }

  toggleReplyBox() {
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }
    if (this.thread?.isLocked) {
      return;
    }
    this.showReplyBox = !this.showReplyBox;
    if (!this.showReplyBox) {
      this.replyContent = "";
    }
  }

  submitReply() {
    if (!this.replyContent.trim() || !this.thread) return;

    if (this.thread.isLocked) {
      return;
    }

    this.submittingReply = true;
    const postData = {
      content: this.replyContent,
      threadId: this.thread.id,
    };

    this.postService.createPost(postData).subscribe({
      next: (newPost) => {
        // Add new post with current user as author
        this.posts = [
          { ...newPost, replies: [], author: this.currentUser },
          ...this.posts,
        ];
        this.totalPosts++;
        if (this.thread) {
          this.thread.replyCount++;
        }
        this.replyContent = "";
        this.showReplyBox = false;
        this.submittingReply = false;
      },
      error: (error) => {
        console.error("Error creating reply:", error);
        this.submittingReply = false;
      },
    });
  }

  onReplyAdded() {
    // This is called when a nested reply is added to any post in the thread
    // We only increment the thread's total reply count
    if (this.thread) {
      this.thread.replyCount++;
    }
    // Note: We do NOT increment totalPosts here because:
    // - totalPosts tracks only top-level posts (for pagination)
    // - totalPosts is only incremented in submitReply() when adding a top-level post
    // - thread.replyCount tracks ALL comments (top-level + nested)
  }

  getTotalCommentCount(): number {
    // Return total count of ALL comments (including nested replies)
    // thread.replyCount includes all nested replies
    return this.thread?.replyCount || 0;
  }

  get hasMorePosts(): boolean {
    return this.currentPage < this.lastPage;
  }

  get isContentLong(): boolean {
    if (!this.thread?.content) return false;
    const textContent = stripHtml(this.thread.content);
    return textContent.length > 300;
  }

  get displayedContent(): string {
    if (!this.thread?.content) return "";
    if (this.isContentExpanded || !this.isContentLong) {
      return this.thread.content;
    }
    const textContent = stripHtml(this.thread.content);
    return textContent.substring(0, 300) + "...";
  }

  get displayedContentHtml(): string {
    const content = this.displayedContent;
    return newlineToBr(content);
  }

  toggleContent(): void {
    this.isContentExpanded = !this.isContentExpanded;
  }

  loadMorePosts() {
    if (!this.thread || this.loadingMore || !this.hasMorePosts) {
      return;
    }

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;
    this.postService
      .getPostsByThread(this.thread.id, nextPage, 20, this.selectedSort)
      .subscribe({
        next: (response) => {
          const newPosts = response.data.map((post: Post) => ({
            ...post,
            replies: [],
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

  selectSort(sort: string) {
    if (this.selectedSort === sort || !this.thread) {
      return;
    }
    this.selectedSort = sort;
    this.loadingMore = true;
    this.posts = [];

    this.postService.getPostsByThread(this.thread.id, 1, 20, sort).subscribe({
      next: (response) => {
        this.posts = response.data.map((post: Post) => ({
          ...post,
          replies: [],
        }));
        this.currentPage = response.page;
        this.totalPosts = response.total;
        this.lastPage = response.lastPage;
        this.loadingMore = false;
      },
      error: (error) => {
        console.error("Error loading posts:", error);
        this.loadingMore = false;
      },
    });
  }
}
