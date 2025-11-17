import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  getPostsByThread(threadId: string, page: number = 1, limit: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.apiUrl}/thread/${threadId}`, { params });
  }

  getPost(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`);
  }

  createPost(data: any): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, data);
  }

  updatePost(id: string, data: any): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, data);
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
