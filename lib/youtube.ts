const PATRONES_VIDEO_ID = [
  /[?&]v=([^&#]+)/,
  /youtu\.be\/([^&#?/]+)/,
  /\/embed\/([^&#?/]+)/,
  /\/shorts\/([^&#?/]+)/,
];

export function extraerVideoId(url: string): string | null {
  for (const patron of PATRONES_VIDEO_ID) {
    const match = url.match(patron);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function urlThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
