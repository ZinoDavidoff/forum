import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PostService } from "../../../core/services/post.service";
import { ThreadService } from "../../../core/services/thread.service";
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
              <!-- Edit Mode - Replace entire card with editor-container -->
              <div class="card thread-edit-card" *ngIf="isEditingThread">
                <div class="editor-container">
                  <!-- Category Selection -->
                  <div class="editor-row">
                    <div
                      class="custom-select"
                      (click)="toggleCategoryDropdown()"
                    >
                      <span
                        class="selected-category"
                        *ngIf="editThreadData.categoryId"
                      >
                        {{ getCategoryName(editThreadData.categoryId) }}
                      </span>
                      <span
                        class="selected-category placeholder"
                        *ngIf="!editThreadData.categoryId"
                      >
                        Select a category...
                      </span>
                      <i-lucide
                        name="chevron-down"
                        [size]="16"
                        class="dropdown-icon"
                      ></i-lucide>

                      <div
                        class="category-dropdown"
                        *ngIf="showCategoryDropdown"
                      >
                        <div
                          *ngFor="let category of categories"
                          class="category-option"
                          (click)="
                            selectEditCategory(category.id);
                            $event.stopPropagation()
                          "
                        >
                          {{ category.name }}
                        </div>
                      </div>
                    </div>
                    <button
                      class="editor-close-btn"
                      (click)="cancelEditingThread()"
                    >
                      <i-lucide name="x" [size]="18"></i-lucide>
                    </button>
                  </div>

                  <div class="editor-divider"></div>

                  <!-- Title -->
                  <div class="editor-row">
                    <input
                      type="text"
                      [(ngModel)]="editThreadData.title"
                      placeholder="Title"
                      class="editor-title"
                      maxlength="200"
                      required
                    />
                  </div>

                  <div class="editor-divider"></div>

                  <!-- Content -->
                  <div class="editor-row">
                    <textarea
                      [(ngModel)]="editThreadData.content"
                      placeholder="Write your post content here..."
                      class="editor-content"
                      rows="8"
                      required
                    ></textarea>
                  </div>

                  <div class="editor-divider"></div>

                  <!-- Tags -->
                  <div class="editor-row">
                    <input
                      type="text"
                      [(ngModel)]="editThreadData.tags"
                      placeholder="Add tags (comma separated)"
                      class="editor-tags"
                    />
                  </div>

                  <div class="editor-divider"></div>

                  <!-- Footer with Lock and Actions -->
                  <div class="editor-footer">
                    <button
                      class="lock-toggle"
                      (click)="
                        editThreadData.isLocked = !editThreadData.isLocked
                      "
                      [class.locked]="editThreadData.isLocked"
                    >
                      <i-lucide name="lock" [size]="14"></i-lucide>
                      <span>{{
                        editThreadData.isLocked ? "Locked" : "Lock post"
                      }}</span>
                    </button>

                    <div class="editor-actions">
                      <button
                        class="btn btn-outline btn-sm"
                        (click)="cancelEditingThread()"
                        [disabled]="submittingThreadEdit"
                      >
                        Cancel
                      </button>
                      <button
                        class="btn btn-primary btn-sm"
                        (click)="saveThreadEdit()"
                        [disabled]="
                          !editThreadData.title ||
                          !editThreadData.content ||
                          !editThreadData.categoryId ||
                          submittingThreadEdit
                        "
                      >
                        <i-lucide
                          name="loader-2"
                          [size]="14"
                          *ngIf="submittingThreadEdit"
                          class="spinner"
                        ></i-lucide>
                        <span *ngIf="!submittingThreadEdit">Post</span>
                        <span *ngIf="submittingThreadEdit">Posting...</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- View Mode -->
              <div class="card thread-post" *ngIf="!isEditingThread">
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
                      <span
                        class="dot"
                        *ngIf="
                          thread.updatedAt &&
                          thread.updatedAt !== thread.createdAt
                        "
                        >•</span
                      >
                      <span
                        class="edited-indicator"
                        *ngIf="
                          thread.updatedAt &&
                          thread.updatedAt !== thread.createdAt
                        "
                        >edited</span
                      >
                    </div>
                  </div>
                  <div
                    class="thread-actions-menu"
                    *ngIf="canEditOrDeleteThread()"
                  >
                    <button class="menu-btn" (click)="toggleThreadMenu($event)">
                      <i-lucide name="more-vertical" [size]="20"></i-lucide>
                    </button>
                    <div class="dropdown-menu" *ngIf="showThreadMenu">
                      <button
                        class="dropdown-item"
                        (click)="startEditingThread()"
                      >
                        <i-lucide name="edit-3" [size]="16"></i-lucide>
                        Edit
                      </button>
                      <button
                        class="dropdown-item delete"
                        (click)="confirmDeleteThread()"
                      >
                        <i-lucide name="trash" [size]="16"></i-lucide>
                        Delete
                      </button>
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
                    {{ thread.upvoteCount || 0 | compactNumber }}
                  </button>
                  <button
                    class="action-btn downvote-btn"
                    [class.active]="userReaction === 'downvote'"
                    (click)="handleDownvote()"
                  >
                    <i-lucide name="chevron-down" [size]="18"></i-lucide>
                    {{ thread.downvoteCount || 0 | compactNumber }}
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
                <div
                  class="comment-sort card"
                  *ngIf="!thread.isLocked && posts.length > 0"
                >
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
                  (postDeleted)="onPostDeleted($event)"
                ></app-post-card>

                <app-empty-state
                  *ngIf="!loadingMore && posts.length === 0"
                  [title]="'No replies yet'"
                  [message]="
                    'Be the first one to share your thoughts on this thread!'
                  "
                  [showActionButton]="!thread.isLocked"
                  [actionText]="'Add Reply'"
                  [actionIcon]="'message-circle'"
                  [onActionClick]="toggleReplyBox.bind(this)"
                ></app-empty-state>

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

            <!-- Delete Confirmation Modal -->
            <app-confirm-modal
              [isOpen]="showDeleteThreadModal"
              [title]="'Delete Thread'"
              [message]="
                'Are you sure you want to delete this thread? This action cannot be undone.'
              "
              [confirmText]="'Delete'"
              [loadingText]="'Deleting...'"
              [isLoading]="deletingThread"
              (confirm)="deleteThread()"
              (close)="showDeleteThreadModal = false"
            ></app-confirm-modal>
          </main>

          <!-- Right Sidebar -->
          <aside class="right-sidebar">
            <div class="sidebar-widget card">
              <h3>Thread Stats</h3>
              <div class="stat-item">
                <i-lucide name="message-square" [size]="18"></i-lucide>
                <span
                  >{{ thread?.replyCount || 0 | compactNumber }} Comments</span
                >
              </div>
              <div class="stat-item">
                <i-lucide name="eye" [size]="18"></i-lucide>
                <span>{{ thread?.viewCount || 0 | compactNumber }} Views</span>
              </div>
            </div>

            <div class="sidebar-widget card" *ngIf="similarThreads.length > 0">
              <h3>Similar Threads</h3>
              <div class="similar-threads-list">
                <a
                  *ngFor="let similarThread of similarThreads"
                  [routerLink]="['/threads', similarThread.id]"
                  class="similar-thread-item"
                >
                  <div class="similar-thread-header">
                    <span class="similar-thread-title">{{
                      similarThread.title
                    }}</span>
                  </div>
                  <div class="similar-thread-meta">
                    <div class="similar-thread-author">
                      <img
                        [src]="
                          similarThread.author.avatar ||
                          'assets/default-avatar.svg'
                        "
                        [alt]="similarThread.author.username"
                        class="similar-thread-avatar"
                      />
                      <span class="similar-thread-username">{{
                        similarThread.author.username
                      }}</span>
                    </div>
                    <div class="similar-thread-stats">
                      <span class="stat-mini">
                        <i-lucide name="message-square" [size]="12"></i-lucide>
                        {{ similarThread.replyCount || 0 | compactNumber }}
                      </span>
                      <span class="stat-mini">
                        <i-lucide name="chevron-up" [size]="12"></i-lucide>
                        {{ similarThread.upvoteCount || 0 | compactNumber }}
                      </span>
                    </div>
                  </div>
                </a>
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
        grid-template-columns: 300px 1fr 300px;
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

      .thread-edit-card {
        padding: 0;
        margin-bottom: var(--spacing-md);
      }

      .edit-label {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--text-dark);
        flex: 1;
      }

      /* Custom Select for Category */
      .custom-select {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        cursor: pointer;
        user-select: none;
      }

      .selected-category {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--text-primary);
        width: 100%;
      }

      .selected-category.placeholder {
        color: var(--text-tertiary);
        font-weight: 400;
      }

      .dropdown-icon {
        color: var(--text-secondary);
        transition: transform 0.2s ease;
      }

      .custom-select:hover .dropdown-icon {
        color: var(--text-primary);
      }

      .category-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: var(--bg-primary);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        max-height: 250px;
        overflow-y: auto;
        z-index: 100;
      }

      .category-option {
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: 0.9375rem;
        color: var(--text-primary);
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .category-option:hover {
        background: var(--gray-50);
      }

      .category-option:first-child {
        border-radius: var(--radius-md) var(--radius-md) 0 0;
      }

      .category-option:last-child {
        border-radius: 0 0 var(--radius-md) var(--radius-md);
      }

      /* Editor Tags */
      .editor-tags {
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        font-size: 0.75rem;
        color: var(--text-light);
        outline: none;
        border-radius: 0;
      }

      .editor-tags:hover,
      .editor-tags:focus {
        background: transparent;
        border: none;
        outline: none;
        box-shadow: none;
      }

      .editor-tags::placeholder {
        color: var(--text-tertiary);
      }

      /* Lock Toggle */
      .lock-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        background: none;
        border: none;
        border-radius: 2px;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.1s ease;
      }

      .lock-toggle:hover {
        background: var(--gray-100);
        color: var(--text-primary);
      }

      .lock-toggle.locked {
        color: var(--primary);
        background: var(--primary-50);
      }

      .lock-toggle.locked:hover {
        background: var(--primary-100);
      }

      .thread-meta {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-md);
        position: relative;
      }

      .thread-actions-menu {
        margin-left: auto;
        position: relative;
      }

      .menu-btn {
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

      .menu-btn:hover {
        background: var(--gray-100);
        color: var(--text-primary);
      }

      .dropdown-menu {
        position: absolute;
        top: calc(100% + 4px);
        right: 0;
        background: var(--bg-primary);
        border: 1px solid var(--gray-200);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        min-width: 150px;
        z-index: 100;
        animation: fadeIn 0.15s ease-out;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        width: 100%;
        padding: var(--spacing-sm) var(--spacing-md);
        border: none;
        background: none;
        color: var(--text-dark);
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.15s ease;
        text-align: left;
      }

      .dropdown-item:hover {
        background: var(--gray-50);
      }

      .dropdown-item.delete {
        color: var(--primary);
      }

      .dropdown-item.delete:hover {
        background: var(--primary-50);
      }

      .dropdown-item:first-child {
        border-radius: var(--radius-md) var(--radius-md) 0 0;
      }

      .dropdown-item:last-child {
        border-radius: 0 0 var(--radius-md) var(--radius-md);
      }

      .author-name {
        font-weight: 700;
        color: var(--text-dark);
        font-size: 0.875rem;
      }

      .post-time {
        font-size: 0.75rem;
        color: var(--text-light);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .dot {
        color: var(--gray-400);
        font-size: 0.75rem;
      }

      .edited-indicator {
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
        animation: fadeIn 0.2s ease-out;
      }

      .editor-row {
        padding: var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
      }

      .editor-divider {
        height: 1px;
        background: var(--gray-200);
        margin: 0;
      }

      .editor-title {
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text-primary);
        outline: none;
        border-radius: 0;
      }

      .editor-title:hover,
      .editor-title:focus {
        background: transparent;
        border: none;
        outline: none;
        box-shadow: none;
      }

      .editor-title::placeholder {
        color: var(--text-tertiary);
        font-weight: 400;
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

      /* Similar Threads Styles */
      .similar-threads-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }

      .similar-thread-item {
        display: block;
        padding: 0;
        text-decoration: none;
        color: var(--text-dark);
        transition: all 0.2s ease;
      }

      .similar-thread-item:hover .similar-thread-title {
        color: var(--primary);
      }

      .similar-thread-header {
        margin-bottom: 6px;
      }

      .similar-thread-title {
        font-size: 0.8125rem;
        font-weight: 600;
        line-height: 1.3;
        color: var(--text-dark);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.15s ease;
      }

      .similar-thread-meta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.6875rem;
        color: var(--text-light);
      }

      .similar-thread-author {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .similar-thread-avatar {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .similar-thread-username {
        font-weight: 500;
        color: var(--text-secondary);
      }

      .similar-thread-stats {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
      }

      .stat-mini {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 0.6875rem;
        color: var(--text-light);
        font-weight: 600;
      }

      .stat-mini i-lucide {
        opacity: 0.7;
      }

      @media (max-width: 1024px) {
        .reddit-layout {
          grid-template-columns: 1fr 300px;
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
  showThreadMenu: boolean = false;
  showDeleteThreadModal: boolean = false;
  deletingThread: boolean = false;
  isEditingThread: boolean = false;
  editThreadData: any = {
    title: "",
    content: "",
    categoryId: "",
    tags: "",
    isLocked: false,
  };
  submittingThreadEdit: boolean = false;
  showCategoryDropdown: boolean = false;
  similarThreads: Thread[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private threadService: ThreadService,
    private reactionService: ReactionService,
    private bookmarkService: BookmarkService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Subscribe to route data changes to handle navigation between threads
    this.route.data.subscribe((data: any) => {
      const threadDetailData = data["threadDetailData"] as ThreadDetailData;
      if (threadDetailData) {
        this.loadThreadData(threadDetailData);
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      this.showThreadMenu = false;
    });
  }

  private loadThreadData(data: ThreadDetailData) {
    // Reset state when loading new thread
    this.isContentExpanded = false;
    this.showReplyBox = false;
    this.replyContent = "";
    this.isEditingThread = false;
    this.showThreadMenu = false;
    this.selectedSort = "best";

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

    // Use data from thread if available (provided by backend)
    if (this.thread.userReaction !== undefined) {
      this.userReaction = this.thread.userReaction;
    }
    if (this.thread.isBookmarked !== undefined) {
      this.isBookmarked = this.thread.isBookmarked;
    }

    // Load similar threads from resolved data
    this.similarThreads = data.similarThreads || [];

    // Scroll to top when navigating to new thread
    window.scrollTo(0, 0);
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
            this.thread.userReaction = null;
          } else {
            if (this.userReaction === "downvote") {
              this.thread.downvoteCount = Math.max(
                0,
                this.thread.downvoteCount - 1
              );
            }
            this.thread.upvoteCount++;
            this.userReaction = "upvote";
            this.thread.userReaction = "upvote";
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
            this.thread.userReaction = null;
          } else {
            if (this.userReaction === "upvote") {
              this.thread.upvoteCount = Math.max(
                0,
                this.thread.upvoteCount - 1
              );
            }
            this.thread.downvoteCount++;
            this.userReaction = "downvote";
            this.thread.userReaction = "downvote";
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
          if (this.thread) this.thread.isBookmarked = false;
        },
        error: (error) => {
          console.error("Error removing bookmark:", error);
        },
      });
    } else {
      this.bookmarkService.addBookmark(this.thread.id).subscribe({
        next: () => {
          this.isBookmarked = true;
          if (this.thread) this.thread.isBookmarked = true;
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

  onPostDeleted(event: {
    postId: string;
    deletedCount: number;
    newReplyCount: number;
  }) {
    // Remove the deleted post from the posts array
    this.posts = this.posts.filter((p) => p.id !== event.postId);
    if (this.thread) {
      // Use the new reply count from the backend for accuracy
      this.thread.replyCount = event.newReplyCount;
    }
    this.totalPosts = Math.max(0, this.totalPosts - 1);
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

  canEditOrDeleteThread(): boolean {
    return (
      this.currentUser &&
      this.thread &&
      this.currentUser.id === this.thread.author.id
    );
  }

  toggleThreadMenu(event: Event) {
    event.stopPropagation();
    this.showThreadMenu = !this.showThreadMenu;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  }

  toggleCategoryDropdown() {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  selectEditCategory(categoryId: string) {
    this.editThreadData.categoryId = categoryId;
    this.showCategoryDropdown = false;
  }

  startEditingThread() {
    if (!this.thread) return;
    this.editThreadData = {
      title: this.thread.title,
      content: this.thread.content,
      categoryId: this.thread.category?.id || "",
      tags: this.thread.tags ? this.thread.tags.join(", ") : "",
      isLocked: this.thread.isLocked || false,
    };
    this.isEditingThread = true;
    this.showThreadMenu = false;
  }

  cancelEditingThread() {
    this.isEditingThread = false;
    this.showCategoryDropdown = false;
    this.editThreadData = {
      title: "",
      content: "",
      categoryId: "",
      tags: "",
      isLocked: false,
    };
  }

  saveThreadEdit() {
    if (
      !this.thread ||
      !this.editThreadData.title ||
      !this.editThreadData.content ||
      !this.editThreadData.categoryId
    ) {
      return;
    }

    this.submittingThreadEdit = true;
    const updateData: any = {
      title: this.editThreadData.title,
      content: this.editThreadData.content,
      categoryId: this.editThreadData.categoryId,
      tags: this.editThreadData.tags
        ? this.editThreadData.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter((t: string) => t)
        : [],
      isLocked: this.editThreadData.isLocked,
    };

    this.threadService.updateThread(this.thread.id, updateData).subscribe({
      next: (updatedThread) => {
        if (this.thread) {
          this.thread.title = updatedThread.title;
          this.thread.content = updatedThread.content;
          this.thread.category = updatedThread.category;
          this.thread.tags = updatedThread.tags;
          this.thread.isLocked = updatedThread.isLocked;
          this.thread.updatedAt =
            updatedThread.updatedAt || new Date().toISOString();
        }
        this.isEditingThread = false;
        this.submittingThreadEdit = false;
      },
      error: (error) => {
        console.error("Error updating thread:", error);
        this.submittingThreadEdit = false;
      },
    });
  }

  confirmDeleteThread() {
    this.showThreadMenu = false;
    this.showDeleteThreadModal = true;
  }

  deleteThread() {
    if (!this.thread) return;

    this.deletingThread = true;
    this.threadService.deleteThread(this.thread.id).subscribe({
      next: () => {
        this.deletingThread = false;
        this.showDeleteThreadModal = false;
        this.router.navigate(["/"]);
      },
      error: (error) => {
        console.error("Error deleting thread:", error);
        this.deletingThread = false;
      },
    });
  }
}
