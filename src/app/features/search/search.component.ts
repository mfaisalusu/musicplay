import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, switchMap, forkJoin, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Music } from '@core/models/music.model';
import { Playlist } from '@core/models/playlist.model';
import { User } from '@core/models/user.model';
import { MusicService } from '@core/services/music.service';
import { PlaylistService } from '@core/services/playlist.service';
import { UserService } from '@core/services/user.service';
import { getPlaylistCover } from '@core/utils/avatar.util';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';

type Tab = 'all' | 'users' | 'playlists' | 'music';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AvatarComponent],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly playlistService = inject(PlaylistService);
  private readonly musicService = inject(MusicService);

  query = '';
  readonly loading = signal(false);
  readonly activeTab = signal<Tab>('all');
  readonly users = signal<User[]>([]);
  readonly playlists = signal<Playlist[]>([]);
  readonly musics = signal<Music[]>([]);

  readonly tabs = [
    { label: 'All', value: 'all' as Tab },
    { label: 'Users', value: 'users' as Tab },
    { label: 'Playlists', value: 'playlists' as Tab },
    { label: 'Music', value: 'music' as Tab }
  ];

  readonly search$ = new Subject<string>();

  constructor() {
    this.search$.pipe(
      debounceTime(300),
      switchMap(q => {
        if (!q.trim()) return of(null);
        this.loading.set(true);
        return forkJoin({
          users: this.userService.getAll(),
          playlists: this.playlistService.getAll(),
          musics: this.musicService.getAll()
        });
      }),
      takeUntilDestroyed()
    ).subscribe(result => {
      if (!result) {
        this.users.set([]);
        this.playlists.set([]);
        this.musics.set([]);
        this.loading.set(false);
        return;
      }
      const q = this.query.toLowerCase();
      const r = result as { users: User[]; playlists: Playlist[]; musics: Music[] };
      this.users.set(r.users.filter((u: User) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)));
      this.playlists.set(r.playlists.filter((p: Playlist) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)));
      this.musics.set(r.musics.filter((m: Music) => m.title.toLowerCase().includes(q)));
      this.loading.set(false);
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.query = params['q'];
        this.search$.next(params['q']);
      }
    });
  }

  getCover(p: Playlist): string {
    return getPlaylistCover(p.cover, p.title);
  }

  platformClass(platform: string): string {
    const map: Record<string, string> = {
      youtube: 'bg-red-600/20 text-red-400',
      spotify: 'bg-green-600/20 text-green-400',
      soundcloud: 'bg-orange-600/20 text-orange-400'
    };
    return map[platform] || 'bg-surface-3 text-muted';
  }
}
