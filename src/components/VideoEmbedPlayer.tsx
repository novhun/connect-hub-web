import React, { useState } from 'react';
import { Play, Maximize2, ExternalLink } from 'lucide-react';
import { getYouTubeVideoId, isVideoFile } from '../utils/mediaHelpers';
import { api } from '../services/api';

interface VideoEmbedPlayerProps {
  url: string;
  title?: string;
  onOpenFullscreen?: (url: string) => void;
}

export const VideoEmbedPlayer: React.FC<VideoEmbedPlayerProps> = ({
  url,
  title,
  onOpenFullscreen,
}) => {
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const ytVideoId = getYouTubeVideoId(url);
  const isDirectVideo = !ytVideoId && isVideoFile(url);
  const mediaSrc = isDirectVideo ? api.getMediaUrl(url) : url;

  if (!ytVideoId && !isDirectVideo) return null;

  // YouTube Video Embed
  if (ytVideoId) {
    const thumbnailUrl = `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`;

    return (
      <div className="my-2 rounded-2xl overflow-hidden border border-gray-200/80 bg-black shadow-xs group relative max-w-md w-full">
        {isPlayingInline ? (
          <div className="w-full aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&rel=0`}
              title={title || "YouTube video"}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div 
            className="w-full aspect-video relative cursor-pointer overflow-hidden flex items-center justify-center bg-gray-900"
            onClick={() => setIsPlayingInline(true)}
          >
            <img
              src={thumbnailUrl}
              alt="YouTube Video Thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
            />
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/15 transition-colors">
              <div className="w-13 h-13 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <Play className="w-6 h-6 ml-0.5 fill-white" />
              </div>
            </div>

            {/* YouTube Badge */}
            <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>YouTube Video</span>
            </div>

            {onOpenFullscreen && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFullscreen(url);
                }}
                className="absolute top-2.5 right-2.5 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
                title="Watch full size"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Direct MP4 / WebM / MOV Video Player
  return (
    <div className="my-2 rounded-2xl overflow-hidden border border-gray-200/80 bg-black shadow-xs relative max-w-md w-full">
      <video
        src={mediaSrc}
        controls
        preload="metadata"
        className="w-full max-h-72 object-contain bg-black"
      />
      {onOpenFullscreen && (
        <button
          onClick={() => onOpenFullscreen(url)}
          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors cursor-pointer"
          title="Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
