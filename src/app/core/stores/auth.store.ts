import { Injectable, signal, computed } from '@angular/core';
import { AuthSession } from '../models/auth.model';
import { User } from '../models/user.model';

const SESSION_KEY = 'mp_session';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _session = signal<AuthSession | null>(this.loadSession());
  private readonly _currentUser = signal<User | null>(null);

  readonly session = this._session.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._session() !== null);
  readonly userId = computed(() => this._session()?.userId ?? null);

  private loadSession(): AuthSession | null {
    try {
      const data = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setSession(session: AuthSession, remember: boolean): void {
    this._session.set(session);
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  setCurrentUser(user: User): void {
    this._currentUser.set(user);
    const session = this._session();
    if (session) {
      const updated: AuthSession = { ...session, username: user.username, avatar: user.avatar };
      this._session.set(updated);
      const hasLocal = !!localStorage.getItem(SESSION_KEY);
      const storage = hasLocal ? localStorage : sessionStorage;
      storage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
  }

  clearSession(): void {
    this._session.set(null);
    this._currentUser.set(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }
}
