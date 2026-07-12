import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/${id}`);
  }

  getByEmail(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`, { params: new HttpParams().set('email', email) });
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, dto);
  }

  update(id: number, dto: UpdateUserDto): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/users/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }
}
