import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Volume2,
  VolumeX,
  Play,
  Music,
  Plus,
  Send,
  X,
  Check,
  Sparkles,
  Flame,
  Upload,
  Loader2,
  ChevronUp,
  ChevronDown,
  Film,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { User, Post, ReactionType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { copyToClipboard } from '../../utils/clipboard';
import { isVideoFile } from '../../utils/mediaHelpers';

export interface ClipItem {
  id: string;
  postId?: string;
  videoUrl: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    handle: string;
    isVerified?: boolean;
  };
  caption: string;
  musicTitle: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  comments: {
    id: string;
    userName: string;
    userAvatar: string;
    text: string;
    time: string;
  }[];
}

interface ClipsViewProps {
  currentUser: User;
  posts?: Post[];
  onReact?: (postId: string, type: ReactionType) => void;
  onAddComment?: (postId: string, commentText: string) => void;
  onSaveToggle?: (postId: string) => void;
  onSharePost?: (post: Post) => void;
  onSelectPost?: (post: Post) => void;
  onViewProfile?: (userId: string) => void;
  onNavVisibilityChange?: (visible: boolean) => void;
  isNavVisible?: boolean;
}

export const ClipsView: React.FC<ClipsViewProps> = ({
  currentUser,
  posts = [],
  onReact,
  onAddComment,
  onSaveToggle,
  onSharePost,
  onViewProfile,
  onNavVisibilityChange,
  isNavVisible = true,
}) => {
  const { language } = useLanguage();
  const [uploadedClips, setUploadedClips] = useState<ClipItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [clipProgress, setClipProgress] = useState<{ [id: string]: number }>({});
  const [clipOrientations, setClipOrientations] = useState<{ [id: string]: 'landscape' | 'portrait' | 'square' }>({});
  const [fitModes, setFitModes] = useState<{ [id: string]: 'contain' | 'cover' | 'rotate' }>({});
  const [activeCommentsClipId, setActiveCommentsClipId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [copiedClipId, setCopiedClipId] = useState<string | null>(null);
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ id: string; x: number; y: number } | null>(null);
  const [savedClipIds, setSavedClipIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen change detection listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isFull);
      // Ensure active video continues playing smoothly in fullscreen
      const activeVideo = videoRefs.current[activeIndex];
      if (activeVideo) {
        activeVideo.play().catch(() => {});
        setIsPlaying(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [activeIndex]);

  const handleToggleFitMode = (clipId: string, isLandscape: boolean) => {
    setFitModes((prev) => {
      const current = prev[clipId] || (isLandscape ? 'contain' : 'cover');
      let next: 'contain' | 'cover' | 'rotate' = 'contain';
      if (current === 'contain') next = 'cover';
      else if (current === 'cover' && isLandscape) next = 'rotate';
      else next = 'contain';
      return { ...prev, [clipId]: next };
    });
  };

  const handleToggleFullscreen = async (clipIdx: number) => {
    const video = videoRefs.current[clipIdx];
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      } else {
        const elem = clipRefs.current[clipIdx] || video || containerRef.current;
        if (elem) {
          if (elem.requestFullscreen) {
            await elem.requestFullscreen();
          } else if ((elem as any).webkitRequestFullscreen) {
            await (elem as any).webkitRequestFullscreen();
          }
        }
      }
    } catch (err) {
      console.warn('Fullscreen request notice:', err);
    } finally {
      if (video) {
        video.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  // Keyboard shortcut: Press F to toggle full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          handleToggleFullscreen(activeIndex);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);
  
  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadMusic, setUploadMusic] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const clipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Initialize savedClipIds from posts marked as saved
  useEffect(() => {
    const initialSaved = new Set<string>();
    posts.forEach((p) => {
      if (p.isSaved) {
        initialSaved.add(p.id);
      }
    });
    setSavedClipIds(initialSaved);
  }, [posts]);

  // Automatically extract real video content from user posts
  const postVideoClips = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    const extracted: ClipItem[] = [];

    posts.forEach((post) => {
      if (!post) return;
      const authorName = post.author?.name || 'ConnectHub User';
      const authorAvatar = post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
      const authorId = post.author?.id || 'unknown';

      // Check post.images for video files
      if (post.images && post.images.length > 0) {
        post.images.forEach((imgUrl, imgIdx) => {
          if (isVideoFile(imgUrl)) {
            const totalLikes = Object.values(post.reactionCounts || {}).reduce<number>((a, b) => a + Number(b || 0), 0);
            extracted.push({
              id: `post-clip-${post.id}-${imgIdx}`,
              postId: post.id,
              videoUrl: imgUrl,
              author: {
                id: authorId,
                name: authorName,
                avatar: authorAvatar,
                handle: `@${authorName.toLowerCase().replace(/\s+/g, '')}`,
                isVerified: post.author?.verified || false,
              },
              caption: post.content || (language === 'km' ? 'វីដេអូពីការបង្ហោះ' : 'Video from post'),
              musicTitle: `Original Audio - ${authorName}`,
              likesCount: Number(totalLikes) || 0,
              commentsCount: post.comments?.length || 0,
              sharesCount: post.sharesCount || 0,
              isLiked: post.userReaction !== null,
              isSaved: Boolean(post.isSaved),
              isFollowing: false,
              comments: (post.comments || []).map((c: any) => ({
                id: c?.id || `c-${Math.random()}`,
                userName: c?.author?.name || c?.userName || 'User',
                userAvatar: c?.author?.avatar || c?.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                text: c?.content || c?.text || '',
                time: c?.timestamp || c?.time || (language === 'km' ? 'ទើបតែមុននេះ' : 'Just now'),
              })),
            });
          }
        });
      }

      // Check shared post images
      if (post.sharedPost?.images && post.sharedPost.images.length > 0) {
        const sharedAuthorName = post.sharedPost.author?.name || authorName;
        const sharedAuthorAvatar = post.sharedPost.author?.avatar || authorAvatar;
        const sharedAuthorId = post.sharedPost.author?.id || authorId;

        post.sharedPost.images.forEach((imgUrl, imgIdx) => {
          if (isVideoFile(imgUrl)) {
            extracted.push({
              id: `shared-clip-${post.id}-${imgIdx}`,
              postId: post.id,
              videoUrl: imgUrl,
              author: {
                id: sharedAuthorId,
                name: sharedAuthorName,
                avatar: sharedAuthorAvatar,
                handle: `@${sharedAuthorName.toLowerCase().replace(/\s+/g, '')}`,
                isVerified: false,
              },
              caption: post.sharedPost!.content || post.content || 'Shared Video Clip',
              musicTitle: `Original Audio - ${sharedAuthorName}`,
              likesCount: 0,
              commentsCount: post.comments?.length || 0,
              sharesCount: post.sharesCount || 0,
              isLiked: false,
              isSaved: false,
              isFollowing: false,
              comments: [],
            });
          }
        });
      }
    });

    return extracted;
  }, [posts, language]);

  // Real Clips Only: user uploads + real post videos
  const allClips = useMemo(() => {
    const combined = [...uploadedClips, ...postVideoClips];
    const seen = new Set<string>();
    return combined.filter((c) => {
      if (seen.has(c.videoUrl)) return false;
      seen.add(c.videoUrl);
      return true;
    });
  }, [uploadedClips, postVideoClips]);

  // IntersectionObserver for smooth auto-play as clips scroll into view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || allClips.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // In fullscreen mode, keep the active video playing without observer interruption
        if (document.fullscreenElement) {
          const currentVid = videoRefs.current[activeIndex];
          if (currentVid && currentVid.paused) {
            currentVid.play().catch(() => {});
          }
          return;
        }

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexStr = entry.target.getAttribute('data-index');
            if (indexStr !== null) {
              const newIdx = parseInt(indexStr, 10);
              setActiveIndex(newIdx);

              // Smoothly play visible video and pause others
              videoRefs.current.forEach((video, vIdx) => {
                if (!video) return;
                if (vIdx === newIdx) {
                  video.currentTime = 0;
                  video.play().catch(() => {});
                  setIsPlaying(true);
                } else {
                  video.pause();
                }
              });
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.65,
      }
    );

    clipRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [allClips.length]);

  // Scroll tracking to auto-hide and show mobile header/footer when navigating between clips
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onNavVisibilityChange) return;

    let lastScrollTop = container.scrollTop;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      const delta = currentScrollTop - lastScrollTop;

      if (currentScrollTop <= 30) {
        onNavVisibilityChange(true);
      } else if (delta > 10) {
        // Scrolling down to next clip
        onNavVisibilityChange(false);
      } else if (delta < -8) {
        // Scrolling up to previous clip
        onNavVisibilityChange(true);
      }

      lastScrollTop = currentScrollTop;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [onNavVisibilityChange, allClips.length]);

  // Keyboard navigation
  useEffect(() => {
    if (allClips.length === 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((document.activeElement?.tagName || '').toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNextClip();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrevClip();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, allClips.length, isPlaying]);

  const togglePlay = () => {
    const activeVideo = videoRefs.current[activeIndex];
    if (activeVideo) {
      if (isPlaying) {
        activeVideo.pause();
        setIsPlaying(false);
      } else {
        activeVideo.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleNextClip = () => {
    if (activeIndex < allClips.length - 1) {
      const nextIdx = activeIndex + 1;
      clipRefs.current[nextIdx]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePrevClip = () => {
    if (activeIndex > 0) {
      const prevIdx = activeIndex - 1;
      clipRefs.current[prevIdx]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleVideoTimeUpdate = (idx: number, clipId: string) => {
    const video = videoRefs.current[idx];
    if (video && video.duration) {
      const progress = (video.currentTime / video.duration) * 100;
      setClipProgress((prev) => ({ ...prev, [clipId]: progress }));
    }
  };

  const handleToggleLike = (clip: ClipItem) => {
    if (clip.postId && onReact) {
      onReact(clip.postId, clip.isLiked ? 'like' : 'love');
    }
    setUploadedClips((prev) =>
      prev.map((c) =>
        c.id === clip.id
          ? { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? Math.max(0, c.likesCount - 1) : c.likesCount + 1 }
          : c
      )
    );
  };

  const handleDoubleTap = (e: React.MouseEvent, clip: ClipItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDoubleTapHeart({ id: clip.id, x, y });
    if (!clip.isLiked) {
      handleToggleLike(clip);
    }
    setTimeout(() => setDoubleTapHeart(null), 900);
  };

  // Real Save / Bookmark functionality
  const handleToggleSave = (clip: ClipItem) => {
    const isCurrentlySaved =
      savedClipIds.has(clip.id) ||
      (clip.postId ? savedClipIds.has(clip.postId) : false) ||
      Boolean(clip.isSaved);

    const newSaved = !isCurrentlySaved;

    // Update local state
    setSavedClipIds((prev) => {
      const next = new Set(prev);
      if (newSaved) {
        next.add(clip.id);
        if (clip.postId) next.add(clip.postId);
      } else {
        next.delete(clip.id);
        if (clip.postId) next.delete(clip.postId);
      }
      return next;
    });

    setUploadedClips((prev) =>
      prev.map((c) => (c.id === clip.id ? { ...c, isSaved: newSaved } : c))
    );

    // Call backend / parent save handler if post exists
    if (clip.postId && onSaveToggle) {
      onSaveToggle(clip.postId);
    }

    setToastMessage(
      newSaved
        ? (language === 'km' ? '✨ បានរក្សាទុកក្នុងចំណាំ!' : '✨ Saved to Bookmarks!')
        : (language === 'km' ? '🗑️ បានដកចេញពីចំណាំ' : '🗑️ Removed from Bookmarks')
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Real Share functionality
  const handleShare = async (clip: ClipItem) => {
    // 1. If clip belongs to a feed post and parent onSharePost modal is available, open ShareModal
    if (clip.postId && onSharePost) {
      const parentPost = posts.find((p) => p.id === clip.postId);
      if (parentPost) {
        onSharePost(parentPost);
        return;
      }
    }

    // 2. Otherwise trigger web share API or copy direct clip link
    const url = `${window.location.origin}/clips#clip=${clip.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: clip.caption || 'Connect-Hub Clip',
          text: `Check out this clip by ${clip.author.name} on Connect-Hub!`,
          url,
        });
        setToastMessage(language === 'km' ? '🚀 បានចែករំលែកដោយជោគជ័យ!' : '🚀 Shared successfully!');
        setTimeout(() => setToastMessage(null), 2500);
        return;
      } catch (err) {
        // Fallback to clipboard copy
      }
    }

    await copyToClipboard(url);
    setCopiedClipId(clip.id);
    setToastMessage(language === 'km' ? '📋 បានចម្លងតំណភ្ជាប់ឃ្លីប!' : '📋 Clip link copied to clipboard!');
    setTimeout(() => {
      setCopiedClipId(null);
      setToastMessage(null);
    }, 2500);
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeCommentsClipId) return;

    const clip = allClips.find((c) => c.id === activeCommentsClipId);
    if (clip?.postId && onAddComment) {
      onAddComment(clip.postId, commentInput.trim());
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: commentInput.trim(),
      time: language === 'km' ? 'ទើបតែមុននេះ' : 'Just now',
    };

    setUploadedClips((prev) =>
      prev.map((c) => {
        if (c.id === activeCommentsClipId) {
          return {
            ...c,
            commentsCount: c.commentsCount + 1,
            comments: [newComment, ...c.comments],
          };
        }
        return c;
      })
    );

    setCommentInput('');
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setUploadPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile && !uploadPreviewUrl) return;

    setIsUploading(true);
    let finalVideoUrl = uploadPreviewUrl;

    if (uploadFile) {
      try {
        const res = await api.uploadMedia(uploadFile);
        if (res?.url) {
          finalVideoUrl = api.getMediaUrl(res.url);
        }
      } catch (err) {
        console.warn('Media upload fallback to local preview', err);
      }
    }

    const newClip: ClipItem = {
      id: `clip-${Date.now()}`,
      videoUrl: finalVideoUrl,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        handle: `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`,
        avatar: currentUser.avatar,
        isVerified: false,
      },
      caption: uploadCaption.trim() || (language === 'km' ? 'វីដេអូខ្លីថ្មី ✨ #clips' : 'New short clip ✨ #clips'),
      musicTitle: uploadMusic.trim() || (language === 'km' ? 'សំឡេងដើម - ' + currentUser.name : 'Original Audio - ' + currentUser.name),
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      isSaved: false,
      isFollowing: false,
      comments: [],
    };

    setUploadedClips([newClip, ...uploadedClips]);
    setActiveIndex(0);
    setIsUploading(false);
    setShowUploadModal(false);
    setUploadFile(null);
    setUploadPreviewUrl('');
    setUploadCaption('');
    setUploadMusic('');
    setTimeout(() => {
      clipRefs.current[0]?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-0 md:py-3 md:px-4 relative animate-in fade-in duration-200 bg-black md:bg-transparent overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 z-50 bg-gray-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl backdrop-blur-md border border-white/10 animate-in fade-in slide-in-from-top-4 duration-150">
          {toastMessage}
        </div>
      )}

      {/* When no clips available: Clean & Gorgeous Empty State */}
      {allClips.length === 0 ? (
        <div className="w-full max-w-sm sm:max-w-md h-[68vh] max-h-[600px] bg-gradient-to-b from-gray-900 via-gray-950 to-black rounded-3xl border border-gray-800 flex flex-col items-center justify-center p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20 mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            {language === 'km' ? 'មិនទាន់មានវីដេអូឃ្លីបនៅឡើយទេ' : 'No Video Clips Yet'}
          </h2>
          <p className="text-xs text-gray-400 max-w-xs mb-6 leading-relaxed">
            {language === 'km'
              ? 'បង្ហោះវីដេអូខ្លីដំបូងរបស់អ្នក ឬចែករំលែកការបង្ហោះដែលមានវីដេអូដើម្បីទស្សនានៅទីនេះ!'
              : 'Upload your first short video clip or share a post with video to see it here!'}
          </p>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 rounded-full bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{language === 'km' ? 'បង្ហោះវីដេអូឥឡូវនេះ' : 'Upload Video Now'}</span>
          </button>
        </div>
      ) : (
        /* Main Snap Scrolling Container — Full Screen Edge-to-Edge on Mobile */
        <div className="relative w-full h-full max-w-none md:max-w-[420px] md:h-[84vh] md:max-h-[800px] flex items-center justify-center">
          <div
            ref={containerRef}
            className="w-full h-full overflow-y-scroll snap-y snap-mandatory rounded-none md:rounded-3xl shadow-none md:shadow-2xl bg-black border-none md:border md:border-gray-800/80 select-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allClips.map((clip, idx) => {
              const isActive = idx === activeIndex;
              const progress = clipProgress[clip.id] || 0;
              const isSaved =
                savedClipIds.has(clip.id) ||
                (clip.postId ? savedClipIds.has(clip.postId) : false) ||
                Boolean(clip.isSaved);
              const orientation = clipOrientations[clip.id] || 'portrait';
              const isLandscape = orientation === 'landscape';
              const currentFit = fitModes[clip.id] || (isLandscape ? 'contain' : 'cover');

              return (
                <div
                  key={clip.id}
                  data-index={idx}
                  ref={(el) => (clipRefs.current[idx] = el)}
                  className="w-full h-full snap-start snap-always relative overflow-hidden bg-black shrink-0"
                >
                  {/* Video Playback Container */}
                  <div
                    className="absolute inset-0 bg-black flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={togglePlay}
                    onDoubleClick={(e) => handleDoubleTap(e, clip)}
                  >
                    {/* 1. Ambient Blurred Backdrop for Landscape / Widescreen Videos */}
                    {isLandscape && (
                      <video
                        src={api.getMediaUrl(clip.videoUrl)}
                        muted
                        playsInline
                        loop
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-125 pointer-events-none transition-opacity duration-300"
                      />
                    )}

                    {/* 2. Main High-Definition Video */}
                    <video
                      ref={(el) => (videoRefs.current[idx] = el)}
                      src={api.getMediaUrl(clip.videoUrl)}
                      playsInline
                      loop
                      muted={isMuted}
                      preload={idx <= 2 ? 'auto' : 'metadata'}
                      onTimeUpdate={() => handleVideoTimeUpdate(idx, clip.id)}
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        if (v.videoWidth && v.videoHeight) {
                          const isLand = v.videoWidth > v.videoHeight * 1.15;
                          const isSq = !isLand && Math.abs(v.videoWidth - v.videoHeight) <= 60;
                          setClipOrientations((prev) => ({
                            ...prev,
                            [clip.id]: isLand ? 'landscape' : isSq ? 'square' : 'portrait',
                          }));
                        }
                      }}
                      className={`relative z-10 transition-all duration-300 ${
                        currentFit === 'rotate'
                          ? 'w-[100vh] max-w-none h-[100vw] max-h-none rotate-90 object-contain'
                          : currentFit === 'cover'
                          ? 'w-full h-full object-cover'
                          : isLandscape
                          ? 'w-full h-auto max-h-[85vh] object-contain my-auto drop-shadow-2xl'
                          : 'w-full h-full object-contain sm:object-contain bg-black'
                      }`}
                    />

                    {/* Double tap heart explosion animation */}
                    {doubleTapHeart && doubleTapHeart.id === clip.id && (
                      <div
                        className="absolute z-30 pointer-events-none animate-in zoom-in-50 fade-in duration-200"
                        style={{ left: `${doubleTapHeart.x - 40}px`, top: `${doubleTapHeart.y - 40}px` }}
                      >
                        <Heart className="w-20 h-20 text-rose-500 fill-rose-500 drop-shadow-2xl animate-bounce" />
                      </div>
                    )}

                    {/* Pause Overlay Icon */}
                    {isActive && !isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 animate-in fade-in zoom-in-75 duration-150">
                        <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl border border-white/20">
                          <Play className="w-8 h-8 translate-x-0.5 fill-white" />
                        </div>
                      </div>
                    )}

                    {/* Gradient Scrims for pristine readability at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-50% to-black/95 pointer-events-none z-10" />
                  </div>

                  {/* Top Header Bar inside Video Slide - Sleek, Compact & Beautiful */}
                  <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
                    {/* Left: Compact Glass Pill with category & index */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/65 backdrop-blur-md text-white text-xs font-bold border border-white/15 shadow-sm transition-all">
                        <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span>{clip.postId ? (language === 'km' ? 'វីដេអូ' : 'Post Video') : 'Clips'}</span>
                        <span className="text-white/40 font-normal">•</span>
                        <span className="text-[11px] font-semibold text-white/80">{idx + 1}/{allClips.length}</span>
                      </div>
                    </div>

                    {/* Right: Sleek Circular Action Buttons */}
                    <div className="flex items-center gap-2 pointer-events-auto">
                      {/* Fit / Fill Mode Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFitMode(clip.id, isLandscape);
                        }}
                        className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md group"
                        title={currentFit === 'cover' ? (language === 'km' ? 'ពង្រីកពេញ' : 'Zoom Fill') : (language === 'km' ? 'ទំហំដើម' : 'Fit to Screen')}
                      >
                        {currentFit === 'cover' ? (
                          <Maximize2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                        ) : (
                          <Minimize2 className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                        )}
                      </button>

                      {/* Full Screen Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFullscreen(idx);
                        }}
                        className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md group"
                        title={isFullscreen ? (language === 'km' ? 'បិទពេញអេក្រង់ (F)' : 'Exit Fullscreen (F)') : (language === 'km' ? 'ពេញអេក្រង់ (F)' : 'Full Screen (F)')}
                      >
                        {isFullscreen ? (
                          <Minimize className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        ) : (
                          <Maximize className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                        )}
                      </button>

                      {/* Mute / Unmute Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMuted(!isMuted);
                        }}
                        className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md group"
                        title={isMuted ? (language === 'km' ? 'បើកសំឡេង' : 'Unmute') : (language === 'km' ? 'បិទសំឡេង' : 'Mute')}
                      >
                        {isMuted ? (
                          <VolumeX className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Vertical Social Action Buttons (Right side) */}
                  <div className="absolute right-2 sm:right-3.5 bottom-6 z-20 flex flex-col items-center gap-3 sm:gap-3.5">
                    {/* Creator Avatar */}
                    <div
                      className="relative mb-0.5 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewProfile) onViewProfile(clip.author.id);
                      }}
                    >
                      <img
                        src={api.getMediaUrl(clip.author.avatar)}
                        alt={clip.author.name}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 border-white object-cover shadow-lg hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Like Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(clip);
                      }}
                      className="flex flex-col items-center gap-0.5 text-white group/btn cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-all active:scale-125 shadow-md ${clip.isLiked
                          ? 'bg-rose-600 border-rose-500 text-white shadow-rose-600/50'
                          : 'bg-black/40 border-white/20 hover:bg-black/60 text-white'
                          }`}
                      >
                        <Heart className={`w-5 h-5 ${clip.isLiked ? 'fill-white' : ''}`} />
                      </div>
                      <span className="text-[11px] font-bold drop-shadow-md">{clip.likesCount}</span>
                    </button>

                    {/* Comment Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCommentsClipId(clip.id);
                      }}
                      className="flex flex-col items-center gap-0.5 text-white cursor-pointer"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 border border-white/20 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-md">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold drop-shadow-md">{clip.commentsCount}</span>
                    </button>

                    {/* Bookmark / Save Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(clip);
                      }}
                      className="flex flex-col items-center gap-0.5 text-white cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full backdrop-blur-md flex items-center justify-center border transition-all active:scale-95 shadow-md ${isSaved
                          ? 'bg-amber-500 border-amber-400 text-white'
                          : 'bg-black/40 border-white/20 hover:bg-black/60 text-white'
                          }`}
                      >
                        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-white' : ''}`} />
                      </div>
                      <span className="text-[10px] font-bold drop-shadow-md">
                        {isSaved ? (language === 'km' ? 'បានរក្សា' : 'Saved') : (language === 'km' ? 'រក្សាទុក' : 'Save')}
                      </span>
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(clip);
                      }}
                      className="flex flex-col items-center gap-0.5 text-white cursor-pointer"
                    >
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/40 border border-white/20 hover:bg-black/60 backdrop-blur-md flex items-center justify-center transition-all active:scale-95 shadow-md">
                        {copiedClipId === clip.id ? (
                          <Check className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold drop-shadow-md">
                        {copiedClipId === clip.id ? 'Copied' : clip.sharesCount}
                      </span>
                    </button>
                  </div>

                  {/* Bottom Footer Details (Author, Caption, Music) docked at bottom-left */}
                  <div className="absolute bottom-3 left-0 right-16 z-20 p-3.5 sm:p-4 space-y-1.5 text-left pointer-events-auto">
                    {/* Author Name */}
                    <div
                      className="flex items-center gap-2 cursor-pointer inline-flex"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onViewProfile) onViewProfile(clip.author.id);
                      }}
                    >
                      <img
                        src={api.getMediaUrl(clip.author.avatar)}
                        alt={clip.author.name}
                        className="w-7 h-7 rounded-full border border-white/60 object-cover shadow-sm"
                      />
                      <span className="font-bold text-white text-sm sm:text-base drop-shadow-md hover:underline">{clip.author.name}</span>
                      <span className="text-white/75 text-xs drop-shadow-sm">{clip.author.handle}</span>
                    </div>

                    {/* Caption / Title */}
                    <p className="text-white text-xs sm:text-sm leading-snug drop-shadow-md line-clamp-2 font-normal">
                      {clip.caption}
                    </p>

                    {/* Music Track Banner */}
                    <div className="flex items-center gap-2 text-white/90 text-xs pt-0.5">
                      <Music className="w-3.5 h-3.5 shrink-0 text-pink-400 animate-pulse" />
                      <div className="overflow-hidden whitespace-nowrap max-w-[200px] sm:max-w-[240px]">
                        <span className="inline-block animate-marquee">{clip.musicTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Live Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-30 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-rose-500 transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Side Arrow Buttons for Desktop View */}
          <div className="hidden lg:flex absolute -right-14 top-1/2 -translate-y-1/2 flex-col gap-3 z-30">
            <button
              type="button"
              onClick={handlePrevClip}
              disabled={activeIndex === 0}
              className="w-11 h-11 rounded-full bg-white hover:bg-gray-50 disabled:opacity-40 shadow-xl border border-gray-200/80 flex items-center justify-center text-gray-800 transition-all hover:scale-110 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              title="Previous Video (Up Arrow)"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNextClip}
              disabled={activeIndex === allClips.length - 1}
              className="w-11 h-11 rounded-full bg-white hover:bg-gray-50 disabled:opacity-40 shadow-xl border border-gray-200/80 flex items-center justify-center text-gray-800 transition-all hover:scale-110 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              title="Next Video (Down Arrow)"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Interactive Comments Drawer */}
      {activeCommentsClipId && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setActiveCommentsClipId(null)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] sm:max-h-[600px] h-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>
                  {language === 'km'
                    ? `មតិយោបល់ (${allClips.find((c) => c.id === activeCommentsClipId)?.comments?.length || 0})`
                    : `Comments (${allClips.find((c) => c.id === activeCommentsClipId)?.comments?.length || 0})`}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveCommentsClipId(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(() => {
                const clip = allClips.find((c) => c.id === activeCommentsClipId);
                const comments = clip?.comments || [];
                if (comments.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      {language === 'km' ? 'មិនទាន់មានមតិយោបល់នៅឡើយទេ។ ជាអ្នកដំបូងដែលបញ្ចេញមតិ!' : 'No comments yet. Be the first to comment!'}
                    </div>
                  );
                }
                return comments.map((cm) => (
                  <div key={cm.id} className="flex gap-2.5 items-start">
                    <img
                      src={api.getMediaUrl(cm.userAvatar)}
                      alt={cm.userName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200"
                    />
                    <div className="flex-1 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-gray-900">{cm.userName}</span>
                        <span className="text-[10px] text-gray-400">{cm.time}</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{cm.text}</p>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <form onSubmit={handleAddCommentSubmit} className="p-3 border-t border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={language === 'km' ? 'សរសេរមតិយោបល់របស់អ្នក...' : 'Add a comment...'}
                className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-full cursor-pointer shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Upload New Clip Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">
                {language === 'km' ? 'បង្ហោះវីដេអូខ្លី (Upload Clip)' : 'Upload New Clip'}
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-4 space-y-3.5 overflow-y-auto">
              <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50 hover:bg-blue-50/30 transition-colors">
                <Upload className="w-7 h-7 text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">
                  {uploadFile ? uploadFile.name : (language === 'km' ? 'ជ្រើសរើសវីដេអូ (.mp4, .mov, .webm)' : 'Select video (.mp4, .mov, .webm)')}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
              </label>

              {uploadPreviewUrl && (
                <div className="h-44 bg-black rounded-xl overflow-hidden relative shadow-inner">
                  <video src={uploadPreviewUrl} controls className="w-full h-full object-contain" />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {language === 'km' ? 'ចំណងជើង និង #Hashtags' : 'Caption & #Hashtags'}
                </label>
                <textarea
                  rows={2}
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder={language === 'km' ? 'សរសេរការពណ៌នាអំពីវីដេអូខ្លីរបស់អ្នក...' : 'Describe your short clip...'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  {language === 'km' ? 'ឈ្មោះបទភ្លេង / សំឡេង' : 'Sound / Music Title'}
                </label>
                <input
                  type="text"
                  value={uploadMusic}
                  onChange={(e) => setUploadMusic(e.target.value)}
                  placeholder={language === 'km' ? 'ឧ. Original Sound - My Audio' : 'e.g. Original Audio - Remix'}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading || (!uploadFile && !uploadPreviewUrl)}
                className="w-full bg-[#2563eb] hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'km' ? 'កំពុងបង្ហោះ...' : 'Publishing...'}</span>
                  </>
                ) : (
                  <span>{language === 'km' ? 'បោះពុម្ពផ្សាយឃ្លីប' : 'Publish Clip'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
