import { Injectable } from "@angular/core";
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, forkJoin, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { ThreadService } from "../services/thread.service";
import { CategoryService } from "../services/category.service";
import { UserService } from "../services/user.service";
import { Thread, Category } from "../models/models";

export interface HomeData {
  threads?: { data: Thread[]; page: number; lastPage: number };
  categories?: Category[];
  stats?: { totalMembers: number; totalThreads: number; totalTopics: number };
  error?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class HomeResolver implements Resolve<HomeData> {
  constructor(
    private threadService: ThreadService,
    private categoryService: CategoryService,
    private userService: UserService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<HomeData> {
    const categoryId = route.queryParams["categoryId"];
    const sort = route.queryParams["sort"] || "hot";
    return forkJoin({
      threads: this.threadService.getThreads(
        1,
        5,
        categoryId || undefined,
        undefined,
        sort
      ),
      categories: this.categoryService.getCategories(),
      stats: this.userService.getStats(),
    }).pipe(
      map((data) => data as HomeData),
      catchError((error) => {
        console.error("Error in HomeResolver:", error);
        return of({ error: true } as HomeData);
      })
    );
  }
}
