import { Injectable } from "@angular/core";
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable, forkJoin } from "rxjs";
import { ThreadService } from "../services/thread.service";
import { PostService } from "../services/post.service";
import { Thread, Post } from "../models/models";

export interface ThreadDetailData {
  thread: Thread;
  posts: { data: Post[]; page: number; lastPage: number; total: number };
}

@Injectable({
  providedIn: "root",
})
export class ThreadDetailResolver implements Resolve<ThreadDetailData> {
  constructor(
    private threadService: ThreadService,
    private postService: PostService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<ThreadDetailData> {
    const id = route.params["id"];
    return forkJoin({
      thread: this.threadService.getThread(id),
      posts: this.postService.getPostsByThread(id, 1),
    });
  }
}
