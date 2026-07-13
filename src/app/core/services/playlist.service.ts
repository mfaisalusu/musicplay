import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Playlist, CreatePlaylistDto, UpdatePlaylistDto } from '../models/playlist.model';

interface ApiResponse<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<Playlist[]> {
    return this.http.get<ApiResponse<Playlist[]>>(`${this.baseUrl}/playlists`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Playlist> {
    return this.http.get<ApiResponse<Playlist>>(`${this.baseUrl}/playlists/${id}`).pipe(map(r => r.data));
  }

  getByUserId(userId: number): Observable<Playlist[]> {
    return this.http.get<ApiResponse<Playlist[]>>(`${this.baseUrl}/playlists`, {
      params: new HttpParams().set('user_id', userId)
    }).pipe(map(r => r.data));
  }

  create(dto: CreatePlaylistDto): Observable<Playlist> {
    return this.http.post<ApiResponse<Playlist>>(`${this.baseUrl}/playlists`, {
      user_id: dto.userId,
      title: dto.title,
      description: dto.description,
      cover: dto.cover
    }).pipe(map(r => r.data));
  }

  update(id: number, dto: UpdatePlaylistDto): Observable<Playlist> {
    return this.http.patch<ApiResponse<Playlist>>(`${this.baseUrl}/playlists/${id}`, dto).pipe(map(r => r.data));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/playlists/${id}`).pipe(map(r => r.data));
  }
}
