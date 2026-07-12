import { Injectable, inject } from '@angular/core';
import { Observable, throwError, switchMap, map } from 'rxjs';
import { UserService } from './user.service';
import { AuthStore } from '../stores/auth.store';
import { LoginDto, RegisterDto } from '../models/auth.model';
import { CreateUserDto } from '../models/user.model';
import { getAvatarUrl } from '../utils/avatar.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly userService: UserService = inject(UserService);
  private readonly authStore: AuthStore = inject(AuthStore);

  login(dto: LoginDto): Observable<void> {
    return this.userService.getByEmail(dto.email).pipe(
      switchMap(users => {
        const user = users.find(u => u.email === dto.email && u.password === dto.password);
        if (!user) return throwError(() => new Error('Invalid email or password'));
        this.authStore.setSession(
          { userId: user.id, username: user.username, email: user.email, avatar: user.avatar },
          dto.remember
        );
        this.authStore.setCurrentUser(user);
        return [undefined as void];
      })
    );
  }

  register(dto: RegisterDto): Observable<void> {
    return this.userService.getByEmail(dto.email).pipe(
      switchMap(existing => {
        if (existing.length > 0) return throwError(() => new Error('Email already in use'));
        const newUser: CreateUserDto = {
          username: dto.username,
          email: dto.email,
          password: dto.password,
          avatar: getAvatarUrl('', dto.username),
          bio: '',
          isPrivate: false,
          followers: 0,
          following: 0,
          playlistCount: 0,
          musicCount: 0,
          createdAt: new Date().toISOString()
        };
        return this.userService.create(newUser);
      }),
      map(user => {
        if (user) {
          this.authStore.setSession(
            { userId: user.id, username: user.username, email: user.email, avatar: user.avatar },
            false
          );
          this.authStore.setCurrentUser(user);
        }
      })
    );
  }

  logout(): void {
    this.authStore.clearSession();
  }
}
