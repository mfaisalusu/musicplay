import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Favorite, History } from '../models/favorite.model';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getFavorites(userId: number): Observable<Favorite[]> {
    return this.http.get<Favorite[]>(`${this.baseUrl}/favorites`, { params: new HttpParams().set('userId', userId) });
  }

  addFavorite(userId: number, type: 'playlist' | 'music', targetId: number): Observable<Favorite> {
    return this.http.post<Favorite>(`${this.baseUrl}/favorites`, { userId, type, targetId, createdAt: new Date().toISOString() });
  }

  removeFavorite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/favorites/${id}`);
  }

  getHistory(userId: number): Observable<History[]> {
    return this.http.get<History[]>(`${this.baseUrl}/history`, { params: new HttpParams().set('userId', userId) });
  }

  addHistory(userId: number, musicId: number, playlistId: number): Observable<History> {
    return this.http.post<History>(`${this.baseUrl}/history`, { userId, musicId, playlistId, playedAt: new Date().toISOString() });
  }
}
