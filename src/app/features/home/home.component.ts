import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PlaylistService } from '@core/services/playlist.service';
import { Music } from '@core/models/music.model';
import { Playlist } from '@core/models/playlist.model';
import { User } from '@core/models/user.model';
import { MusicService } from '@core/services/music.service';
import { UserService } from '@core/services/user.service';
import { PlayerStore } from '@core/stores/player.store';
import { PlaylistCardComponent } from '@shared/components/playlist-card/playlist-card.component';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';


interface PlaylistWithMeta {
  playlist: Playlist;
  owner: User;
  musicCount: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, PlaylistCardComponent, SkeletonComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  private readonly playlistService: PlaylistService = inject(PlaylistService);
  private readonly userService: UserService = inject(UserService);
  private readonly musicService: MusicService = inject(MusicService);
  private readonly playerStore: PlayerStore = inject(PlayerStore);
  private readonly router: Router = inject(Router);

  readonly loading = signal(true);
  readonly items = signal<PlaylistWithMeta[]>([]);
  readonly skeletons = Array(12).fill(0);

  ngOnInit(): void {
    forkJoin({
      playlists: this.playlistService.getAll(),
      users: this.userService.getAll(),
      musics: this.musicService.getAll()
    }).subscribe({
      next: ({ playlists, users, musics }) => {
        const publicUsers = new Map(users.filter((u: User) => !u.isPrivate).map((u: User) => [u.id, u]));
        const musicCountMap = new Map<number, number>();
        musics.forEach((m: Music) => musicCountMap.set(m.playlistId, (musicCountMap.get(m.playlistId) || 0) + 1));

        const result: PlaylistWithMeta[] = playlists
          .filter((p: Playlist) => publicUsers.has(p.userId))
          .sort((a: Playlist, b: Playlist) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((p: Playlist) => ({
            playlist: p,
            owner: publicUsers.get(p.userId)!,
            musicCount: musicCountMap.get(p.id) || 0
          }));

        this.items.set(result);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onPlaylistClick(playlist: Playlist): void {
    this.router.navigate(['/playlist', playlist.id]);
  }

  onPlay(playlist: Playlist): void {
    this.musicService.getByPlaylistId(playlist.id).subscribe((musics: Music[]) => {
      if (musics.length > 0) this.playerStore.loadPlaylist(musics);
    });
  }
}
