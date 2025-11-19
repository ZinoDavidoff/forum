import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { User } from "../models/models";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1, limit: number = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getStats(): Observable<{ totalMembers: number }> {
    return this.http.get<{ totalMembers: number }>(`${this.apiUrl}/stats`);
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, data);
  }
}
