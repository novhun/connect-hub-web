/**
 * Media & Video URL detection and embedding helper
 */

// Extracts YouTube video ID from various URL formats (standard, shortlink, shorts, embed)
export const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  
  // Standard watch URL: youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&.*)?/i);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // Short URL: youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Shorts URL: youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // Embed URL: youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?/i);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  return null;
};

// Extracts URLs from a given message or post string
export const extractUrls = (text: string): string[] => {
  if (!text) return [];
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const matches = text.match(urlRegex);
  return matches ? matches : [];
};

// Check if a URL points to a video file
export const isVideoFile = (urlOrFileName: string): boolean => {
  if (!urlOrFileName) return false;
  const lower = urlOrFileName.toLowerCase().split('?')[0];
  return (
    lower.endsWith('.mp4') ||
    lower.endsWith('.webm') ||
    lower.endsWith('.mov') ||
    lower.endsWith('.m4v') ||
    lower.endsWith('.ogv') ||
    lower.endsWith('.mkv')
  );
};

// Check if a URL points to an image file
export const isImageFile = (urlOrFileName: string): boolean => {
  if (!urlOrFileName) return false;
  const lower = urlOrFileName.toLowerCase().split('?')[0];
  return (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.gif') ||
    lower.endsWith('.webp') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.bmp')
  );
};
