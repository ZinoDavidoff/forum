import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class BookmarkService {
  private apiUrl = `${environment.apiUrl}/users/me/bookmarks`;

  constructor(private http: HttpClient) {}

  addBookmark(threadId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${threadId}`, {});
  }

  removeBookmark(threadId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${threadId}`);
  }

  isBookmarked(threadId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${threadId}`);
  }

  getBookmarks(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get(this.apiUrl, {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }
}
