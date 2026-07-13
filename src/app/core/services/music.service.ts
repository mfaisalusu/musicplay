import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Music, CreateMusicDto, UpdateMusicDto } from '../models/music.model';

interface ApiResponse<T> { success: boolean; data: T; }

@Injectable({ providedIn: 'root' })
export class MusicService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<Music[]> {
    return this.http.get<ApiResponse<Music[]>>(`${this.baseUrl}/musics`).pipe(map(r => r.data));
  }

  getById(id: number): Observable<Music> {
    return this.http.get<ApiResponse<Music>>(`${this.baseUrl}/musics/${id}`).pipe(map(r => r.data));
  }

  getByPlaylistId(playlistId: number): Observable<Music[]> {
    return this.http.get<ApiResponse<Music[]>>(`${this.baseUrl}/musics`, {
      params: new HttpParams().set('playlist_id', playlistId)
    }).pipe(map(r => r.data));
  }

  create(dto: CreateMusicDto): Observable<Music> {
    return this.http.post<ApiResponse<Music>>(`${this.baseUrl}/musics`, {
      playlist_id: dto.playlistId,
      platform: dto.platform,
      url: dto.url,
      title: dto.title,
      thumbnail: dto.thumbnail,
      duration: dto.duration,
      order: dto.order
    }).pipe(map(r => r.data));
  }

  update(id: number, dto: UpdateMusicDto): Observable<Music> {
    return this.http.patch<ApiResponse<Music>>(`${this.baseUrl}/musics/${id}`, dto).pipe(map(r => r.data));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/musics/${id}`).pipe(map(r => r.data));
  }
}
