import { MusicPlatform } from '../models/music.model';

export function detectPlatform(url: string): MusicPlatform | null {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
  if (/spotify\.com/.test(url)) return 'spotify';
  if (/soundcloud\.com/.test(url)) return 'soundcloud';
  return null;
}

export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function extractSpotifyId(url: string): { type: string; id: string } | null {
  const match = url.match(/spotify\.com\/(track|album|playlist)\/([^?]+)/);
  if (match) return { type: match[1], id: match[2] };
  return null;
}

export function getYoutubeThumbnail(url: string): string {
  const id = extractYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '';
}

export function getEmbedUrl(platform: MusicPlatform, url: string): string {
  if (platform === 'youtube') {
    const id = extractYoutubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?enablejsapi=1` : '';
  }
  if (platform === 'spotify') {
    const info = extractSpotifyId(url);
    return info ? `https://open.spotify.com/embed/${info.type}/${info.id}` : '';
  }
  if (platform === 'soundcloud') {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%231DB954&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
  }
  return '';
}
