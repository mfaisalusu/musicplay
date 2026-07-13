import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UpdateUserDto } from '../models/user.model';

interface ApiResponse<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/users`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<User> {
    return this.http.get<ApiResponse<User>>(`${this.baseUrl}/users/${id}`).pipe(map(r => r.data));
  }

  // Dipakai auth lama — sekarang tidak digunakan, tapi tetap ada untuk kompatibilitas
  getByEmail(email: string): Observable<User[]> {
    return this.getAll().pipe(map(users => users.filter(u => u.email === email)));
  }

  create(dto: any): Observable<User> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/auth/register`, dto).pipe(map(r => r.data));
  }

  update(id: number, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<ApiResponse<User>>(`${this.baseUrl}/users/${id}`, dto).pipe(map(r => r.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/users/${id}`).pipe(map(r => r.data));
  }
}
