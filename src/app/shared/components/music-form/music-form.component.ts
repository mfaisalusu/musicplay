import { Component, inject, signal, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Music, MusicPlatform } from '@models/music.model';
import { detectPlatform, getYoutubeThumbnail } from '@core/utils/url-detector.util';

@Component({
  selector: 'app-music-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './music-form.component.html',
  styleUrls: ['./music-form.component.scss']
})     

export class MusicFormComponent implements OnInit {
  @Input() music?: Music;
  @Input() playlistId!: number;
  @Output() saved = new EventEmitter<Partial<Music>>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  readonly detectedPlatform = signal<MusicPlatform | null>(null);

  readonly form = this.fb.group({
    url: ['', [Validators.required]],
    title: ['', Validators.required],
    duration: ['']
  });

  ngOnInit(): void {
    if (this.music) {
      this.form.patchValue({ url: this.music.url, title: this.music.title, duration: this.music.duration });
      this.detectedPlatform.set(this.music.platform);
    }
    this.form.get('url')!.valueChanges.subscribe(url => {
      if (!url) { this.detectedPlatform.set(null); return; }
      const platform = detectPlatform(url);
      this.detectedPlatform.set(platform);
      if (!platform) {
        this.form.get('url')!.setErrors({ invalidPlatform: true });
      }
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { url, title, duration } = this.form.value;
    const platform = detectPlatform(url!);
    if (!platform) { this.form.get('url')!.setErrors({ invalidPlatform: true }); return; }
    const thumbnail = platform === 'youtube' ? getYoutubeThumbnail(url!) : '';
    this.saved.emit({ url: url!, title: title!, duration: duration || '', platform, thumbnail });
  }
}
