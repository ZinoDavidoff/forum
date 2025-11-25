import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Thread, Category, Post, User } from "../models/models";

export interface SearchResults {
  threads: {
    data: Thread[];
    total: number;
    page: number;
    lastPage: number;
  };
  categories: {
    data: Category[];
    total: number;
    page: number;
    lastPage: number;
  };
  posts: {
    data: Post[];
    total: number;
    page: number;
    lastPage: number;
  };
  users: {
    data: User[];
    total: number;
    page: number;
    lastPage: number;
  };
}

@Injectable({
  providedIn: "root",
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  searchAll(
    query: string,
    page: number = 1,
    limit: number = 5
  ): Observable<SearchResults> {
    const params = new HttpParams()
      .set("q", query)
      .set("page", page.toString())
      .set("limit", limit.toString());

    return this.http.get<SearchResults>(this.apiUrl, { params });
  }

  searchThreads(
    query: string,
    page: number = 1,
    limit: number = 5
  ): Observable<{
    data: Thread[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const params = new HttpParams()
      .set("q", query)
      .set("page", page.toString())
      .set("limit", limit.toString());

    return this.http.get<{
      data: Thread[];
      total: number;
      page: number;
      lastPage: number;
    }>(`${this.apiUrl}/threads`, { params });
  }

  searchCategories(
    query: string,
    page: number = 1,
    limit: number = 5
  ): Observable<{
    data: Category[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const params = new HttpParams()
      .set("q", query)
      .set("page", page.toString())
      .set("limit", limit.toString());

    return this.http.get<{
      data: Category[];
      total: number;
      page: number;
      lastPage: number;
    }>(`${this.apiUrl}/categories`, { params });
  }

  searchPosts(
    query: string,
    page: number = 1,
    limit: number = 5
  ): Observable<{
    data: Post[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const params = new HttpParams()
      .set("q", query)
      .set("page", page.toString())
      .set("limit", limit.toString());

    return this.http.get<{
      data: Post[];
      total: number;
      page: number;
      lastPage: number;
    }>(`${this.apiUrl}/posts`, { params });
  }

  searchUsers(
    query: string,
    page: number = 1,
    limit: number = 5
  ): Observable<{
    data: User[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const params = new HttpParams()
      .set("q", query)
      .set("page", page.toString())
      .set("limit", limit.toString());

    return this.http.get<{
      data: User[];
      total: number;
      page: number;
      lastPage: number;
    }>(`${this.apiUrl}/users`, { params });
  }
}
