import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  takeUntil,
} from "rxjs/operators";
import { AuthService } from "../../core/services/auth.service";
import { PostEditorService } from "../../core/services/post-editor.service";
import { SearchService } from "../../core/services/search.service";
import { User, Thread, Category, Post } from "../../core/models/models";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isMenuOpen = false;

  searchQuery: string = "";
  searchResults: {
    threads: Thread[];
    categories: Category[];
    posts: Post[];
    profiles: User[];
  } = {
    threads: [],
    categories: [],
    posts: [],
    profiles: [],
  };

  searchTotals = {
    threads: 0,
    categories: 0,
    posts: 0,
    profiles: 0,
  };

  isLoading = false;
  showDropdown = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  private readonly MIN_SEARCH_LENGTH = 3;

  // Pagination state
  private currentPage = {
    threads: 1,
    categories: 1,
    posts: 1,
    profiles: 1,
  };

  constructor(
    public authService: AuthService,
    private postEditorService: PostEditorService,
    private router: Router,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    // Setup debounced search
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => {
          // Allow empty string to always pass through (for reset)
          // But prevent duplicate non-empty queries only if previous was also non-empty
          if (prev === "" || curr === "") return false;
          return prev === curr;
        }),
        switchMap((query) => {
          if (query.length >= this.MIN_SEARCH_LENGTH) {
            this.isLoading = true;
            // Reset pagination when new search
            this.currentPage = {
              threads: 1,
              categories: 1,
              posts: 1,
              profiles: 1,
            };
            return this.searchService.searchAll(query, 1, 5);
          } else {
            this.isLoading = false;
            this.searchResults = {
              threads: [],
              categories: [],
              posts: [],
              profiles: [],
            };
            this.searchTotals = {
              threads: 0,
              categories: 0,
              posts: 0,
              profiles: 0,
            };
            // Reset pagination
            this.currentPage = {
              threads: 1,
              categories: 1,
              posts: 1,
              profiles: 1,
            };
            return [];
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (results) => {
          if (results && results.threads) {
            // For initial search, replace results
            // For pagination, results are appended in loadMore methods
            if (
              this.currentPage.threads === 1 &&
              this.currentPage.categories === 1 &&
              this.currentPage.posts === 1 &&
              this.currentPage.profiles === 1
            ) {
              this.searchResults = {
                threads: results.threads.data || [],
                categories: results.categories.data || [],
                posts: results.posts.data || [],
                profiles: results.users.data || [],
              };
            }
            this.searchTotals = {
              threads: results.threads.total || 0,
              categories: results.categories.total || 0,
              posts: results.posts.total || 0,
              profiles: results.users.total || 0,
            };
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error("Search error:", error);
          this.isLoading = false;
        },
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;

    if (this.searchQuery.length >= this.MIN_SEARCH_LENGTH) {
      this.showDropdown = true;
      this.searchSubject.next(this.searchQuery);
    } else {
      this.showDropdown = false;
      this.searchResults = {
        threads: [],
        categories: [],
        posts: [],
        profiles: [],
      };
      this.searchTotals = {
        threads: 0,
        categories: 0,
        posts: 0,
        profiles: 0,
      };
    }
  }

  onSearchFocus() {
    if (this.searchQuery.length >= this.MIN_SEARCH_LENGTH) {
      this.showDropdown = true;
    }
  }

  clearSearch() {
    this.searchQuery = "";
    this.showDropdown = false;
    this.searchResults = {
      threads: [],
      categories: [],
      posts: [],
      profiles: [],
    };
    this.searchTotals = {
      threads: 0,
      categories: 0,
      posts: 0,
      profiles: 0,
    };
    // Reset pagination
    this.currentPage = {
      threads: 1,
      categories: 1,
      posts: 1,
      profiles: 1,
    };
    // Force the search subject to reset by sending a special value
    // This ensures distinctUntilChanged doesn't block the next search
    this.searchSubject.next("");
  }

  @HostListener("document:click", ["$event"])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    // Don't close if clicking inside search-bar or search-dropdown
    if (
      !target.closest(".search-bar") &&
      !target.closest(".search-dropdown") &&
      !target.closest(".search-section-footer")
    ) {
      this.showDropdown = false;
    }
  }

  onLoadMoreThreads() {
    this.currentPage.threads++;
    this.searchService
      .searchThreads(this.searchQuery, this.currentPage.threads, 5)
      .subscribe({
        next: (result) => {
          this.searchResults.threads = [
            ...this.searchResults.threads,
            ...(result.data || []),
          ];
        },
        error: (error) => {
          console.error("Error loading more threads:", error);
          this.currentPage.threads--; // Revert on error
        },
      });
  }

  onLoadMoreCategories() {
    this.currentPage.categories++;
    this.searchService
      .searchCategories(this.searchQuery, this.currentPage.categories, 5)
      .subscribe({
        next: (result) => {
          this.searchResults.categories = [
            ...this.searchResults.categories,
            ...(result.data || []),
          ];
        },
        error: (error) => {
          console.error("Error loading more categories:", error);
          this.currentPage.categories--; // Revert on error
        },
      });
  }

  onLoadMorePosts() {
    this.currentPage.posts++;
    this.searchService
      .searchPosts(this.searchQuery, this.currentPage.posts, 5)
      .subscribe({
        next: (result) => {
          this.searchResults.posts = [
            ...this.searchResults.posts,
            ...(result.data || []),
          ];
        },
        error: (error) => {
          console.error("Error loading more posts:", error);
          this.currentPage.posts--; // Revert on error
        },
      });
  }

  onLoadMoreProfiles() {
    this.currentPage.profiles++;
    this.searchService
      .searchUsers(this.searchQuery, this.currentPage.profiles, 5)
      .subscribe({
        next: (result) => {
          this.searchResults.profiles = [
            ...this.searchResults.profiles,
            ...(result.data || []),
          ];
        },
        error: (error) => {
          console.error("Error loading more profiles:", error);
          this.currentPage.profiles--; // Revert on error
        },
      });
  }

  openPostEditor() {
    this.postEditorService.openEditor();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(["/login"]);
  }
}
