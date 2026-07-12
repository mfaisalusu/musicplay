import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Playlist } from '@models/playlist.model';
import { User } from '@models/user.model';
import { getPlaylistCover } from '@core/utils/avatar.util';
import { TimeAgoPipe } from '@shared/pipes/time-ago.pipe';

@Component({
  selector: 'app-playlist-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TimeAgoPipe],
  templateUrl: './playlist-card.component.html',
  styleUrls: ['./playlist-card.component.scss']
})
export class PlaylistCardComponent {
  @Input({ required: true }) playlist!: Playlist;
  @Input() owner?: User;
  @Input() musicCount?: number;
  @Input() showPlay = true;
  @Output() clicked = new EventEmitter<Playlist>();
  @Output() play = new EventEmitter<Playlist>();

  get coverSrc(): string {
    return getPlaylistCover(this.playlist.cover, this.playlist.title);
  }

  onCoverError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = getPlaylistCover('', this.playlist.title);
  }
}
