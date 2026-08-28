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
} from 'lucide-react';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { realtime, RealtimeMessage } from '../services/realtime';

interface RealCallModalProps {
  targetUser: User;
  callType: 'audio' | 'video';
  roomId: string;
  role: 'caller' | 'callee';
  sessionId?: string;
  onClose: () => void;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

type CallStatus = 'ringing' | 'connecting' | 'connected' | 'ended';
type EndReason = 'declined' | 'unavailable' | 'ended' | 'failed' | null;

export const RealCallModal: React.FC<RealCallModalProps> = ({
  targetUser,
  callType,
  roomId,
  role,
  sessionId,
  onClose,
}) => {
  const { language } = useLanguage();
  const [callStatus, setCallStatus] = useState<CallStatus>(role === 'caller' ? 'ringing' : 'connecting');
  const [endReason, setEndReason] = useState<EndReason>(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescSetRef = useRef(false);
  const answeredRef = useRef(role === 'callee');
  const closedRef = useRef(false);
  const durationRef = useRef(0);

  // Real getUserMedia — actual camera/mic, no simulated fallback data.
  const initMediaStream = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      setMediaError(null);
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' ? { facingMode } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      if (localVideoRef.current && callType === 'video') {
        localVideoRef.current.srcObject = stream;
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

  const attachRemoteStream = () => {
    const stream = remoteStreamRef.current;
    if (!stream) return;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = stream;
  };

  useEffect(() => {
    attachRemoteStream();
  }, [hasRemoteStream, callType, isVideoOff]);

  const getVideoSender = () => pcRef.current?.getSenders().find((s) => s.track?.kind === 'video');

  const createPeerConnection = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        realtime.send({
          type: 'WEBRTC_ICE_CANDIDATE',
          targetUserId: targetUser.id,
          roomId,
          candidate: e.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (e) => {
      remoteStreamRef.current = e.streams[0];
      setHasRemoteStream(true);
      setCallStatus('connected');
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') {
        finishCall('failed');
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
    }

    pcRef.current = pc;
    return pc;
  };

  const flushPendingCandidates = async () => {
    const pc = pcRef.current;
    if (!pc) return;
    const queued = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('ICE candidate apply notice:', e);
      }
    }
  };

  const cleanupMedia = () => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
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

  // Signaling + WebRTC handshake, plus the caller's ring timeout.
  useEffect(() => {
    let ringTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleSignal = async (msg: RealtimeMessage) => {
      if (msg.roomId !== roomId) return;

      switch (msg.type) {
        case 'CALL_ACCEPT': {
          if (role !== 'caller' || answeredRef.current) return;
          answeredRef.current = true;
          setCallStatus('connecting');
          if (!localStreamRef.current) await initMediaStream();
          const pc = createPeerConnection();
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            realtime.send({ type: 'WEBRTC_OFFER', targetUserId: targetUser.id, roomId, sdp: pc.localDescription });
          } catch (e) {
            console.warn('Create offer notice:', e);
          }
          break;
        }
        case 'WEBRTC_OFFER': {
          if (role !== 'callee') return;
          if (!localStreamRef.current) await initMediaStream();
          const pc = createPeerConnection();
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            remoteDescSetRef.current = true;
            await flushPendingCandidates();
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            realtime.send({ type: 'WEBRTC_ANSWER', targetUserId: targetUser.id, roomId, sdp: pc.localDescription });
            setCallStatus('connecting');
          } catch (e) {
            console.warn('Handle offer notice:', e);
          }
          break;
        }
        case 'WEBRTC_ANSWER': {
          if (role !== 'caller') return;
          const pc = pcRef.current;
          if (!pc) return;
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            remoteDescSetRef.current = true;
            await flushPendingCandidates();
          } catch (e) {
            console.warn('Set remote answer notice:', e);
          }
          break;
        }
        case 'WEBRTC_ICE_CANDIDATE': {
          if (remoteDescSetRef.current && pcRef.current) {
            try {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
            } catch (e) {
              console.warn('ICE candidate notice:', e);
            }
          } else {
            pendingCandidatesRef.current.push(msg.candidate);
          }
          break;
        }
        case 'CALL_DECLINE':
          finishCall('declined');
          break;
        case 'CALL_UNAVAILABLE':
          finishCall('unavailable');
          break;
        case 'CALL_END':
          finishCall('ended');
          break;
      }
    };

    const unsubscribe = realtime.subscribe(handleSignal);

    initMediaStream().then(() => {
      if (role === 'caller') {
        ringTimeout = setTimeout(() => {
          if (!answeredRef.current && !closedRef.current) {
            realtime.send({ type: 'CALL_END', targetUserId: targetUser.id, roomId });
            finishCall('unavailable');
          }
        }, 30000);
      }
    });

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

  const handleToggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsVideoOff(!isVideoOff);
  };

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    setIsScreenSharing(false);
    const camTrack = localStreamRef.current?.getVideoTracks()[0];
    if (camTrack) {
      getVideoSender()?.replaceTrack(camTrack).catch(() => {});
    }
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      const screenTrack = stream.getVideoTracks()[0];
      await getVideoSender()?.replaceTrack(screenTrack);
      setIsScreenSharing(true);
      screenTrack.onended = () => stopScreenShare();
    } catch (e) {
      console.warn('Screen share cancelled/denied:', e);
    }
  };

  const handleSwitchCamera = async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: nextMode } });
      const newTrack = stream.getVideoTracks()[0];
      await getVideoSender()?.replaceTrack(newTrack);
      const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0];
      oldVideoTrack?.stop();
      if (localStreamRef.current) {
        localStreamRef.current.removeTrack(oldVideoTrack!);
        localStreamRef.current.addTrack(newTrack);
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
    } catch (e) {
      console.warn('Switch camera notice:', e);
    }
  };

  const handleEndCall = () => {
    realtime.send({ type: 'CALL_END', targetUserId: targetUser.id, roomId });
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
    return language === 'km' ? 'បានតភ្ជាប់ (WebRTC ផ្ទាល់)' : 'Connected — Live P2P';
  };

  const showRemoteVideo = callType === 'video' && !isVideoOff && hasRemoteStream && callStatus === 'connected';

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] sm:h-[82vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between">
        {/* Top Info Bar */}
        <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={api.getMediaUrl(targetUser.avatar)}
                alt={targetUser.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-500 shadow-md"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  callStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-pulse'
                }`}
              />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">{targetUser.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {statusLabel()}
                </span>
                {callStatus === 'connected' && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-white font-bold">{formatTime(duration)}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300 backdrop-blur-md font-mono">
              <Signal className="w-3 h-3 text-emerald-400" />
              <span className="text-blue-400">WebRTC P2P</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              {callType === 'video' ? 'Video' : 'Audio'}
            </div>
          </div>
        </div>

        {/* Main Calling Stage */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-900">
          <div className="absolute w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          {showRemoteVideo ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="relative w-full h-full object-cover z-10" />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center z-10 space-y-5">
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-500 shadow-2xl overflow-hidden relative z-10 bg-slate-800">
                  <img
                    src={api.getMediaUrl(targetUser.avatar)}
                    alt={targetUser.name}
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
                <h3 className="text-xl sm:text-2xl font-black text-white">{targetUser.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{statusLabel()}</p>
              </div>
            </div>
          )}

          {/* Hidden audio sink so audio-only (or camera-off) calls still play the remote track */}
          {!showRemoteVideo && <audio ref={remoteAudioRef} autoPlay />}

          {/* Picture-in-Picture Local Camera Feed (Top Right) */}
          {callType === 'video' && !isVideoOff && (
            <div className="absolute top-4 right-4 w-32 sm:w-44 aspect-video bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl z-30 group">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-white font-semibold">
                {language === 'km' ? 'អ្នក (កាមេរ៉ា)' : 'You (Live)'}
              </div>
              <button
                onClick={handleSwitchCamera}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white cursor-pointer"
                title="Switch Camera"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {mediaError && (
            <div className="absolute bottom-4 left-4 right-4 bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs p-2.5 rounded-xl text-center backdrop-blur-md z-20">
              {mediaError}
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="relative z-20 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
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
              className={`hidden sm:flex w-12 h-12 rounded-full items-center justify-center transition-all cursor-pointer shadow-lg ${
                isScreenSharing
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title="Share Screen"
            >
              <Monitor className="w-5 h-5" />
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
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
