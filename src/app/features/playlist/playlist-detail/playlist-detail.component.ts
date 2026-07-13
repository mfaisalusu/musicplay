import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';
import { PlaylistService } from '@core/services/playlist.service';
import { MusicService } from '@core/services/music.service';
import { UserService } from '@core/services/user.service';
import { AuthStore } from '@core/stores/auth.store';
import { ToastStore } from '@core/stores/toast.store';
import { ConfirmDialogStore } from '@core/stores/confirm-dialog.store';
import { PlayerBarService } from '@core/services/player-bar.service';
import { Playlist } from '@models/playlist.model';
import { Music } from '@models/music.model';
import { User } from '@models/user.model';
import { getPlaylistCover } from '@core/utils/avatar.util';
import { MusicFormComponent } from '@shared/components/music-form/music-form.component';

@Component({
  selector: 'app-playlist-detail',
  standalone: true,
  imports: [CommonModule, DragDropModule, MusicFormComponent],
  templateUrl: './playlist-detail.component.html',
  styleUrls: ['./playlist-detail.component.scss']
})
export class PlaylistDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playlistService = inject(PlaylistService);
  private readonly musicService = inject(MusicService);
  private readonly userService = inject(UserService);
  private readonly authStore = inject(AuthStore);
  private readonly toast = inject(ToastStore);
  private readonly confirm = inject(ConfirmDialogStore);
  readonly playerStore = inject(PlayerBarService);

  readonly loading = signal(true);
  readonly playlist = signal<Playlist | null>(null);
  readonly musics = signal<Music[]>([]);
  readonly owner = signal<User | null>(null);
  readonly showMusicForm = signal(false);
  readonly editingMusic = signal<Music | null>(null);

  readonly isOwner = computed(() => this.playlist()?.userId === this.authStore.userId());

  playlistId!: number;

  ngOnInit(): void {
    this.playlistId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      playlist: this.playlistService.getById(this.playlistId),
      musics: this.musicService.getByPlaylistId(this.playlistId)
    }).subscribe({
      next: ({ playlist, musics }) => {
        this.playlist.set(playlist);
        this.musics.set(musics.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
        this.userService.getById(playlist.userId).subscribe(u => this.owner.set(u));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/playlist']);
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

  playAll(): void {
    const tracks = this.musics();
    if (tracks.length > 0) this.playerStore.play(tracks[0], tracks);
  }

  playTrack(index: number): void {
    const tracks = this.musics();
    const music = tracks[index];
    if (this.playerStore.currentMusic()?.id === music.id) {
      this.playerStore.togglePlay();
    } else {
      this.playerStore.play(music, tracks);
    }
  }

  openEditMusic(music: Music): void {
    this.editingMusic.set(music);
    this.showMusicForm.set(true);
  }

  closeMusicForm(): void {
    this.showMusicForm.set(false);
    this.editingMusic.set(null);
  }

  onMusicSaved(data: Partial<Music>): void {
    const editing = this.editingMusic();
    if (editing) {
      this.musicService.update(editing.id, data).subscribe({
        next: (updated) => {
          this.musics.update(list => list.map(m => m.id === updated.id ? updated : m));
          this.toast.success('Music updated!');
          this.closeMusicForm();
        }
      });
    } else {
      this.musicService.checkDuplicate(this.playlistId, data.url!).subscribe({
        next: ({ exists }) => {
          if (exists) {
            this.toast.error('Music with this URL already exists in this playlist');
            return;
          }
          const order = this.musics().length;
          const newMusic: Music = { ...(data as Music), playlistId: this.playlistId, order, createdAt: new Date().toISOString() };
          this.musicService.create(newMusic).subscribe({
            next: (created) => {
              this.musics.update(list => [...list, created]);
              this.toast.success('Music added!');
              this.closeMusicForm();
            }
          });
        }
      });
    }
  }

  onDeleteMusic(music: Music): void {
    this.confirm.open({
      title: 'Remove Music',
      message: `Remove "${music.title}" from this playlist?`,
      confirmText: 'Remove',
      onConfirm: () => {
        this.musicService.remove(music.id).subscribe({
          next: () => {
            this.musics.update(list => list.filter(m => m.id !== music.id));
            this.toast.success('Music removed');
          }
        });
      }
    });
  }

  onDrop(event: CdkDragDrop<Music[]>): void {
    const list = [...this.musics()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    list.forEach((m, i) => {
      if (m.order !== i) this.musicService.update(m.id, { order: i }).subscribe();
    });
    this.musics.set(list.map((m, i) => ({ ...m, order: i })));
  }
}
