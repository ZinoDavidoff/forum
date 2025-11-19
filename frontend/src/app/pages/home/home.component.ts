import { Component, OnInit } from "@angular/core";
import { ThreadService } from "../../core/services/thread.service";
import { CategoryService } from "../../core/services/category.service";
import { AuthService } from "../../core/services/auth.service";
import { UserService } from "../../core/services/user.service";
import { Thread, Category, User } from "../../core/models/models";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
})
export class HomeComponent implements OnInit {
  featuredThreads: Thread[] = [];
  categories: Category[] = [];
  currentUser: User | null = null;
  loading = true;
  loadingMore = false;
  currentPage = 1;
  totalThreads = 0;
  totalMembers = 0;
  lastPage = 1;

  constructor(
    private threadService: ThreadService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.loadData();
  }

  loadData() {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
    });

    this.userService.getStats().subscribe({
      next: (stats) => {
        this.totalMembers = stats.totalMembers;
        this.totalThreads = stats.totalThreads;
      },
    });

    this.threadService.getThreads(1, 5).subscribe({
      next: (response) => {
        this.featuredThreads = response.data;
        this.lastPage = response.lastPage;
        this.currentPage = response.page;
        this.loading = false;
      },
    });
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

    this.threadService.getThreads(nextPage, 5).subscribe({
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
}
