import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthStore } from '@core/stores/auth.store';
import { UserService } from '@core/services/user.service';
import { PlaylistService } from '@core/services/playlist.service';
import { MusicService } from '@core/services/music.service';
import { User } from '@core/models/user.model';
import { Playlist } from '@core/models/playlist.model';
import { Music } from '@core/models/music.model';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';
import { getPlaylistCover } from '@core/utils/avatar.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonComponent, TimeAgoPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly userService: UserService = inject(UserService);
  private readonly playlistService: PlaylistService = inject(PlaylistService);
  private readonly musicService: MusicService = inject(MusicService);

  readonly loading = signal(true);
  readonly user = signal<User | null>(null);
  readonly recentPlaylists = signal<Playlist[]>([]);
  readonly recentMusics = signal<Music[]>([]);
  readonly stats = signal<{ icon: string; value: number | string; label: string }[]>([]);

  ngOnInit(): void {
    const userId = this.authStore.userId()!;
    forkJoin({
      user: this.userService.getById(userId),
      playlists: this.playlistService.getByUserId(userId),
      musics: this.musicService.getAll()
    }).subscribe({
      next: ({ user, playlists, musics }) => {
        this.user.set(user);
        const userMusics = musics.filter((m: Music) => playlists.some((p: Playlist) => p.id === m.playlistId));
        this.recentPlaylists.set(playlists.slice(-5).reverse());
        this.recentMusics.set(userMusics.slice(-5).reverse());
        this.stats.set([
          { icon: '🎵', value: user.playlistCount, label: 'Playlists' },
          { icon: '🎶', value: user.musicCount, label: 'Songs' },
          { icon: '👥', value: user.followers, label: 'Followers' },
          { icon: '➕', value: user.following, label: 'Following' }
        ]);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getCover(p: Playlist): string { return getPlaylistCover(p.cover, p.title); }

  platformClass(platform: string): string {
    const map: Record<string, string> = {
      youtube: 'bg-red-600/20 text-red-400',
      spotify: 'bg-green-600/20 text-green-400',
      soundcloud: 'bg-orange-600/20 text-orange-400'
    };
    return map[platform] || 'bg-surface-3 text-muted';
  }
}
