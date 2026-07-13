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

export async function fetchDurationFromUrl(platform: MusicPlatform, url: string): Promise<string> {
  try {
    if (platform === 'youtube') {
      const id = extractYoutubeId(url);
      if (!id) return '';
      return await getYoutubeDurationViaIframe(id);
    }
  } catch { /* ignore */ }
  return '';
}

function getYoutubeDurationViaIframe(videoId: string): Promise<string> {
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;';
    iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
    iframe.allow = 'autoplay';

    const timeout = setTimeout(() => {
      cleanup();
      resolve('');
    }, 8000);

    const onMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.event === 'infoDelivery' && data?.info?.duration) {
          const secs = Math.round(data.info.duration);
          const m = Math.floor(secs / 60);
          const s = secs % 60;
          cleanup();
          resolve(`${m}:${s.toString().padStart(2, '0')}`);
        }
      } catch { /* ignore */ }
    };

    const onLoad = () => {
      iframe.contentWindow?.postMessage(JSON.stringify({ event: 'listening' }), '*');
      iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'getDuration' }), '*');
    };

    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      iframe.removeEventListener('load', onLoad);
      document.body.removeChild(iframe);
    };

    window.addEventListener('message', onMessage);
    iframe.addEventListener('load', onLoad);
    document.body.appendChild(iframe);
  });
}

export function getEmbedUrl(platform: MusicPlatform, url: string, autoplay = true): string {
  if (platform === 'youtube') {
    const id = extractYoutubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}` : '';
  }
  if (platform === 'spotify') {
    const info = extractSpotifyId(url);
    return info ? `https://open.spotify.com/embed/${info.type}/${info.id}?autoplay=${autoplay ? 1 : 0}` : '';
  }
  if (platform === 'soundcloud') {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%231DB954&auto_play=${autoplay}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
  }
  return '';
}
