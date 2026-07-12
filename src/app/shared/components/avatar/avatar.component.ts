import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getAvatarUrl } from '@core/utils/avatar.util';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})

export class AvatarComponent {
  @Input() avatar = '';
  @Input() username = '';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  get avatarSrc(): string {
    return getAvatarUrl(this.avatar, this.username);
  }

  get sizeClass(): string {
    const map = { xs: 'w-6 h-6', sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14', xl: 'w-20 h-20' };
    return map[this.size];
  }

  onError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = getAvatarUrl('', this.username);
  }
}
