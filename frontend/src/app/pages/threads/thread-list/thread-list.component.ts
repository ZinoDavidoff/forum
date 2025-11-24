import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ThreadService } from "../../../core/services/thread.service";
import { PostEditorService } from "../../../core/services/post-editor.service";
import { Thread } from "../../../core/models/models";

@Component({
  selector: "app-thread-list",
  template: `
    <div class="container">
      <div class="thread-list-header">
        <h1>
          <i-lucide name="message-circle" [size]="32"></i-lucide> Discussions
        </h1>
        <button class="btn btn-primary" (click)="openPostEditor()">
          <i-lucide name="edit" [size]="18"></i-lucide> New Thread
        </button>
      </div>
      <div *ngIf="loading" class="text-center">
        <app-loading-spinner></app-loading-spinner>
      </div>
      <div class="threads-list" *ngIf="!loading">
        <app-thread-card
          *ngFor="let thread of threads"
          [thread]="thread"
        ></app-thread-card>
      </div>
      <app-empty-state
        *ngIf="!loading && threads.length === 0"
        [title]="'No threads yet'"
        [message]="'Be the first one to start a conversation in this category!'"
        [showActionButton]="true"
        [actionText]="'Create Thread'"
        [actionIcon]="'edit'"
        [onActionClick]="openPostEditor.bind(this)"
      ></app-empty-state>
    </div>
  `,
  styles: [
    `
      .thread-list-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-xl);
      }
      .threads-list {
        margin-bottom: var(--spacing-xl);
      }
    `,
  ],
})
export class ThreadListComponent implements OnInit {
  threads: Thread[] = [];
  loading = true;

  constructor(
    private threadService: ThreadService,
    private postEditorService: PostEditorService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const categoryId = params["categoryId"];
      this.loadThreads(categoryId);
    });
  }

  openPostEditor() {
    this.postEditorService.openEditor();
  }

  loadThreads(categoryId?: string) {
    this.threadService.getThreads(1, 20, categoryId).subscribe({
      next: (response) => {
        this.threads = response.data;
        this.loading = false;
      },
    });
  }
}
