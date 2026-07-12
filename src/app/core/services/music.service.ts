import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Music, CreateMusicDto, UpdateMusicDto } from '../models/music.model';

@Injectable({ providedIn: 'root' })
export class MusicService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAll(): Observable<Music[]> {
    return this.http.get<Music[]>(`${this.baseUrl}/musics`);
  }

  getById(id: number): Observable<Music> {
    return this.http.get<Music>(`${this.baseUrl}/musics/${id}`);
  }

  getByPlaylistId(playlistId: number): Observable<Music[]> {
    return this.http.get<Music[]>(`${this.baseUrl}/musics`, { params: new HttpParams().set('playlistId', playlistId) });
  }

  create(dto: CreateMusicDto): Observable<Music> {
    return this.http.post<Music>(`${this.baseUrl}/musics`, dto);
  }

  update(id: number, dto: UpdateMusicDto): Observable<Music> {
    return this.http.patch<Music>(`${this.baseUrl}/musics/${id}`, dto);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/musics/${id}`);
  }
}
