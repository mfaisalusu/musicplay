import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, map, catchError } from 'rxjs';
import { AuthStore } from '../stores/auth.store';
import { LoginDto, RegisterDto, AuthSession } from '../models/auth.model';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);
  private readonly baseUrl = environment.apiUrl;

  private handleError(err: HttpErrorResponse): Observable<never> {
    const message = err.error?.message || err.message || 'Something went wrong';
    return throwError(() => new Error(message));
  }

  login(dto: LoginDto): Observable<void> {
    return this.http.post<ApiResponse<AuthSession>>(`${this.baseUrl}/auth/login`, {
      email: dto.email,
      password: dto.password
    }).pipe(
      map(res => {
        this.authStore.setSession(res.data, dto.remember);
        return undefined as void;
      }),
      catchError(err => this.handleError(err))
    );
  }

  register(dto: RegisterDto): Observable<void> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/auth/register`, {
      username: dto.username,
      email: dto.email,
      password: dto.password
    }).pipe(
      map(res => {
        const user = res.data;
        this.authStore.setSession(
          { userId: user.id, username: user.username, email: user.email, avatar: user.avatar },
          false
        );
        this.authStore.setCurrentUser(user);
        return undefined as void;
      }),
      catchError(err => this.handleError(err))
    );
  }

  logout(): void {
    this.authStore.clearSession();
  }
}
