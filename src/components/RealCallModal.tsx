import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Monitor,
  SwitchCamera,
  Signal,
  Users,
  UserPlus,
  Copy,
  Check,
  X,
  Maximize2,
  Minimize2,
  RotateCw,
  Sliders,
  ChevronDown,
  Wifi,
  Smartphone,
  Layers,
} from 'lucide-react';
import { User, GroupChatMemberItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { realtime, RealtimeMessage } from '../services/realtime';
import { settingsApi } from '../modules/settings/api';
import { startRingback, stopRingtone } from '../services/ringtone';

interface RealCallModalProps {
  targetUser: User;
  callType: 'audio' | 'video';
  roomId: string;
  role: 'caller' | 'callee';
  sessionId?: string;
  isGroupCall?: boolean;
  groupId?: string;
  groupName?: string;
  groupAvatar?: string;
  currentUser?: User;
  onClose: () => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

type CallStatus = 'ringing' | 'connecting' | 'connected' | 'ended';
type EndReason = 'declined' | 'unavailable' | 'ended' | 'failed' | null;

export type QualityMode = 'auto' | 'hd' | 'sd' | 'saver';

export interface QualityProfile {
  id: QualityMode;
  label: string;
  labelKm: string;
  badge: string;
  resolution: string;
  width: number;
  height: number;
  maxBitrate: number; // in bps
  scaleFactor: number;
  description: string;
  descriptionKm: string;
}

export const QUALITY_PROFILES: Record<QualityMode, QualityProfile> = {
  auto: {
    id: 'auto',
    label: 'Auto (Network Adaptive)',
    labelKm: 'ស្វ័យប្រវត្តិ (តាមល្បឿនអ៊ីនធឺណិត)',
    badge: 'Auto',
    resolution: 'Adaptive',
    width: 1280,
    height: 720,
    maxBitrate: 2_500_000,
    scaleFactor: 1.0,
    description: 'Dynamic bitrate and resolution based on internet',
    descriptionKm: 'សម្របសម្រួលគុណភាពតាមល្បឿនអ៊ីនធឺណិតជាក់ស្តែង',
  },
  hd: {
    id: 'hd',
    label: 'HD (1080p / 720p)',
    labelKm: 'កម្រិតខ្ពស់ HD (1080p)',
    badge: 'HD',
    resolution: '1080p',
    width: 1920,
    height: 1080,
    maxBitrate: 3_500_000,
    scaleFactor: 1.0,
    description: 'Crystal clear HD video (requires fast connection)',
    descriptionKm: 'រូបភាពច្បាស់ម៉ត់កម្រិតខ្ពស់ (ត្រូវការអ៊ីនធឺណិតលឿន)',
  },
  sd: {
    id: 'sd',
    label: 'SD (480p)',
    labelKm: 'កម្រិតមធ្យម SD (480p)',
    badge: 'SD',
    resolution: '480p',
    width: 854,
    height: 480,
    maxBitrate: 850_000,
    scaleFactor: 1.5,
    description: 'Smooth video with balanced bandwidth usage',
    descriptionKm: 'វីដេអូរលូន និងសន្សំទិន្នន័យសមរម្យ',
  },
  saver: {
    id: 'saver',
    label: 'Data Saver (360p)',
    labelKm: 'សន្សំទិន្នន័យ (360p)',
    badge: 'Saver',
    resolution: '360p',
    width: 640,
    height: 360,
    maxBitrate: 350_000,
    scaleFactor: 2.0,
    description: 'Low data consumption for slow or unstable internet',
    descriptionKm: 'ស័ក្តិសមសម្រាប់អ៊ីនធឺណិតខ្សោយ ឬស៊ីមកាតទូរស័ព្ទ',
  },
};

export interface NetworkQualityInfo {
  rtt: number | null; // in ms
  packetLoss: number; // percentage
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'checking';
  effectiveProfile: QualityMode;
}

interface PeerConnectionEntry {
  peerId: string;
  user?: Partial<User>;
  pc: RTCPeerConnection;
  stream?: MediaStream;
  pendingCandidates: RTCIceCandidateInit[];
  remoteDescSet: boolean;
}

interface RemotePeer {
  peerId: string;
  user?: Partial<User>;
  stream?: MediaStream;
}

interface VideoTileProps {
  user?: Partial<User>;
  stream?: MediaStream;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isSpeakerOn?: boolean;
  onSwitchCamera?: () => void;
  showSwitchCamera?: boolean;
  isSpotlighted?: boolean;
  onToggleSpotlight?: () => void;
  isMini?: boolean;
  isScreenShare?: boolean;
  hasScreenAudio?: boolean;
  orientation?: 'landscape' | 'portrait';
  orientationMode?: 'auto' | 'landscape' | 'portrait';
  onToggleOrientation?: () => void;
}

/**
 * Dedicated Video Tile for each participant in a call.
 * Encapsulates dedicated video & audio elements, orientation handling,
 * spotlight maximization, fit/fill toggling, and device audio badges.
 */
const VideoTile: React.FC<VideoTileProps> = ({
  user,
  stream,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  isSpeakerOn = true,
  onSwitchCamera,
  showSwitchCamera = false,
  isSpotlighted = false,
  onToggleSpotlight,
  isMini = false,
  isScreenShare = false,
  hasScreenAudio = false,
  orientation = 'landscape',
  orientationMode,
  onToggleOrientation,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>('cover');

  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isVideoOff]);

  useEffect(() => {
    if (audioRef.current && stream && !isLocal) {
      if (audioRef.current.srcObject !== stream) {
        audioRef.current.srcObject = stream;
      }
      audioRef.current.muted = !isSpeakerOn;
      audioRef.current.play().catch(() => {});
    }
  }, [stream, isSpeakerOn, isLocal]);

  // Determine if stream has an enabled live video track
  const hasLiveVideoTrack =
    !isVideoOff &&
    Boolean(
      stream &&
        stream.getVideoTracks().length > 0 &&
        stream.getVideoTracks().some((t) => t.enabled && t.readyState === 'live')
    );

  return (
    <div
      onClick={!isMini && onToggleSpotlight ? onToggleSpotlight : undefined}
      className={`relative w-full h-full bg-slate-950 overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center group select-none transition-all ${
        isMini ? 'rounded-xl cursor-pointer' : 'rounded-2xl min-h-[170px] cursor-pointer'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full transition-all duration-300 ${
          fitMode === 'contain' ? 'object-contain' : 'object-cover'
        } ${hasLiveVideoTrack ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'} ${
          isLocal && !isScreenShare ? 'scale-x-[-1]' : ''
        }`}
      />

      {/* Audio Element for Remote Peer */}
      {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

      {/* Fallback Display with Avatar when video is off */}
      {!hasLiveVideoTrack && (
        <div className="flex flex-col items-center justify-center p-3 text-center z-10">
          <div className="relative mb-2">
            <img
              src={api.getMediaUrl(user?.avatar || '')}
              alt={user?.name || 'User'}
              className={`${
                isMini ? 'w-10 h-10' : 'w-16 h-16 sm:w-20 sm:h-20'
              } rounded-full object-cover border-2 border-indigo-500/70 shadow-lg`}
            />
            <span
              className={`absolute bottom-0 right-0 ${
                isMini ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'
              } rounded-full border-2 border-slate-950 ${
                isMuted ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
              }`}
            />
          </div>
          {!isMini && (
            <p className="text-white text-xs sm:text-sm font-semibold truncate max-w-[130px]">
              {user?.name || 'User'}
            </p>
          )}
        </div>
      )}

      {/* Top Left Controls & Badges (Spotlight / Screen Share / Device Audio) */}
      {!isMini && (
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20 pointer-events-auto">
          {onToggleSpotlight && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSpotlight();
              }}
              className="p-1.5 bg-black/60 hover:bg-black/90 text-white rounded-lg border border-white/10 backdrop-blur-md cursor-pointer transition-all shadow-sm"
              title={isSpotlighted ? 'Restore to Grid' : 'Spotlight / Maximize Tile'}
            >
              {isSpotlighted ? (
                <Minimize2 className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {isScreenShare && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/80 backdrop-blur-md text-white text-[10px] font-semibold border border-blue-400/30 shadow-sm">
              <Monitor className="w-3 h-3 text-white" />
              <span>Screen</span>
            </div>
          )}

          {hasScreenAudio && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600/80 backdrop-blur-md text-white text-[10px] font-semibold border border-emerald-400/30 shadow-sm animate-pulse">
              <Volume2 className="w-3 h-3 text-white" />
              <span>Device Audio</span>
            </div>
          )}
        </div>
      )}

      {/* Top Right Controls (Fit Mode, Switch Camera, Orientation) */}
      {!isMini && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20 pointer-events-auto opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          {/* Fit / Fill toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFitMode(fitMode === 'cover' ? 'contain' : 'cover');
            }}
            className="px-2 py-1 bg-black/60 hover:bg-black/90 text-white rounded-lg border border-white/10 backdrop-blur-md cursor-pointer transition-all text-[10px] font-semibold flex items-center gap-1 shadow-sm"
            title={fitMode === 'cover' ? 'Switch to Fit (show entire frame)' : 'Switch to Fill (cover)'}
          >
            <Layers className="w-3 h-3" />
            <span className="capitalize">{fitMode === 'cover' ? 'Fit' : 'Fill'}</span>
          </button>

          {/* Orientation Toggle Button for Local Tile */}
          {isLocal && onToggleOrientation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleOrientation();
              }}
              className="p-1.5 bg-black/60 hover:bg-black/90 rounded-lg text-white border border-white/10 cursor-pointer transition-all shadow-sm"
              title={`Orientation: ${orientationMode || 'auto'} (${orientation})`}
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-300" />
            </button>
          )}

          {/* Switch Camera Button for Local Tile */}
          {isLocal && showSwitchCamera && onSwitchCamera && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSwitchCamera();
              }}
              className="p-1.5 bg-black/60 hover:bg-black/90 rounded-lg text-white border border-white/10 cursor-pointer transition-all shadow-sm"
              title="Switch Camera"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Floating Info Badge at Bottom */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-20">
        <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] text-white font-medium flex items-center gap-1.5 truncate max-w-[80%] border border-white/10 shadow-sm">
          <span className="truncate">{user?.name || 'User'}</span>
          {isLocal && <span className="text-indigo-400 font-bold shrink-0">(You)</span>}
        </div>
        <div className="p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-sm">
          {isMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
        </div>
      </div>
    </div>
  );
};

export const RealCallModal: React.FC<RealCallModalProps> = ({
  targetUser,
  callType,
  roomId,
  role,
  sessionId,
  isGroupCall = false,
  groupId,
  groupName,
  groupAvatar,
  currentUser,
  onClose,
}) => {
  const { language } = useLanguage();
  const [callStatus, setCallStatus] = useState<CallStatus>(
    role === 'caller' ? 'ringing' : 'connecting'
  );
  const [endReason, setEndReason] = useState<EndReason>(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Camera Auto-Rotation & Orientation Controls
  const [orientationMode, setOrientationMode] = useState<'auto' | 'landscape' | 'portrait'>('auto');
  const [activeOrientation, setActiveOrientation] = useState<'landscape' | 'portrait'>(() => {
    return typeof window !== 'undefined' && window.innerWidth < window.innerHeight ? 'portrait' : 'landscape';
  });

  // Spotlight & Fullscreen Controls
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  // Screen Share Audio State
  const [hasScreenAudio, setHasScreenAudio] = useState(false);
  const screenAudioSendersRef = useRef<Map<string, RTCRtpSender>>(new Map());

  // Quality & Internet Adaptive Profiles
  const [qualityMode, setQualityMode] = useState<QualityMode>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [networkQuality, setNetworkQuality] = useState<NetworkQualityInfo>({
    rtt: null,
    packetLoss: 0,
    status: 'checking',
    effectiveProfile: 'hd',
  });

  // Group Call specific states
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupChatMemberItem[]>([]);
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);

  // Multi-party Full Mesh WebRTC State
  const peersRef = useRef<Map<string, PeerConnectionEntry>>(new Map());
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const makingOfferRef = useRef<Set<string>>(new Set());

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const closedRef = useRef(false);
  const durationRef = useRef(0);

  // Sync React remotePeers state with peersRef Map
  const syncRemotePeers = () => {
    const list: RemotePeer[] = [];
    peersRef.current.forEach((entry) => {
      list.push({
        peerId: entry.peerId,
        user: entry.user,
        stream: entry.stream,
      });
    });
    setRemotePeers(list);
  };

  // Load group members if this is a group call
  useEffect(() => {
    if (isGroupCall && groupId) {
      api.getGroupChat(groupId).then((res) => {
        if (res && res.members) {
          setGroupMembers(res.members);
        }
      }).catch((e) => {
        console.warn('Failed to fetch group members for call:', e);
      });
    }
  }, [isGroupCall, groupId]);

  const handleInviteMember = (member: GroupChatMemberItem) => {
    if (invitedUserIds.has(member.id)) return;
    realtime.send({
      type: 'GROUP_CALL_INVITE',
      groupId,
      groupName,
      groupAvatar,
      callerId: currentUser?.id || 'me',
      callerName: currentUser?.name || 'User',
      callerAvatar: currentUser?.avatar || '',
      callType,
      roomId,
      sessionId,
      targetUserId: member.id,
    });
    setInvitedUserIds((prev) => new Set(prev).add(member.id));
  };

  const handleCopyCallLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/calls?room=${roomId}&group=${groupId || ''}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Dynamic Bitrate & Resolution Constraint Enforcement across all peers
  const applyConstraintsAndQuality = async (
    targetOrientation: 'landscape' | 'portrait',
    targetQuality: QualityMode,
    effectiveQuality?: QualityMode
  ) => {
    const profileKey = targetQuality === 'auto' ? (effectiveQuality || 'hd') : targetQuality;
    const profile = QUALITY_PROFILES[profileKey];
    const isPortrait = targetOrientation === 'portrait';
    const targetWidth = isPortrait ? profile.height : profile.width;
    const targetHeight = isPortrait ? profile.width : profile.height;
    const aspectRatio = isPortrait ? 9 / 16 : 16 / 9;

    // Apply to local camera track if not screen sharing
    if (!isScreenSharing) {
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (videoTrack) {
        try {
          await videoTrack.applyConstraints({
            width: { ideal: targetWidth },
            height: { ideal: targetHeight },
            aspectRatio: { ideal: aspectRatio },
          });
        } catch (err) {
          console.warn('Failed to apply video constraints:', err);
        }
      }
    }

    // Apply bitrate & resolution scale factor to all peer senders
    peersRef.current.forEach((entry) => {
      const videoSender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
      if (videoSender) {
        try {
          const params = videoSender.getParameters();
          if (!params.encodings || params.encodings.length === 0) {
            params.encodings = [{}];
          }
          params.encodings[0].maxBitrate = profile.maxBitrate;
          params.encodings[0].scaleResolutionDownBy = profile.scaleFactor;
          videoSender.setParameters(params).catch(() => {});
        } catch (e) {
          console.warn('Sender setParameters notice:', e);
        }
      }
    });
  };

  const attachLocalStreamToPeer = (pc: RTCPeerConnection, stream: MediaStream) => {
    const activeVideoTrack = isScreenSharing && screenStreamRef.current
      ? screenStreamRef.current.getVideoTracks()[0]
      : stream.getVideoTracks()[0];

    const audioTrack = stream.getAudioTracks()[0];

    if (audioTrack) {
      const senders = pc.getSenders();
      const existing = senders.find((s) => s.track?.kind === 'audio');
      if (existing) {
        existing.replaceTrack(audioTrack).catch(() => {});
      } else {
        pc.addTrack(audioTrack, stream);
      }
    }

    if (activeVideoTrack) {
      const senders = pc.getSenders();
      const existing = senders.find((s) => s.track?.kind === 'video');
      if (existing) {
        existing.replaceTrack(activeVideoTrack).catch(() => {});
      } else {
        pc.addTrack(activeVideoTrack, isScreenSharing && screenStreamRef.current ? screenStreamRef.current : stream);
      }
    }

    // Add screen audio track if sharing
    if (isScreenSharing && screenStreamRef.current) {
      const screenAudioTrack = screenStreamRef.current.getAudioTracks()[0];
      if (screenAudioTrack) {
        try {
          const audioSender = pc.addTrack(screenAudioTrack, screenStreamRef.current);
          peersRef.current.forEach((entry) => {
            if (entry.pc === pc) {
              screenAudioSendersRef.current.set(entry.peerId, audioSender);
            }
          });
        } catch (e) {}
      }
    }
  };

  // Real getUserMedia — actual camera/mic with orientation & quality profile support
  const initMediaStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      setMediaError(null);
      const isPortrait = activeOrientation === 'portrait';
      const profile = QUALITY_PROFILES[qualityMode === 'auto' ? 'hd' : qualityMode];
      const targetWidth = isPortrait ? profile.height : profile.width;
      const targetHeight = isPortrait ? profile.width : profile.height;

      let stream: MediaStream;
      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          video: callType === 'video' ? {
            facingMode,
            width: { ideal: targetWidth },
            height: { ideal: targetHeight },
            aspectRatio: { ideal: isPortrait ? 9 / 16 : 16 / 9 },
          } : false,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        console.warn('Fallback to basic camera constraints:', e);
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video' ? { facingMode } : false,
        });
      }

      localStreamRef.current = stream;

      // Attach to any existing peer connections
      peersRef.current.forEach((entry) => {
        attachLocalStreamToPeer(entry.pc, stream);
      });

      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }
      return stream;
    } catch (err) {
      console.warn('Camera/Mic permission warning:', err);
      setMediaError(
        language === 'km'
          ? 'មិនអាចចូលប្រើកាមេរ៉ា ឬមីក្រូហ្វូនបានទេ។ សូមពិនិត្យមើលការអនុញ្ញាតឧបករណ៍របស់អ្នក។'
          : "Couldn't access your camera/mic. Check your device permissions."
      );
      return null;
    }
  };

  const removePeer = (peerId: string) => {
    const entry = peersRef.current.get(peerId);
    if (entry) {
      try {
        entry.pc.close();
      } catch (e) {
        console.warn('Error closing pc for peer:', peerId, e);
      }
      peersRef.current.delete(peerId);
    }
    syncRemotePeers();
    if (!isGroupCall && peersRef.current.size === 0) {
      finishCall('ended');
    }
  };

  const getOrCreatePeer = (peerId: string, peerUser?: Partial<User>): PeerConnectionEntry => {
    let entry = peersRef.current.get(peerId);
    if (entry) {
      if (peerUser && (!entry.user || !entry.user.name)) {
        entry.user = {
          id: peerId,
          name: peerUser.name || 'User',
          avatar: peerUser.avatar || '',
        };
        syncRemotePeers();
      }
      return entry;
    }

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    entry = {
      peerId,
      user: peerUser
        ? {
            id: peerId,
            name: peerUser.name || 'User',
            avatar: peerUser.avatar || '',
          }
        : undefined,
      pc,
      stream: undefined,
      pendingCandidates: [],
      remoteDescSet: false,
    };
    peersRef.current.set(peerId, entry);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        realtime.send({
          type: 'WEBRTC_ICE_CANDIDATE',
          targetUserId: peerId,
          fromUserId: currentUser?.id,
          callerId: currentUser?.id,
          roomId,
          candidate: e.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (e) => {
      console.log(`[WebRTC] Received remote track from peer ${peerId}:`, e.track.kind);
      let peerStream = entry!.stream;
      if (!peerStream) {
        if (e.streams && e.streams[0]) {
          peerStream = e.streams[0];
        } else {
          peerStream = new MediaStream();
        }
        entry!.stream = peerStream;
      }
      if (!peerStream.getTracks().some((t) => t.id === e.track.id)) {
        peerStream.addTrack(e.track);
      }
      syncRemotePeers();
      setCallStatus('connected');
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${peerId} state:`, pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        removePeer(peerId);
      }
    };

    if (localStreamRef.current) {
      attachLocalStreamToPeer(pc, localStreamRef.current);
    } else {
      pc.addTransceiver('audio', { direction: 'sendrecv' });
      if (callType === 'video') {
        pc.addTransceiver('video', { direction: 'sendrecv' });
      }
    }

    syncRemotePeers();
    return entry;
  };

  const createOfferToPeer = async (peerId: string, peerUser?: Partial<User>) => {
    if (peerId === currentUser?.id) return;
    if (makingOfferRef.current.has(peerId)) return;
    makingOfferRef.current.add(peerId);
    console.log(`[WebRTC] Creating offer to peer ${peerId}`);
    try {
      const stream = await initMediaStream();
      const entry = getOrCreatePeer(peerId, peerUser);
      if (stream) {
        attachLocalStreamToPeer(entry.pc, stream);
      }
      const offer = await entry.pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      await entry.pc.setLocalDescription(offer);
      realtime.send({
        type: 'WEBRTC_OFFER',
        targetUserId: peerId,
        fromUserId: currentUser?.id,
        callerId: currentUser?.id,
        callerName: currentUser?.name,
        callerAvatar: currentUser?.avatar,
        roomId,
        sdp: entry.pc.localDescription,
      });
    } catch (e) {
      console.warn('Error creating offer to peer', peerId, e);
    } finally {
      makingOfferRef.current.delete(peerId);
    }
  };

  const handleOfferFromPeer = async (peerId: string, sdp: any, peerUser?: Partial<User>) => {
    if (peerId === currentUser?.id) return;
    console.log(`[WebRTC] Handling offer from peer ${peerId}`);
    try {
      const stream = await initMediaStream();
      const entry = getOrCreatePeer(peerId, peerUser);
      if (stream) {
        attachLocalStreamToPeer(entry.pc, stream);
      }
      await entry.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      entry.remoteDescSet = true;
      for (const cand of entry.pendingCandidates) {
        try {
          await entry.pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn('Flush ICE candidate error:', e);
        }
      }
      entry.pendingCandidates = [];

      const answer = await entry.pc.createAnswer();
      await entry.pc.setLocalDescription(answer);
      realtime.send({
        type: 'WEBRTC_ANSWER',
        targetUserId: peerId,
        fromUserId: currentUser?.id,
        callerId: currentUser?.id,
        roomId,
        sdp: entry.pc.localDescription,
      });
      setCallStatus('connecting');
    } catch (e) {
      console.warn('Error handling offer from peer', peerId, e);
    }
  };

  const handleAnswerFromPeer = async (peerId: string, sdp: any) => {
    console.log(`[WebRTC] Handling answer from peer ${peerId}`);
    const entry = peersRef.current.get(peerId);
    if (!entry) return;
    try {
      await entry.pc.setRemoteDescription(new RTCSessionDescription(sdp));
      entry.remoteDescSet = true;
      for (const cand of entry.pendingCandidates) {
        try {
          await entry.pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn('Flush ICE candidate error:', e);
        }
      }
      entry.pendingCandidates = [];
      setCallStatus('connected');
    } catch (e) {
      console.warn('Error setting remote answer for peer', peerId, e);
    }
  };

  const handleIceCandidateFromPeer = async (peerId: string, candidate: any) => {
    const entry = peersRef.current.get(peerId);
    if (!entry) return;
    if (entry.remoteDescSet) {
      try {
        await entry.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('ICE candidate notice:', e);
      }
    } else {
      entry.pendingCandidates.push(candidate);
    }
  };

  const cleanupMedia = () => {
    peersRef.current.forEach((entry) => {
      try {
        entry.pc.close();
      } catch (e) {}
    });
    peersRef.current.clear();
    screenAudioSendersRef.current.clear();
    setRemotePeers([]);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    setHasScreenAudio(false);
  };

  const finishCall = (reason: NonNullable<EndReason>) => {
    if (closedRef.current) return;
    closedRef.current = true;
    setCallStatus('ended');
    setEndReason(reason);
    cleanupMedia();
    if (sessionId) {
      const finalStatus = reason === 'declined' ? 'declined' : reason === 'unavailable' ? 'missed' : 'completed';
      api.updateCallStatus(sessionId, finalStatus, durationRef.current).catch(() => {});
    }
    setTimeout(onClose, reason === 'declined' || reason === 'unavailable' ? 1600 : 400);
  };

  // WebRTC Handshake & Signaling Listeners
  useEffect(() => {
    let ringTimeout: ReturnType<typeof setTimeout> | null = null;

    initMediaStream().then(() => {
      // If group call, broadcast join to the room so existing participants create offers to us!
      if (isGroupCall && groupId) {
        realtime.send({
          type: 'GROUP_CALL_JOIN',
          groupId,
          roomId,
          userId: currentUser?.id,
          userName: currentUser?.name,
          userAvatar: currentUser?.avatar,
        });
      }

      if (role === 'caller' && !isGroupCall) {
        ringTimeout = setTimeout(() => {
          if (peersRef.current.size === 0 && !closedRef.current) {
            realtime.send({ type: 'CALL_END', targetUserId: targetUser.id, roomId });
            finishCall('unavailable');
          }
        }, 30000);
      } else if (role === 'caller' && isGroupCall) {
        ringTimeout = setTimeout(() => {
          if (peersRef.current.size === 0 && !closedRef.current) {
            finishCall('unavailable');
          }
        }, 60000);
      }
    });

    const handleSignal = async (msg: RealtimeMessage) => {
      if (msg.roomId !== roomId) return;

      switch (msg.type) {
        case 'CALL_ACCEPT': {
          const peerId = msg.calleeId || msg.fromUserId;
          if (!peerId || peerId === currentUser?.id) return;
          console.log(`[WebRTC] Received CALL_ACCEPT from ${peerId}`);
          stopRingtone();
          await createOfferToPeer(peerId, {
            name: msg.calleeName || targetUser.name,
            avatar: msg.calleeAvatar || targetUser.avatar,
          });
          break;
        }

        case 'GROUP_CALL_JOIN': {
          const joinerId = msg.userId || msg.fromUserId;
          if (!joinerId || joinerId === currentUser?.id) return;
          console.log(`[WebRTC] Peer ${joinerId} joined group call`);
          stopRingtone();
          // Existing participants create offer to the newcomer
          await createOfferToPeer(joinerId, {
            name: msg.userName,
            avatar: msg.userAvatar,
          });
          break;
        }

        case 'WEBRTC_OFFER': {
          const senderId = msg.callerId || msg.fromUserId;
          if (!senderId || senderId === currentUser?.id) return;
          console.log(`[WebRTC] Received WEBRTC_OFFER from ${senderId}`);
          stopRingtone();
          await handleOfferFromPeer(senderId, msg.sdp, {
            name: msg.callerName,
            avatar: msg.callerAvatar,
          });
          break;
        }

        case 'WEBRTC_ANSWER': {
          const senderId = msg.callerId || msg.fromUserId;
          if (!senderId || senderId === currentUser?.id) return;
          console.log(`[WebRTC] Received WEBRTC_ANSWER from ${senderId}`);
          await handleAnswerFromPeer(senderId, msg.sdp);
          break;
        }

        case 'WEBRTC_ICE_CANDIDATE': {
          const senderId = msg.fromUserId || msg.callerId;
          if (!senderId || senderId === currentUser?.id) return;
          await handleIceCandidateFromPeer(senderId, msg.candidate);
          break;
        }

        case 'CALL_DECLINE':
          if (!isGroupCall) {
            finishCall('declined');
          }
          break;

        case 'CALL_UNAVAILABLE':
          if (!isGroupCall) {
            finishCall('unavailable');
          }
          break;

        case 'CALL_END':
          if (!isGroupCall) {
            finishCall('ended');
          } else {
            const senderId = msg.fromUserId || msg.callerId;
            if (senderId) removePeer(senderId);
          }
          break;

        case 'GROUP_CALL_LEAVE': {
          const leftUserId = msg.userId || msg.fromUserId;
          if (leftUserId) {
            console.log(`[WebRTC] Peer ${leftUserId} left group call`);
            removePeer(leftUserId);
          }
          break;
        }

        case 'GROUP_CALL_END':
          console.log('[WebRTC] Group call ended by host');
          finishCall('ended');
          break;
      }
    };

    const unsubscribe = realtime.subscribe(handleSignal);

    return () => {
      unsubscribe();
      if (ringTimeout) clearTimeout(ringTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Duration Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDuration((prev) => {
          durationRef.current = prev + 1;
          return durationRef.current;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Ringback tone for caller while waiting
  useEffect(() => {
    if (role !== 'caller' || callStatus !== 'ringing' || remotePeers.length > 0) {
      stopRingtone();
      return;
    }
    let cancelled = false;
    settingsApi
      .getSettings()
      .then((s) => {
        if (!cancelled && s.callRingtone !== false) startRingback();
      })
      .catch(() => {
        if (!cancelled) startRingback();
      });
    return () => {
      cancelled = true;
      stopRingtone();
    };
  }, [role, callStatus, remotePeers.length]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = async () => {
    if (isVideoOff) {
      let videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (!videoTrack) {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
          const newTrack = newStream.getVideoTracks()[0];
          if (localStreamRef.current) {
            localStreamRef.current.addTrack(newTrack);
          } else {
            localStreamRef.current = newStream;
          }
          videoTrack = newTrack;
          peersRef.current.forEach((entry) => {
            const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(newTrack).catch(() => {});
            } else {
              entry.pc.addTrack(newTrack, localStreamRef.current!);
            }
          });
        } catch (err) {
          console.warn('Failed to start camera track:', err);
        }
      } else {
        videoTrack.enabled = true;
      }
      setIsVideoOff(false);
    } else {
      localStreamRef.current?.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
      setIsVideoOff(true);
    }
  };

  const stopScreenShare = () => {
    // Remove screen audio tracks from peers
    peersRef.current.forEach((entry) => {
      const sender = screenAudioSendersRef.current.get(entry.peerId);
      if (sender) {
        try {
          entry.pc.removeTrack(sender);
        } catch (e) {}
      }
    });
    screenAudioSendersRef.current.clear();

    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);
    setHasScreenAudio(false);

    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    if (camTrack) {
      peersRef.current.forEach((entry) => {
        const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
        sender?.replaceTrack(camTrack).catch(() => {});
      });
    }

    if (spotlightId === 'local-screen') {
      setSpotlightId(null);
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
    try {
      // Request screen share with display system/tab audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          cursor: 'always',
        } as any,
        audio: {
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      screenStreamRef.current = stream;
      const screenVideoTrack = stream.getVideoTracks()[0];
      const screenAudioTrack = stream.getAudioTracks()[0];

      // Replace video track for existing peer connections
      peersRef.current.forEach((entry) => {
        const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
        sender?.replaceTrack(screenVideoTrack).catch(() => {});
      });

      // Transmit screen audio track if enabled by user
      if (screenAudioTrack) {
        setHasScreenAudio(true);
        peersRef.current.forEach((entry) => {
          try {
            const audioSender = entry.pc.addTrack(screenAudioTrack, stream);
            screenAudioSendersRef.current.set(entry.peerId, audioSender);
          } catch (e) {
            console.warn('Failed to add screen audio track:', e);
          }
        });
      }

      setIsScreenSharing(true);
      // Auto spotlight the shared screen for all-in-one focus
      setSpotlightId('local-screen');

      screenVideoTrack.onended = () => stopScreenShare();
      if (screenAudioTrack) {
        screenAudioTrack.onended = () => setHasScreenAudio(false);
      }
    } catch (e) {
      console.warn('Screen share cancelled/denied:', e);
    }
  };

  // Orientation & Window Resize listener for Auto-Rotation
  useEffect(() => {
    const handleOrientationChange = () => {
      const isPortrait = window.innerWidth < window.innerHeight;
      const detected: 'landscape' | 'portrait' = isPortrait ? 'portrait' : 'landscape';
      if (orientationMode === 'auto') {
        setActiveOrientation(detected);
        applyConstraintsAndQuality(detected, qualityMode, networkQuality.effectiveProfile);
      }
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    if (typeof screen !== 'undefined' && screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (typeof screen !== 'undefined' && screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, [orientationMode, qualityMode, networkQuality.effectiveProfile]);

  // Fullscreen event listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Network stats sampling loop for RTT, packet loss & adaptive quality
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callStatus === 'connected') {
      interval = setInterval(async () => {
        let totalRtt = 0;
        let rttCount = 0;
        let maxLoss = 0;

        for (const entry of peersRef.current.values()) {
          try {
            const stats = await entry.pc.getStats();
            stats.forEach((report) => {
              if (
                report.type === 'candidate-pair' &&
                (report.state === 'succeeded' || report.nominated) &&
                typeof report.currentRoundTripTime === 'number'
              ) {
                totalRtt += report.currentRoundTripTime * 1000;
                rttCount++;
              }
              if (report.type === 'remote-inbound-rtp' && typeof report.roundTripTime === 'number') {
                totalRtt += report.roundTripTime * 1000;
                rttCount++;
              }
              if (report.type === 'inbound-rtp' && report.kind === 'video') {
                const lost = report.packetsLost || 0;
                const recv = report.packetsReceived || 0;
                if (recv + lost > 0) {
                  const loss = (lost / (recv + lost)) * 100;
                  if (loss > maxLoss) maxLoss = loss;
                }
              }
            });
          } catch (e) {}
        }

        if (rttCount > 0) {
          const avgRtt = Math.round(totalRtt / rttCount);
          let status: NetworkQualityInfo['status'] = 'good';
          let effective: QualityMode = 'hd';

          if (avgRtt <= 70 && maxLoss < 2) {
            status = 'excellent';
            effective = 'hd';
          } else if (avgRtt <= 150 && maxLoss < 5) {
            status = 'good';
            effective = 'hd';
          } else if (avgRtt <= 280 || maxLoss < 10) {
            status = 'fair';
            effective = 'sd';
          } else {
            status = 'poor';
            effective = 'saver';
          }

          setNetworkQuality({
            rtt: avgRtt,
            packetLoss: Math.round(maxLoss * 10) / 10,
            status,
            effectiveProfile: effective,
          });

          if (qualityMode === 'auto') {
            applyConstraintsAndQuality(activeOrientation, 'auto', effective);
          }
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [callStatus, qualityMode, activeOrientation]);

  const handleToggleOrientation = () => {
    let nextMode: 'auto' | 'landscape' | 'portrait';
    if (orientationMode === 'auto') {
      nextMode = activeOrientation === 'landscape' ? 'portrait' : 'landscape';
    } else if (orientationMode === 'landscape') {
      nextMode = 'portrait';
    } else {
      nextMode = 'auto';
    }
    setOrientationMode(nextMode);
    const newActive = nextMode === 'auto'
      ? (window.innerWidth < window.innerHeight ? 'portrait' : 'landscape')
      : nextMode;
    setActiveOrientation(newActive);
    applyConstraintsAndQuality(newActive, qualityMode, networkQuality.effectiveProfile);
  };

  const handleSelectQuality = (mode: QualityMode) => {
    setQualityMode(mode);
    setShowQualityMenu(false);
    applyConstraintsAndQuality(activeOrientation, mode, networkQuality.effectiveProfile);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalContainerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleSwitchCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: nextMode } });
      const newTrack = stream.getVideoTracks()[0];
      peersRef.current.forEach((entry) => {
        const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(newTrack).catch(() => {});
        }
      });
      const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0];
      oldVideoTrack?.stop();
      if (localStreamRef.current) {
        localStreamRef.current.removeTrack(oldVideoTrack!);
        localStreamRef.current.addTrack(newTrack);
      }
    } catch (e) {
      console.warn('Switch camera notice:', e);
    }
  };

  const handleEndCall = () => {
    if (isGroupCall && groupId) {
      if (role === 'caller') {
        realtime.send({ type: 'GROUP_CALL_END', groupId, roomId, userId: currentUser?.id });
      } else {
        realtime.send({ type: 'GROUP_CALL_LEAVE', groupId, roomId, userId: currentUser?.id });
      }
    } else {
      realtime.send({ type: 'CALL_END', targetUserId: targetUser.id, roomId });
    }
    finishCall('ended');
  };

  const statusLabel = () => {
    if (callStatus === 'ended') {
      if (endReason === 'declined') return language === 'km' ? 'ការហៅត្រូវបានបដិសេធ' : 'Call declined';
      if (endReason === 'unavailable') return language === 'km' ? 'អ្នកប្រើប្រាស់មិនអាចទាក់ទងបានទេ' : 'No answer';
      if (endReason === 'failed') return language === 'km' ? 'ការតភ្ជាប់បរាជ័យ' : 'Connection failed';
      return language === 'km' ? 'ការហៅបានបញ្ចប់' : 'Call ended';
    }
    if (callStatus === 'ringing') return language === 'km' ? 'កំពុងហៅ...' : 'Ringing...';
    if (callStatus === 'connecting') return language === 'km' ? 'កំពុងតភ្ជាប់...' : 'Connecting...';
    return language === 'km' ? 'បានតភ្ជាប់' : 'Connected';
  };

  // For 1-on-1 direct call view
  const primaryRemotePeer = remotePeers[0];
  const has1on1VideoStream =
    !isGroupCall &&
    callType === 'video' &&
    primaryRemotePeer?.stream &&
    primaryRemotePeer.stream.getVideoTracks().length > 0 &&
    primaryRemotePeer.stream.getVideoTracks().some((t) => t.enabled);

  // Sync 1-on-1 remote video element
  useEffect(() => {
    if (!isGroupCall && remoteVideoRef.current && primaryRemotePeer?.stream) {
      if (remoteVideoRef.current.srcObject !== primaryRemotePeer.stream) {
        remoteVideoRef.current.srcObject = primaryRemotePeer.stream;
      }
      remoteVideoRef.current.play().catch(() => {});
    }
    if (!isGroupCall && remoteAudioRef.current && primaryRemotePeer?.stream) {
      if (remoteAudioRef.current.srcObject !== primaryRemotePeer.stream) {
        remoteAudioRef.current.srcObject = primaryRemotePeer.stream;
      }
      remoteAudioRef.current.muted = !isSpeakerOn;
      remoteAudioRef.current.play().catch(() => {});
    }
  }, [isGroupCall, primaryRemotePeer, isSpeakerOn]);

  // Sync 1-on-1 local preview
  useEffect(() => {
    if (!isGroupCall && localVideoRef.current && localStreamRef.current && callType === 'video') {
      if (localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      localVideoRef.current.play().catch(() => {});
    }
  }, [isGroupCall, callType]);

  return (
    <div
      ref={modalContainerRef}
      className={`fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-md animate-in fade-in duration-200 ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4'
      }`}
    >
      <div
        className={`relative w-full bg-slate-950 overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between transition-all ${
          isFullscreen ? 'h-full max-w-none rounded-none border-none' : 'max-w-5xl h-[92vh] sm:h-[86vh] rounded-3xl'
        }`}
      >
        {/* Top Info Bar */}
        <div className="relative z-30 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              {isGroupCall ? (
                groupAvatar ? (
                  <img
                    src={api.getMediaUrl(groupAvatar)}
                    alt={groupName || 'Group'}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-400 flex items-center justify-center text-white shadow-md">
                    <Users className="w-5 h-5" />
                  </div>
                )
              ) : (
                <img
                  src={api.getMediaUrl(targetUser.avatar)}
                  alt={targetUser.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 border-blue-500 shadow-md"
                />
              )}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  callStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-pulse'
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <h3 className="font-bold text-white text-xs sm:text-sm truncate">
                  {isGroupCall ? groupName || 'Group Call' : targetUser.name}
                </h3>
                {isGroupCall && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30 shrink-0">
                    {1 + remotePeers.length} {language === 'km' ? 'នាក់' : 'members'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isGroupCall ? (language === 'km' ? 'កំពុងដំណើរការ' : 'Active Call') : statusLabel()}
                </span>
                {callStatus === 'connected' && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-white text-[11px] font-bold">{formatTime(duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Invite button for group calls */}
            {isGroupCall && (
              <button
                onClick={() => setShowInviteDrawer(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer border border-indigo-400/30"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{language === 'km' ? 'អញ្ជើញ' : 'Invite'}</span>
              </button>
            )}

            {/* Camera Orientation Auto-Rotation Toggle */}
            {callType === 'video' && (
              <button
                onClick={handleToggleOrientation}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium cursor-pointer transition-all shadow-sm"
                title={`Camera Orientation: ${orientationMode.toUpperCase()} (${activeOrientation})`}
              >
                {orientationMode === 'auto' ? (
                  <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                ) : activeOrientation === 'landscape' ? (
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                )}
                <span className="hidden sm:inline text-[11px]">
                  {orientationMode === 'auto'
                    ? language === 'km' ? 'បង្វិលស្វ័យប្រវត្តិ' : 'Auto Rotate'
                    : activeOrientation === 'landscape' ? '16:9' : '9:16'}
                </span>
              </button>
            )}

            {/* Quality & Network Adaptive Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium cursor-pointer transition-all shadow-sm"
                title="Resolution & Internet Quality Settings"
              >
                <Wifi className={`w-3.5 h-3.5 ${
                  networkQuality.status === 'excellent' || networkQuality.status === 'good'
                    ? 'text-emerald-400'
                    : networkQuality.status === 'fair'
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`} />
                <span className="font-semibold text-[11px] text-white">
                  {QUALITY_PROFILES[qualityMode].badge}
                </span>
                {networkQuality.rtt !== null && (
                  <span className="hidden md:inline font-mono text-[10px] text-slate-400">
                    • {networkQuality.rtt}ms
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Quality Dropdown Popover */}
              {showQualityMenu && (
                <div className="absolute top-9 right-0 w-72 bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      {language === 'km' ? 'គុណភាពវីដេអូ & អេក្រង់' : 'Video & Screen Quality'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {networkQuality.rtt !== null ? `${networkQuality.rtt}ms` : 'Testing...'}
                    </span>
                  </div>

                  <div className="mb-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                    <span>{language === 'km' ? 'ល្បឿនអ៊ីនធឺណិត' : 'Network Speed'}:</span>
                    <span className={`font-semibold capitalize ${
                      networkQuality.status === 'excellent' || networkQuality.status === 'good'
                        ? 'text-emerald-400'
                        : networkQuality.status === 'fair'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}>
                      {networkQuality.status} {networkQuality.packetLoss > 0 ? `(${networkQuality.packetLoss}% loss)` : ''}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {(Object.keys(QUALITY_PROFILES) as QualityMode[]).map((key) => {
                      const item = QUALITY_PROFILES[key];
                      const isSelected = qualityMode === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectQuality(key)}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/25 border border-indigo-500/50 text-white'
                              : 'hover:bg-slate-900 text-slate-300 border border-transparent'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                              <span>{language === 'km' ? item.labelKm : item.label}</span>
                              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] text-indigo-300 font-mono">
                                {item.resolution}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {language === 'km' ? item.descriptionKm : item.description}
                            </p>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition-all shadow-sm"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-indigo-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Main Calling Stage */}
        <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden bg-slate-900">
          <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* ========================================================
             CASE A: SPOTLIGHT FULL-VIEW MODE (Main Video + Filmstrip)
             Triggered when any tile or screen share is clicked/maximized!
             ======================================================== */}
          {spotlightId ? (
            <div className="w-full h-full p-2 sm:p-3 z-10 flex flex-col gap-2.5">
              {/* Spotlighted Main Video Display */}
              <div className="relative flex-1 w-full rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/40 bg-black">
                {spotlightId === 'local' ? (
                  <VideoTile
                    user={currentUser}
                    stream={localStreamRef.current || undefined}
                    isLocal={true}
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                    onSwitchCamera={handleSwitchCamera}
                    showSwitchCamera={callType === 'video'}
                    isSpotlighted={true}
                    onToggleSpotlight={() => setSpotlightId(null)}
                    orientation={activeOrientation}
                    orientationMode={orientationMode}
                    onToggleOrientation={handleToggleOrientation}
                  />
                ) : spotlightId === 'local-screen' ? (
                  <VideoTile
                    user={currentUser}
                    stream={screenStreamRef.current || undefined}
                    isLocal={true}
                    isMuted={false}
                    isVideoOff={false}
                    isSpotlighted={true}
                    onToggleSpotlight={() => setSpotlightId(null)}
                    isScreenShare={true}
                    hasScreenAudio={hasScreenAudio}
                  />
                ) : (
                  (() => {
                    const peer = remotePeers.find((p) => p.peerId === spotlightId);
                    return (
                      <VideoTile
                        user={peer?.user || targetUser}
                        stream={peer?.stream}
                        isLocal={false}
                        isSpeakerOn={isSpeakerOn}
                        isSpotlighted={true}
                        onToggleSpotlight={() => setSpotlightId(null)}
                        orientation={activeOrientation}
                      />
                    );
                  })()
                )}
              </div>

              {/* Filmstrip Thumbnail Row */}
              <div className="h-20 sm:h-24 w-full flex items-center gap-2 overflow-x-auto px-1 py-1 scrollbar-thin">
                {/* Local camera thumbnail if not spotlighted */}
                {spotlightId !== 'local' && (
                  <div
                    onClick={() => setSpotlightId('local')}
                    className="h-full aspect-video shrink-0 rounded-xl overflow-hidden border-2 border-slate-700/80 hover:border-indigo-500 cursor-pointer transition-all shadow-md hover:scale-[1.02] relative"
                    title={language === 'km' ? 'ចុចដើម្បីពង្រីកវីដេអូរបស់អ្នក' : 'Click to spotlight your video'}
                  >
                    <VideoTile
                      user={currentUser}
                      stream={localStreamRef.current || undefined}
                      isLocal={true}
                      isMuted={isMuted}
                      isVideoOff={isVideoOff}
                      isMini={true}
                    />
                  </div>
                )}

                {/* Local Screen Share thumbnail if active and not spotlighted */}
                {isScreenSharing && spotlightId !== 'local-screen' && (
                  <div
                    onClick={() => setSpotlightId('local-screen')}
                    className="h-full aspect-video shrink-0 rounded-xl overflow-hidden border-2 border-blue-500 hover:border-blue-400 cursor-pointer transition-all shadow-md hover:scale-[1.02] relative"
                    title={language === 'km' ? 'ចុចដើម្បីពង្រីកអេក្រង់' : 'Click to spotlight screen share'}
                  >
                    <VideoTile
                      user={currentUser}
                      stream={screenStreamRef.current || undefined}
                      isLocal={true}
                      isMini={true}
                      isScreenShare={true}
                      hasScreenAudio={hasScreenAudio}
                    />
                  </div>
                )}

                {/* Remote peer thumbnails */}
                {remotePeers.map((peer) => {
                  if (peer.peerId === spotlightId) return null;
                  return (
                    <div
                      key={peer.peerId}
                      onClick={() => setSpotlightId(peer.peerId)}
                      className="h-full aspect-video shrink-0 rounded-xl overflow-hidden border-2 border-slate-700/80 hover:border-indigo-500 cursor-pointer transition-all shadow-md hover:scale-[1.02] relative"
                      title={language === 'km' ? `ចុចដើម្បីពង្រីក ${peer.user?.name || 'User'}` : `Click to spotlight ${peer.user?.name || 'User'}`}
                    >
                      <VideoTile
                        user={peer.user}
                        stream={peer.stream}
                        isLocal={false}
                        isSpeakerOn={isSpeakerOn}
                        isMini={true}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isGroupCall ? (
            /* ========================================================
               CASE B: MULTI-PARTY FULL MESH GROUP CALL GRID
               Supports 1, 2, 3, 4, 5+ participants simultaneously!
               ======================================================== */
            <div className="w-full h-full p-3 sm:p-4 z-10 overflow-y-auto flex items-center justify-center">
              <div
                className={`w-full h-full max-h-[72vh] grid gap-3 sm:gap-4 ${
                  remotePeers.length === 0
                    ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                    : remotePeers.length === 1
                    ? 'grid-cols-1 sm:grid-cols-2 max-w-4xl'
                    : remotePeers.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl'
                    : 'grid-cols-2 grid-rows-2 max-w-5xl'
                }`}
              >
                {/* Local User Tile */}
                <VideoTile
                  user={currentUser}
                  stream={localStreamRef.current || undefined}
                  isLocal={true}
                  isMuted={isMuted}
                  isVideoOff={isVideoOff}
                  onSwitchCamera={handleSwitchCamera}
                  showSwitchCamera={callType === 'video'}
                  onToggleSpotlight={() => setSpotlightId('local')}
                  orientation={activeOrientation}
                  orientationMode={orientationMode}
                  onToggleOrientation={handleToggleOrientation}
                />

                {/* Local Screen Share Tile if sharing */}
                {isScreenSharing && (
                  <VideoTile
                    user={currentUser}
                    stream={screenStreamRef.current || undefined}
                    isLocal={true}
                    onToggleSpotlight={() => setSpotlightId('local-screen')}
                    isScreenShare={true}
                    hasScreenAudio={hasScreenAudio}
                  />
                )}

                {/* Remote Peers Tiles (Member 2, Member 3, etc.) */}
                {remotePeers.map((peer) => (
                  <VideoTile
                    key={peer.peerId}
                    user={peer.user}
                    stream={peer.stream}
                    isLocal={false}
                    isSpeakerOn={isSpeakerOn}
                    onToggleSpotlight={() => setSpotlightId(peer.peerId)}
                    orientation={activeOrientation}
                  />
                ))}

                {/* If nobody else joined yet, show an inviting tile */}
                {remotePeers.length === 0 && (
                  <div className="border-2 border-dashed border-slate-700/80 bg-slate-950/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-lg">
                    <div className="w-16 h-16 rounded-full bg-indigo-600/20 border-2 border-dashed border-indigo-400/40 flex items-center justify-center text-indigo-400">
                      <Users className="w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold">
                        {language === 'km' ? 'រង់ចាំសមាជិកក្រុម...' : 'Waiting for group members...'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                        {language === 'km' ? 'សមាជិកផ្សេងទៀតអាចចូលរួមបានគ្រប់ពេល' : 'Other members can join anytime'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowInviteDrawer(true)}
                      className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{language === 'km' ? 'អញ្ជើញសមាជិក' : 'Invite Members'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================
               CASE C: 1-ON-1 DIRECT CALL DISPLAY
               ======================================================== */
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Remote Video Sink */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                muted
                onClick={() => setSpotlightId(primaryRemotePeer?.peerId || 'remote')}
                className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 cursor-pointer ${
                  has1on1VideoStream ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              />

              {/* Maximize Button for 1-on-1 Remote Video */}
              {has1on1VideoStream && (
                <button
                  onClick={() => setSpotlightId(primaryRemotePeer?.peerId || 'remote')}
                  className="absolute top-4 left-4 z-20 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 shadow-lg cursor-pointer transition-all"
                  title="Spotlight Full View"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              {/* Remote Audio Sink */}
              <audio ref={remoteAudioRef} autoPlay playsInline />

              {/* Direct 1-on-1 Call Fallback Display when video is off / waiting */}
              {!has1on1VideoStream && (
                <div className="flex flex-col items-center justify-center p-6 text-center z-10 space-y-5">
                  <div className="relative">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-500 shadow-2xl overflow-hidden relative z-10 bg-slate-800">
                      <img
                        src={api.getMediaUrl(primaryRemotePeer?.user?.avatar || targetUser.avatar)}
                        alt={primaryRemotePeer?.user?.name || targetUser.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {callStatus !== 'ended' && (
                      <>
                        <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-ping duration-1000" />
                        <div className="absolute -inset-8 rounded-full bg-blue-500/10 animate-pulse duration-1000" />
                      </>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {primaryRemotePeer?.user?.name || targetUser.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{statusLabel()}</p>
                  </div>
                </div>
              )}

              {/* Picture-in-Picture Local Camera Feed for 1-on-1 */}
              {callType === 'video' && !isVideoOff && (
                <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl z-30 group">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    onClick={() => setSpotlightId('local')}
                    className="w-full h-full object-cover scale-x-[-1] cursor-pointer"
                  />
                  <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-semibold">
                    {language === 'km' ? 'អ្នក (កាមេរ៉ា)' : 'You (Live)'}
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                    <button
                      onClick={handleToggleOrientation}
                      className="p-1 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"
                      title="Rotate Camera"
                    >
                      <RotateCw className="w-3 h-3 text-indigo-300" />
                    </button>
                    <button
                      onClick={handleSwitchCamera}
                      className="p-1 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"
                      title="Switch Camera"
                    >
                      <SwitchCamera className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mediaError && (
            <div className="absolute bottom-4 left-4 right-4 bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs p-2.5 rounded-xl text-center backdrop-blur-md z-20">
              {mediaError}
            </div>
          )}

          {/* Slide-over In-Call Invite Members Drawer */}
          {showInviteDrawer && (
            <div className="absolute inset-y-0 right-0 w-full sm:w-80 bg-slate-950/95 border-l border-slate-800 backdrop-blur-xl z-40 flex flex-col p-5 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <h4 className="font-bold text-white text-sm">
                    {language === 'km' ? 'អញ្ជើញចូលរួមការហៅ' : 'Invite to Call'}
                  </h4>
                </div>
                <button
                  onClick={() => setShowInviteDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Room Quick Link */}
              <div className="my-4 p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <span className="text-[11px] text-slate-400 font-medium">
                  {language === 'km' ? 'តំណភ្ជាប់បន្ទប់ហៅ' : 'Call Room Link'}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/calls?room=${roomId}&group=${groupId || ''}`}
                    className="w-full text-xs bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-300 select-all outline-none font-mono"
                  />
                  <button
                    onClick={handleCopyCallLink}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  {language === 'km' ? 'សមាជិកក្រុម' : 'Group Members'}
                </span>
                {groupMembers.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">
                    {language === 'km' ? 'គ្មានសមាជិកផ្សេងទៀតទេ' : 'No other members to invite'}
                  </p>
                ) : (
                  groupMembers
                    .filter((m) => m.id !== currentUser?.id)
                    .map((member) => {
                      const isInvited = invitedUserIds.has(member.id) || remotePeers.some((p) => p.peerId === member.id);
                      const isAlreadyInCall = remotePeers.some((p) => p.peerId === member.id);
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative">
                              <img
                                src={api.getMediaUrl(member.avatar)}
                                alt={member.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              {member.isOnline && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                              )}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{member.role}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleInviteMember(member)}
                            disabled={isInvited}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                              isAlreadyInCall
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                : isInvited
                                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {isAlreadyInCall ? (
                              language === 'km' ? 'នៅក្នុងការហៅ' : 'In Call'
                            ) : isInvited ? (
                              <span className="inline-flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                {language === 'km' ? 'បានអញ្ជើញ' : 'Invited'}
                              </span>
                            ) : (
                              language === 'km' ? 'អញ្ជើញ' : 'Invite'
                            )}
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-20 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/70 to-transparent flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
          <button
            onClick={handleToggleMute}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {callType === 'video' && (
            <button
              onClick={handleToggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isVideoOff
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          )}

          {callType === 'video' && (
            <button
              onClick={handleToggleScreenShare}
              className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isScreenSharing
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400 shadow-blue-500/40'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen (Supports Device Audio)'}
            >
              <Monitor className="w-5 h-5" />
              {isScreenSharing && hasScreenAudio && (
                <span
                  className="absolute -top-1 -right-1 p-1 rounded-full bg-emerald-500 text-white border-2 border-slate-900 shadow-sm"
                  title="Device Audio Enabled"
                >
                  <Volume2 className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          )}

          {callType === 'video' && (
            <button
              onClick={handleToggleOrientation}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700"
              title={`Camera Rotation Mode: ${orientationMode.toUpperCase()} (${activeOrientation})`}
            >
              {orientationMode === 'auto' ? (
                <RotateCw className="w-5 h-5 text-indigo-400" />
              ) : activeOrientation === 'landscape' ? (
                <Monitor className="w-5 h-5 text-blue-400" />
              ) : (
                <Smartphone className="w-5 h-5 text-purple-400" />
              )}
            </button>
          )}

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
              !isSpeakerOn
                ? 'bg-amber-500 text-white'
                : 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700'
            }`}
            title="Speaker"
          >
            {!isSpeakerOn ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white shadow-xl shadow-red-600/30 flex items-center justify-center transition-all cursor-pointer ml-2"
            title={isGroupCall ? 'Leave Call' : 'End Call'}
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
