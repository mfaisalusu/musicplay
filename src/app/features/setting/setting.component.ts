import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthStore } from '@core/stores/auth.store';
import { User } from '@core/models/user.model';
import { UserService } from '@core/services/user.service';
import { ToastStore } from '@core/stores/toast.store';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';

function passwordMatchValidator(ctrl: AbstractControl) {
  const pw = ctrl.get('newPassword')?.value;
  const cpw = ctrl.get('confirmPassword')?.value;
  if (!pw && !cpw) return null;
  return pw === cpw ? null : { mismatch: true };
}

@Component({
  selector: 'app-setting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarComponent],
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  private readonly authStore: AuthStore = inject(AuthStore);
  private readonly userService: UserService = inject(UserService);
  private readonly toast: ToastStore = inject(ToastStore);
  private readonly fb: FormBuilder = inject(FormBuilder);

  readonly user = signal<User | null>(null);
  readonly previewAvatar = signal('');
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly passwordError = signal('');

  readonly profileForm = this.fb.group({
    username: ['', Validators.required],
    bio: [''],
    isPrivate: [false]
  });

  readonly passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  ngOnInit(): void {
    const userId = this.authStore.userId()!;
    this.userService.getById(userId).subscribe((user: User) => {
      this.user.set(user);
      this.profileForm.patchValue({ username: user.username, bio: user.bio, isPrivate: user.isPrivate });
    });
  }

  togglePrivate(): void {
    const cur = this.profileForm.get('isPrivate')?.value;
    this.profileForm.patchValue({ isPrivate: !cur });
  }

  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => this.previewAvatar.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    const userId = this.authStore.userId()!;
    const { username, bio, isPrivate } = this.profileForm.value;
    const avatar = this.previewAvatar() || this.user()!.avatar;
    this.userService.update(userId, { username: username!, bio: bio || '', isPrivate: isPrivate!, avatar }).subscribe({
      next: (updated: User) => {
        this.user.set(updated);
        this.authStore.setCurrentUser(updated);
        this.savingProfile.set(false);
        this.toast.success('Profile updated!');
      },
      error: () => this.savingProfile.set(false)
    });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;
    const { currentPassword, newPassword } = this.passwordForm.value;
    if (currentPassword !== this.user()!.password) {
      this.passwordError.set('Current password is incorrect');
      return;
    }
    this.savingPassword.set(true);
    this.passwordError.set('');
    this.userService.update(this.authStore.userId()!, { password: newPassword! }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.toast.success('Password updated!');
      },
      error: () => this.savingPassword.set(false)
    });
  }
}
