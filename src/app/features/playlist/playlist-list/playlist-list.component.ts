import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthStore } from '@core/stores/auth.store';
import { PlaylistService } from '@core/services/playlist.service';
import { UserService } from '@core/services/user.service';
import { MusicService } from '@core/services/music.service';
import { ToastStore } from '@core/stores/toast.store';
import { ConfirmDialogStore } from '@core/stores/confirm-dialog.store';
import { Playlist } from '@models/playlist.model';
import { Music } from '@models/music.model';
import { getPlaylistCover } from '@core/utils/avatar.util';
import { forkJoin } from 'rxjs';
import { MusicFormComponent } from '@shared/components/music-form/music-form.component';

@Component({
  selector: 'app-playlist-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MusicFormComponent],
  templateUrl: './playlist-list.component.html',
  styleUrls: ['./playlist-list.component.scss']
})
export class PlaylistListComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly playlistService = inject(PlaylistService);
  private readonly userService = inject(UserService);
  private readonly musicService = inject(MusicService);
  private readonly toast = inject(ToastStore);
  private readonly confirm = inject(ConfirmDialogStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly playlists = signal<Playlist[]>([]);
  readonly musicCounts = signal<Map<number, number>>(new Map());
  readonly showForm = signal(false);
  readonly editingPlaylist = signal<Playlist | null>(null);
  readonly showMusicForm = signal(false);
  readonly targetPlaylistId = signal<number | null>(null);

  readonly form = this.fb.group({
    title: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    const userId = this.authStore.userId()!;
    forkJoin({
      playlists: this.playlistService.getByUserId(userId),
      musics: this.musicService.getAll()
    }).subscribe({
      next: ({ playlists, musics }) => {
        this.playlists.set(playlists.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        const counts = new Map<number, number>();
        musics.forEach(m => counts.set(m.playlistId, (counts.get(m.playlistId) || 0) + 1));
        this.musicCounts.set(counts);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getCover(p: Playlist): string { return getPlaylistCover(p.cover, p.title); }

  openForm(playlist?: Playlist): void {
    this.editingPlaylist.set(playlist || null);
    this.form.reset({ title: playlist?.title || '', description: playlist?.description || '' });
    this.showForm.set(true);
  }

  closeForm(): void { this.showForm.set(false); this.editingPlaylist.set(null); }

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { title, description } = this.form.value;
    const editing = this.editingPlaylist();
    if (editing) {
      this.playlistService.update(editing.id, { title: title!, description: description || '' }).subscribe({
        next: (updated) => {
          this.playlists.update(list => list.map(p => p.id === updated.id ? updated : p));
          this.toast.success('Playlist updated!');
          this.closeForm();
        }
      });
    } else {
      const userId = this.authStore.userId()!;
      this.playlistService.create({ userId, title: title!, description: description || '', cover: '', createdAt: new Date().toISOString() }).subscribe({
        next: (created) => {
          this.playlists.update(list => [created, ...list]);
          this.userService.update(userId, { playlistCount: this.playlists().length }).subscribe();
          this.toast.success('Playlist created!');
          this.closeForm();
        }
      });
    }
  }

  onDelete(playlist: Playlist): void {
    this.confirm.open({
      title: 'Delete Playlist',
      message: `Are you sure you want to delete "${playlist.title}"? This will also remove all songs.`,
      confirmText: 'Delete',
      onConfirm: () => {
        this.playlistService.remove(playlist.id).subscribe({
          next: () => {
            this.playlists.update(list => list.filter(p => p.id !== playlist.id));
            const userId = this.authStore.userId()!;
            this.userService.update(userId, { playlistCount: this.playlists().length }).subscribe();
            this.toast.success('Playlist deleted');
          }
        });
      }
    });
  }

  goToDetail(playlist: Playlist): void {
    this.router.navigate(['/playlist', playlist.id]);
  }

  openMusicForm(playlistId: number): void {
    this.targetPlaylistId.set(playlistId);
    this.showMusicForm.set(true);
  }

  closeMusicForm(): void {
    this.showMusicForm.set(false);
    this.targetPlaylistId.set(null);
  }

  onMusicSaved(data: Partial<Music>): void {
    const playlistId = this.targetPlaylistId()!;
    this.musicService.checkDuplicate(playlistId, data.url!).subscribe({
      next: ({ exists }) => {
        if (exists) {
          this.toast.error('Music with this URL already exists in this playlist');
          return;
        }
        const order = this.musicCounts().get(playlistId) ?? 0;
        const newMusic: Music = { ...(data as Music), playlistId, order, createdAt: new Date().toISOString() };
        this.musicService.create(newMusic).subscribe({
          next: () => {
            this.musicCounts.update(m => new Map(m).set(playlistId, order + 1));
            this.toast.success('Music added!');
            this.closeMusicForm();
          }
        });
      }
    });
  }
}