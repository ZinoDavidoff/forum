import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { skip } from "rxjs/operators";
import { ThreadService } from "../../core/services/thread.service";
import { CategoryService } from "../../core/services/category.service";
import { AuthService } from "../../core/services/auth.service";
import { UserService } from "../../core/services/user.service";
import { PostEditorService } from "../../core/services/post-editor.service";
import { Thread, Category, User } from "../../core/models/models";
import { HomeData } from "../../core/resolvers/home.resolver";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  featuredThreads: Thread[] = [];
  categories: Category[] = [];
  currentUser: User | null = null;
  loading = false;
  loadingMore = false;
  currentPage = 1;
  totalThreads = 0;
  totalMembers = 0;
  totalTopics = 0;
  lastPage = 1;
  selectedCategoryId: string | null = null;
  selectedSort: string = "hot";
  hasError = false;

  // Post creation state
  isCreatingPost = false;
  showCategoryDropdown = false;
  newPost = {
    title: "",
    content: "",
    categoryId: "",
    tags: "",
    isLocked: false,
  };
  submitting = false;

  constructor(
    private threadService: ThreadService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private userService: UserService,
    private postEditorService: PostEditorService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Listen for editor open events
    this.postEditorService.expandEditor$.subscribe(() => {
      this.expandPostCreator();
    });

    // Get data from resolver
    const homeData = this.route.snapshot.data["homeData"] as HomeData;

    // Check if resolver encountered an error
    if (homeData.error) {
      this.hasError = true;
      return;
    }

    this.categories = homeData.categories!;
    this.totalMembers = homeData.stats!.totalMembers;
    this.totalThreads = homeData.stats!.totalThreads;
    this.totalTopics = homeData.stats!.totalTopics;
    this.featuredThreads = homeData.threads!.data;
    this.lastPage = homeData.threads!.lastPage;
    this.currentPage = homeData.threads!.page;

    // Get initial categoryId from query params
    const initialCategoryId = this.route.snapshot.queryParams["categoryId"];
    this.selectedCategoryId = initialCategoryId || null;

    // Subscribe to query params changes (skip first emission since resolver already loaded data)
    this.route.queryParams.pipe(skip(1)).subscribe((params) => {
      const categoryId = params["categoryId"];
      this.selectedCategoryId = categoryId || null;
      this.loadThreads(categoryId);
    });
  }

  loadThreads(categoryId?: string, sort?: string) {
    this.loading = true;
    this.hasError = false;
    const sortParam = sort || this.selectedSort;
    this.threadService
      .getThreads(1, 5, categoryId, undefined, sortParam)
      .subscribe({
        next: (response) => {
          this.featuredThreads = response.data;
          this.currentPage = response.page;
          this.lastPage = response.lastPage;
          this.loading = false;
          this.hasError = false;
        },
        error: (error) => {
          console.error("Error loading threads:", error);
          this.loading = false;
          this.hasError = true;
        },
      });
  }

  retryLoadData() {
    // Reload the page to trigger the resolver again
    window.location.reload();
  }

  get hasMoreThreads(): boolean {
    return this.currentPage < this.lastPage;
  }

  loadMoreThreads() {
    if (this.loadingMore || !this.hasMoreThreads) {
      return;
    }

    this.loadingMore = true;
    const nextPage = this.currentPage + 1;

    this.threadService
      .getThreads(
        nextPage,
        5,
        this.selectedCategoryId || undefined,
        undefined,
        this.selectedSort
      )
      .subscribe({
        next: (response) => {
          this.featuredThreads = [...this.featuredThreads, ...response.data];
          this.currentPage = response.page;
          this.loadingMore = false;
        },
        error: (error) => {
          console.error("Error loading more threads:", error);
          this.loadingMore = false;
        },
      });
  }

  selectSort(sort: string) {
    if (this.selectedSort === sort) {
      return;
    }
    this.selectedSort = sort;
    this.loadThreads(this.selectedCategoryId || undefined, sort);
  }

  openPostEditor() {
    this.expandPostCreator();
  }

  expandPostCreator() {
    if (!this.currentUser) {
      this.router.navigate(["/login"]);
      return;
    }
    this.isCreatingPost = true;
    // Pre-populate category if one is selected via URL query parameter
    if (this.selectedCategoryId) {
      this.newPost.categoryId = this.selectedCategoryId;
    }
  }

  collapsePostCreator() {
    this.isCreatingPost = false;
    this.showCategoryDropdown = false;
    this.resetPostForm();
  }

  toggleCategoryDropdown() {
    this.showCategoryDropdown = !this.showCategoryDropdown;
  }

  selectCategory(categoryId: string) {
    this.newPost.categoryId = categoryId;
    this.showCategoryDropdown = false;
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : "";
  }

  get selectedCategory(): Category | null {
    if (!this.selectedCategoryId) {
      return null;
    }
    return (
      this.categories.find((c) => c.id === this.selectedCategoryId) || null
    );
  }

  resetPostForm() {
    this.newPost = {
      title: "",
      content: "",
      categoryId: "",
      tags: "",
      isLocked: false,
    };
  }

  createPost() {
    if (
      !this.newPost.title ||
      !this.newPost.content ||
      !this.newPost.categoryId
    ) {
      return;
    }

    this.submitting = true;
    const postData: any = {
      title: this.newPost.title,
      content: this.newPost.content,
      categoryId: this.newPost.categoryId,
      tags: this.newPost.tags
        ? this.newPost.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : [],
    };

    if (this.newPost.isLocked) {
      postData.isLocked = true;
    }

    this.threadService.createThread(postData).subscribe({
      next: (thread) => {
        this.submitting = false;
        this.collapsePostCreator();
        this.router.navigate(["/threads", thread.id]);
      },
      error: (error) => {
        console.error("Error creating thread:", error);
        this.submitting = false;
      },
    });
  }
}
