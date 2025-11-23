import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export enum ReactionType {
  UPVOTE = "upvote",
  DOWNVOTE = "downvote",
  LOVE = "love",
  HELPFUL = "helpful",
  FUNNY = "funny",
  SAD = "sad",
}

export enum TargetType {
  POST = "post",
  THREAD = "thread",
}

@Injectable({
  providedIn: "root",
})
export class ReactionService {
  private apiUrl = `${environment.apiUrl}/reactions`;

  constructor(private http: HttpClient) {}

  // Post reactions
  addPostReaction(postId: string, type: ReactionType): Observable<any> {
    return this.http.post(`${this.apiUrl}/post/${postId}`, { type });
  }

  removePostReaction(postId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/post/${postId}`);
  }

  getUserPostReaction(postId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/post/${postId}`);
  }

  getPostReactions(postId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/post/${postId}`);
  }

  // Thread reactions
  addThreadReaction(threadId: string, type: ReactionType): Observable<any> {
    return this.http.post(`${this.apiUrl}/thread/${threadId}`, { type });
  }

  removeThreadReaction(threadId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/thread/${threadId}`);
  }

  getUserThreadReaction(threadId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/thread/${threadId}`);
  }

  getThreadReactions(threadId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/thread/${threadId}`);
  }
}
