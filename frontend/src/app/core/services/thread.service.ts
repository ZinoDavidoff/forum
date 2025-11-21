import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { Thread } from "../models/models";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ThreadService {
  private apiUrl = `${environment.apiUrl}/threads`;

  constructor(private http: HttpClient) {}

  getThreads(
    page: number = 1,
    limit: number = 20,
    categoryId?: string,
    search?: string,
    sort: string = "hot"
  ): Observable<any> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("limit", limit.toString())
      .set("sort", sort);

    if (categoryId) {
      params = params.set("categoryId", categoryId);
    }

    if (search) {
      params = params.set("search", search);
    }

    return this.http.get(this.apiUrl, { params });
  }

  getThread(id: string): Observable<Thread> {
    return this.http.get<Thread>(`${this.apiUrl}/${id}`);
  }

  createThread(data: any): Observable<Thread> {
    return this.http.post<Thread>(this.apiUrl, data);
  }

  updateThread(id: string, data: any): Observable<Thread> {
    return this.http.put<Thread>(`${this.apiUrl}/${id}`, data);
  }

  deleteThread(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
