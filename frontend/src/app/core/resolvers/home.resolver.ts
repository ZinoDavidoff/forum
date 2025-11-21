import { Injectable } from "@angular/core";
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, forkJoin } from "rxjs";
import { ThreadService } from "../services/thread.service";
import { CategoryService } from "../services/category.service";
import { UserService } from "../services/user.service";
import { Thread, Category } from "../models/models";

export interface HomeData {
  threads: { data: Thread[]; page: number; lastPage: number };
  categories: Category[];
  stats: { totalMembers: number; totalThreads: number };
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
    return forkJoin({
      threads: this.threadService.getThreads(1, 5),
      categories: this.categoryService.getCategories(),
      stats: this.userService.getStats(),
    });
  }
}
