import { Injectable } from "@angular/core";
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ThreadService } from "../services/thread.service";
import { PostService } from "../services/post.service";
import { CategoryService } from "../services/category.service";
import { Thread, Post, Category } from "../models/models";

export interface ThreadDetailData {
  thread?: Thread;
  posts?: { data: Post[]; page: number; lastPage: number; total: number };
  categories?: Category[];
  similarThreads?: Thread[];
  error?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class ThreadDetailResolver implements Resolve<ThreadDetailData> {
  constructor(
    private threadService: ThreadService,
    private postService: PostService,
    private categoryService: CategoryService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ThreadDetailData> {
    const id = route.params["id"];
    const sort = route.queryParams["sort"] || "best";
    return forkJoin({
      thread: this.threadService.getThread(id),
      posts: this.postService.getPostsByThread(id, 1, 20, sort),
      categories: this.categoryService.getCategories(),
      similarThreads: this.threadService.getSimilarThreads(id, 5),
    }).pipe(
      map((data) => data as ThreadDetailData),
      catchError((error) => {
        console.error("Error in ThreadDetailResolver:", error);
        return of({ error: true } as ThreadDetailData);
      })
    );
  }
}
