import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Playlist, CreatePlaylistDto, UpdatePlaylistDto } from '../models/playlist.model';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}/playlists`);
  }

  getById(id: number): Observable<Playlist> {
    return this.http.get<Playlist>(`${this.baseUrl}/playlists/${id}`);
  }

  getByUserId(userId: number): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}/playlists`, { params: new HttpParams().set('userId', userId) });
  }

  create(dto: CreatePlaylistDto): Observable<Playlist> {
    return this.http.post<Playlist>(`${this.baseUrl}/playlists`, dto);
  }

  update(id: number, dto: UpdatePlaylistDto): Observable<Playlist> {
    return this.http.patch<Playlist>(`${this.baseUrl}/playlists/${id}`, dto);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/playlists/${id}`);
  }
}
