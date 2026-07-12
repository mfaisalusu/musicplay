import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Follower, CreateFollowerDto, FollowStatus } from '../models/follower.model';

@Injectable({ providedIn: 'root' })
export class FollowerService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<Follower[]> {
    return this.http.get<Follower[]>(`${this.baseUrl}/followers`);
  }

  getFollowersOf(userId: number): Observable<Follower[]> {
    return this.http.get<Follower[]>(`${this.baseUrl}/followers`, { params: new HttpParams().set('userId', userId) });
  }

  getFollowingOf(followerId: number): Observable<Follower[]> {
    return this.http.get<Follower[]>(`${this.baseUrl}/followers`, { params: new HttpParams().set('followerId', followerId) });
  }

  getRelation(userId: number, followerId: number): Observable<Follower[]> {
    return this.http.get<Follower[]>(`${this.baseUrl}/followers`, {
      params: new HttpParams().set('userId', userId).set('followerId', followerId)
    });
  }

  follow(dto: CreateFollowerDto): Observable<Follower> {
    return this.http.post<Follower>(`${this.baseUrl}/followers`, dto);
  }

  updateStatus(id: number, status: FollowStatus): Observable<Follower> {
    return this.http.patch<Follower>(`${this.baseUrl}/followers/${id}`, { status });
  }

  unfollow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/followers/${id}`);
  }
}
