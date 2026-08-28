import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw, ExternalLink, Play } from 'lucide-react';
import { api } from '../services/api';
import { getYouTubeVideoId, isVideoFile, isImageFile } from '../utils/mediaHelpers';

interface MediaViewerModalProps {
  mediaUrl: string;
  fileName?: string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  mediaUrl,
  fileName,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const ytVideoId = getYouTubeVideoId(mediaUrl);
  const isVideo = !ytVideoId && isVideoFile(mediaUrl);
  const fullUrl = ytVideoId ? `https://www.youtube.com/watch?v=${ytVideoId}` : api.getMediaUrl(mediaUrl);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div 
        className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 pointer-events-auto bg-black/50 backdrop-blur-md py-1.5 px-3 rounded-full text-white text-xs border border-white/10">
          <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{fileName || (ytVideoId ? 'YouTube Video' : 'Media View')}</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {!ytVideoId && !isVideo && (
            <div className="bg-black/50 backdrop-blur-md flex items-center gap-1 py-1 px-2 rounded-full border border-white/10 text-white">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-white/20 rounded-full cursor-pointer transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          <a
            href={fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={!ytVideoId ? (fileName || 'download') : undefined}
            className="p-2 bg-black/50 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white transition-colors cursor-pointer"
            title="Download / Open Original"
          >
            {ytVideoId ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          </a>

          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-red-600 backdrop-blur-md border border-white/10 rounded-full text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center overflow-hidden select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {ytVideoId ? (
          <div className="w-full aspect-video max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${ytVideoId}?autoplay=1&rel=0`}
              title="YouTube video player"
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : isVideo ? (
          <video
            src={fullUrl}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl border border-white/10 outline-none bg-black"
          />
        ) : (
          <div 
            className="transition-transform duration-150 ease-out flex items-center justify-center max-w-full max-h-full"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={fullUrl}
              alt={fileName || 'Full view'}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl pointer-events-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};
