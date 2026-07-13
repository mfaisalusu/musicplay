import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Follower } from '@core/models/follower.model';
import { Playlist } from '@core/models/playlist.model';
import { User } from '@core/models/user.model';
import { FollowerService } from '@core/services/follower.service';
import { MusicService } from '@core/services/music.service';
import { PlaylistService } from '@core/services/playlist.service';
import { UserService } from '@core/services/user.service';
import { AuthStore } from '@core/stores/auth.store';
import { ToastStore } from '@core/stores/toast.store';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { PlaylistCardComponent } from '@shared/components/playlist-card/playlist-card.component';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';

interface PendingFollowerWithUser {
  follower: Follower;
  user: User;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent, PlaylistCardComponent, SkeletonComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly userService: UserService = inject(UserService);
  private readonly playlistService: PlaylistService = inject(PlaylistService);
  private readonly followerService: FollowerService = inject(FollowerService);
  private readonly musicService: MusicService = inject(MusicService);
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly toast: ToastStore = inject(ToastStore);

  readonly loading = signal(true);
  readonly user = signal<User | null>(null);
  readonly playlists = signal<Playlist[]>([]);
  readonly followRelation = signal<Follower | null>(null);
  readonly pendingFollowers = signal<PendingFollowerWithUser[]>([]);

  readonly isOwnProfile = computed(() => this.user()?.id === this.authStore.userId());
  readonly canViewPlaylists = computed(() => {
    const u = this.user();
    if (!u) return false;
    if (this.isOwnProfile()) return true;
    if (!u.isPrivate) return true;
    return this.followRelation()?.status === 'accepted';
  });

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfile(userId);
  }

  loadProfile(userId: number): void {
    const currentUserId = this.authStore.userId()!;
    forkJoin({
      user: this.userService.getById(userId),
      playlists: this.playlistService.getByUserId(userId),
      relation: this.followerService.getRelation(userId, currentUserId),
      pending: this.followerService.getFollowersOf(userId),
      allUsers: this.userService.getAll()
    }).subscribe({
      next: ({ user, playlists, relation, pending, allUsers }) => {
        this.user.set(user);
        this.playlists.set(playlists);
        this.followRelation.set(relation[0] || null);
        const userMap = new Map(allUsers.map((u: User) => [u.id, u]));
        const pendingWithUsers: PendingFollowerWithUser[] = pending
          .filter((f: Follower) => f.status === 'pending')
          .map((f: Follower) => ({ follower: f, user: userMap.get(f.followerId) || { username: `User #${f.followerId}`, avatar: '' } as User }));
        this.pendingFollowers.set(pendingWithUsers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFollow(): void {
    const user = this.user()!;
    const currentUserId = this.authStore.userId()!;
    const status = user.isPrivate ? 'pending' : 'accepted';
    this.followerService.follow({ userId: user.id, followerId: currentUserId, status }).subscribe({
      next: (rel: Follower) => {
        this.followRelation.set(rel);
        if (status === 'accepted') {
          this.userService.update(user.id, { followers: user.followers + 1 }).subscribe();
          this.userService.getById(currentUserId).subscribe((me: User) => {
            this.userService.update(currentUserId, { following: me.following + 1 }).subscribe();
          });
        }
        this.toast.success(status === 'pending' ? 'Follow request sent' : 'Now following!');
      }
    });
  }

  onUnfollow(): void {
    const rel = this.followRelation();
    if (!rel) return;
    this.followerService.unfollow(rel.id, rel.followerId).subscribe({
      next: () => {
        const user = this.user()!;
        const currentUserId = this.authStore.userId()!;
        if (rel.status === 'accepted') {
          this.userService.update(user.id, { followers: Math.max(0, user.followers - 1) }).subscribe();
          this.userService.getById(currentUserId).subscribe((me: User) => {
            this.userService.update(currentUserId, { following: Math.max(0, me.following - 1) }).subscribe();
          });
        }
        this.followRelation.set(null);
        this.toast.info('Unfollowed');
      }
    });
  }

  acceptFollower(req: Follower): void {
    this.followerService.updateStatus(req.id, 'accepted').subscribe({
      next: () => {
        this.pendingFollowers.update(list => list.filter(f => f.follower.id !== req.id));
        const user = this.user()!;
        this.userService.update(user.id, { followers: user.followers + 1 }).subscribe((u: User) => this.user.set(u));
        this.toast.success('Follower accepted');
      }
    });
  }

  rejectFollower(req: Follower): void {
    this.followerService.updateStatus(req.id, 'rejected').subscribe({
      next: () => {
        this.pendingFollowers.update(list => list.filter(f => f.follower.id !== req.id));
        this.toast.info('Request rejected');
      }
    });
  }
}
