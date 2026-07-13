import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Favorite, History } from '../models/favorite.model';

interface ApiResponse<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getFavorites(userId: number, type?: 'playlist' | 'music'): Observable<Favorite[]> {
    let params = new HttpParams().set('user_id', userId);
    if (type) params = params.set('type', type);
    return this.http.get<ApiResponse<Favorite[]>>(`${this.baseUrl}/favorites`, { params })
      .pipe(map(r => r.data));
  }

  addFavorite(userId: number, type: 'playlist' | 'music', targetId: number): Observable<Favorite> {
    return this.http.post<ApiResponse<Favorite>>(`${this.baseUrl}/favorites`, {
      user_id: userId,
      type,
      target_id: targetId
    }).pipe(map(r => r.data));
  }

  removeFavorite(userId: number, type: 'playlist' | 'music', targetId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/favorites`, {
      body: { user_id: userId, type, target_id: targetId }
    }).pipe(map(r => r.data));
  }

  getHistory(userId: number): Observable<History[]> {
    return this.http.get<ApiResponse<History[]>>(`${this.baseUrl}/history`, {
      params: new HttpParams().set('user_id', userId)
    }).pipe(map(r => r.data));
  }

  addHistory(userId: number, musicId: number, playlistId: number): Observable<History> {
    return this.http.post<ApiResponse<History>>(`${this.baseUrl}/history`, {
      user_id: userId,
      music_id: musicId,
      playlist_id: playlistId
    }).pipe(map(r => r.data));
  }
}
