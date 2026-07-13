import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Follower, CreateFollowerDto, FollowStatus } from '../models/follower.model';

interface ApiResponse<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class FollowerService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getFollowersOf(userId: number): Observable<Follower[]> {
    return this.http.get<ApiResponse<Follower[]>>(`${this.baseUrl}/followers`, {
      params: new HttpParams().set('user_id', userId)
    }).pipe(map(r => r.data));
  }

  getFollowingOf(followerId: number): Observable<Follower[]> {
    return this.http.get<ApiResponse<Follower[]>>(`${this.baseUrl}/followers`, {
      params: new HttpParams().set('follower_id', followerId)
    }).pipe(map(r => r.data));
  }

  getRelation(userId: number, followerId: number): Observable<Follower[]> {
    return this.http.get<ApiResponse<Follower[]>>(`${this.baseUrl}/followers`, {
      params: new HttpParams().set('user_id', userId).set('follower_id', followerId)
    }).pipe(map(r => r.data));
  }

  follow(dto: CreateFollowerDto): Observable<Follower> {
    return this.http.post<ApiResponse<Follower>>(`${this.baseUrl}/followers`, {
      user_id: dto.userId,
      follower_id: dto.followerId
    }).pipe(map(r => r.data));
  }

  updateStatus(id: number, status: FollowStatus): Observable<Follower> {
    return this.http.patch<ApiResponse<Follower>>(`${this.baseUrl}/followers/${id}`, { status })
      .pipe(map(r => r.data));
  }

  unfollow(userId: number, followerId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/followers`, {
      body: { user_id: userId, follower_id: followerId }
    }).pipe(map(r => r.data));
  }
}
