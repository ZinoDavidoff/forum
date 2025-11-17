import { Component, OnInit } from "@angular/core";
import { ThreadService } from "../../core/services/thread.service";
import { CategoryService } from "../../core/services/category.service";
import { AuthService } from "../../core/services/auth.service";
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

  constructor(
    private threadService: ThreadService,
    private categoryService: CategoryService,
    private authService: AuthService
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

    this.threadService.getThreads(1, 10).subscribe({
      next: (response) => {
        this.featuredThreads = response.data;
        this.loading = false;
      },
    });
  }
}
