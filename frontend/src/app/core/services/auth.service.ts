import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      this.http.get<User>(`${environment.apiUrl}/users/me`).subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout(),
      });
    }
  }

  register(username: string, email: string, password: string, fullName?: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, {
      username,
      email,
      password,
      fullName,
    }).pipe(
      tap((response: any) => {
        localStorage.setItem(this.tokenKey, response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/login`, {
      email,
      password,
    }).pipe(
      tap((response: any) => {
        localStorage.setItem(this.tokenKey, response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
