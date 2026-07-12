export function getAvatarUrl(avatar: string, username: string): string {
  if (avatar && avatar.startsWith('data:')) return avatar;
  if (avatar && avatar.startsWith('http')) return avatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1DB954&color=fff&size=128&bold=true`;
}

export function getPlaylistCover(cover: string, title: string): string {
  if (cover && (cover.startsWith('data:') || cover.startsWith('http'))) return cover;
  const colors = ['1DB954', '1ed760', '2d46b9', 'e91429', 'f59b23', '8d67ab'];
  const idx = title.charCodeAt(0) % colors.length;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(title)}&background=${colors[idx]}&color=fff&size=256&bold=true&length=2`;
}
