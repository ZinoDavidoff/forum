import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ThreadService } from "../../../core/services/thread.service";
import { CategoryService } from "../../../core/services/category.service";
import { Category } from "../../../core/models/models";

@Component({
  selector: "app-thread-create",
  template: `
    <div class="container">
      <div class="card">
        <h1><i-lucide name="edit" [size]="32"></i-lucide> Create New Thread</h1>
        <form [formGroup]="threadForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Category</label>
            <select formControlName="categoryId">
              <option value="">Select a category</option>
              <option *ngFor="let category of categories" [value]="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Title</label>
            <input
              type="text"
              formControlName="title"
              placeholder="Thread title"
            />
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea
              formControlName="content"
              rows="10"
              placeholder="Share your thoughts..."
            ></textarea>
          </div>
          <div class="form-group">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              formControlName="tags"
              placeholder="pregnancy, baby, tips"
            />
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="threadForm.invalid || loading"
          >
            {{ loading ? "Creating..." : "Create Thread" }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class ThreadCreateComponent {
  threadForm: FormGroup;
  categories: Category[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private threadService: ThreadService,
    private categoryService: CategoryService,
    private router: Router
  ) {
    this.threadForm = this.fb.group({
      title: ["", Validators.required],
      content: ["", Validators.required],
      categoryId: ["", Validators.required],
      tags: [""],
      slug: [""],
    });

    this.categoryService
      .getCategories()
      .subscribe((cats) => (this.categories = cats));
  }

  onSubmit() {
    if (this.threadForm.valid) {
      this.loading = true;
      const formData = { ...this.threadForm.value };
      formData.slug = formData.title.toLowerCase().replace(/\s+/g, "-");
      formData.tags = formData.tags
        ? formData.tags.split(",").map((t: string) => t.trim())
        : [];

      this.threadService.createThread(formData).subscribe({
        next: (thread) => this.router.navigate(["/threads", thread.id]),
        error: () => (this.loading = false),
      });
    }
  }
}
