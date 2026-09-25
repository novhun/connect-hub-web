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
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [activePeerUser, setActivePeerUser] = useState<User | null>(
    role === 'callee' || targetUser.id !== currentUser?.id ? targetUser : null
  );

  // Group Call specific states
  const [showInviteDrawer, setShowInviteDrawer] = useState(false);
  const [groupMembers, setGroupMembers] = useState<GroupChatMemberItem[]>([]);
  const [invitedUserIds, setInvitedUserIds] = useState<Set<string>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescSetRef = useRef(false);
  const answeredPeersRef = useRef<Set<string>>(new Set());
  const activePeerIdRef = useRef<string | null>(
    role === 'callee' || targetUser.id !== currentUser?.id ? targetUser.id : null
  );
  const closedRef = useRef(false);
  const durationRef = useRef(0);

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

  const attachRemoteStream = () => {
    const stream = remoteStreamRef.current;
    if (!stream) return;
    if (remoteVideoRef.current) {
      if (remoteVideoRef.current.srcObject !== stream) {
        remoteVideoRef.current.srcObject = stream;
      }
      remoteVideoRef.current.play().catch(() => {});
    }
    if (remoteAudioRef.current) {
      if (remoteAudioRef.current.srcObject !== stream) {
        remoteAudioRef.current.srcObject = stream;
      }
      remoteAudioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    // Proactively initialize user media immediately on modal mount for both caller and callee
    initMediaStream();
  }, []);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !isSpeakerOn;
    }
  }, [isSpeakerOn]);

  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current && callType === 'video' && !isVideoOff) {
      if (localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      localVideoRef.current.play().catch(() => {});
    }
  }, [callType, isVideoOff]);

  useEffect(() => {
    attachRemoteStream();
  }, [hasRemoteStream, callType, callStatus]);

  const getVideoSender = () => pcRef.current?.getSenders().find((s) => s.track?.kind === 'video');

  const createPeerConnection = () => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        const destId = activePeerIdRef.current || (targetUser.id !== currentUser?.id ? targetUser.id : null);
        if (destId) {
          realtime.send({
            type: 'WEBRTC_ICE_CANDIDATE',
            targetUserId: destId,
            roomId,
            candidate: e.candidate.toJSON(),
          });
        }
      }
    };

    pc.ontrack = (e) => {
      if (e.streams && e.streams[0]) {
        remoteStreamRef.current = e.streams[0];
      } else {
        if (!remoteStreamRef.current) {
          remoteStreamRef.current = new MediaStream();
        }
        remoteStreamRef.current.addTrack(e.track);
      }
      setHasRemoteStream(true);
      setCallStatus('connected');
      attachRemoteStream();
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'failed') {
        finishCall('failed');
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setCallStatus('connected');
      }
    };

    // Attach local stream tracks or add explicit transceivers to guarantee video & audio negotiation
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    } else {
      pc.addTransceiver('audio', { direction: 'sendrecv' });
      if (callType === 'video') {
        pc.addTransceiver('video', { direction: 'sendrecv' });
      }
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

    const handlePeerJoin = async (peerId: string, peerName?: string, peerAvatar?: string) => {
      if (role !== 'caller') return;
      if (answeredPeersRef.current.has(peerId)) return;
      answeredPeersRef.current.add(peerId);
      activePeerIdRef.current = peerId;
      if (peerName || peerAvatar) {
        setActivePeerUser({
          id: peerId,
          name: peerName || targetUser.name,
          avatar: peerAvatar || targetUser.avatar,
          isOnline: true,
        });
      }
      stopRingtone();
      setCallStatus('connecting');
      const stream = await initMediaStream();
      const pc = createPeerConnection();
      if (stream) {
        stream.getTracks().forEach((track) => {
          const senders = pc.getSenders();
          const existing = senders.find((s) => s.track?.kind === track.kind);
          if (existing) {
            existing.replaceTrack(track).catch(() => {});
          } else {
            pc.addTrack(track, stream);
          }
        });
      }
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: callType === 'video',
        });
        await pc.setLocalDescription(offer);
        realtime.send({
          type: 'WEBRTC_OFFER',
          targetUserId: peerId,
          callerId: currentUser?.id,
          callerName: currentUser?.name,
          callerAvatar: currentUser?.avatar,
          roomId,
          sdp: pc.localDescription,
        });
      } catch (e) {
        console.warn('Create offer notice:', e);
      }
    };

    const handleSignal = async (msg: RealtimeMessage) => {
      if (msg.roomId !== roomId) return;

      switch (msg.type) {
        case 'CALL_ACCEPT': {
          if (role !== 'caller') return;
          const peerId = msg.calleeId || msg.fromUserId || targetUser.id;
          handlePeerJoin(peerId, msg.calleeName, msg.calleeAvatar);
          break;
        }
        case 'GROUP_CALL_JOIN': {
          if (role !== 'caller') return;
          const joinerId = msg.userId || msg.fromUserId;
          if (!joinerId || joinerId === currentUser?.id) return;
          handlePeerJoin(joinerId, msg.userName, msg.userAvatar);
          break;
        }
        case 'WEBRTC_OFFER': {
          if (role !== 'callee') return;
          const senderId = msg.callerId || msg.fromUserId || targetUser.id;
          activePeerIdRef.current = senderId;
          if (msg.callerName || msg.callerAvatar) {
            setActivePeerUser({
              id: senderId,
              name: msg.callerName || targetUser.name,
              avatar: msg.callerAvatar || targetUser.avatar,
              isOnline: true,
            });
          }
          const stream = await initMediaStream();
          const pc = createPeerConnection();
          if (stream) {
            stream.getTracks().forEach((track) => {
              const senders = pc.getSenders();
              const existing = senders.find((s) => s.track?.kind === track.kind);
              if (existing) {
                existing.replaceTrack(track).catch(() => {});
              } else {
                pc.addTrack(track, stream);
              }
            });
          }
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
            remoteDescSetRef.current = true;
            await flushPendingCandidates();
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            realtime.send({
              type: 'WEBRTC_ANSWER',
              targetUserId: senderId,
              callerId: currentUser?.id,
              roomId,
              sdp: pc.localDescription,
            });
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
            setCallStatus('connected');
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
          }
          break;
        case 'GROUP_CALL_LEAVE':
          if (msg.userId && msg.userId === activePeerIdRef.current) {
            setHasRemoteStream(false);
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
            activePeerIdRef.current = null;
            setActivePeerUser(null);
            if (role === 'callee') {
              finishCall('ended');
            } else {
              setCallStatus('ringing');
            }
          }
          break;
        case 'GROUP_CALL_END':
          finishCall('ended');
          break;
      }
    };

    const unsubscribe = realtime.subscribe(handleSignal);

    initMediaStream().then(() => {
      if (role === 'caller' && !isGroupCall) {
        ringTimeout = setTimeout(() => {
          if (answeredPeersRef.current.size === 0 && !closedRef.current) {
            realtime.send({ type: 'CALL_END', targetUserId: targetUser.id, roomId });
            finishCall('unavailable');
          }
        }, 30000);
      } else if (role === 'caller' && isGroupCall) {
        ringTimeout = setTimeout(() => {
          if (answeredPeersRef.current.size === 0 && !closedRef.current) {
            finishCall('unavailable');
          }
        }, 60000);
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

  // Ringback tone for the caller while waiting for the other side to answer.
  useEffect(() => {
    if (role !== 'caller' || callStatus !== 'ringing') {
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
  }, [role, callStatus]);

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
      // Turning camera back ON
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
          const sender = getVideoSender();
          if (sender) {
            await sender.replaceTrack(newTrack);
          } else if (pcRef.current) {
            pcRef.current.addTrack(newTrack, localStreamRef.current);
          }
        } catch (err) {
          console.warn('Failed to start camera track:', err);
        }
      } else {
        videoTrack.enabled = true;
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
      setIsVideoOff(false);
    } else {
      // Turning camera OFF
      localStreamRef.current?.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
      setIsVideoOff(true);
    }
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
    if (isGroupCall && groupId) {
      if (role === 'caller') {
        realtime.send({ type: 'GROUP_CALL_END', groupId, roomId, userId: currentUser?.id });
      } else {
        realtime.send({ type: 'GROUP_CALL_LEAVE', groupId, roomId, userId: currentUser?.id });
        if (activePeerIdRef.current) {
          realtime.send({ type: 'CALL_END', targetUserId: activePeerIdRef.current, roomId });
        }
      }
    } else {
      const destId = activePeerIdRef.current || targetUser.id;
      realtime.send({ type: 'CALL_END', targetUserId: destId, roomId });
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

  const showRemoteVideo = callType === 'video' && hasRemoteStream && callStatus === 'connected';
  const displayUser = activePeerUser || (targetUser.id !== currentUser?.id ? targetUser : null);

  // For group call, collect display participants
  const otherMembers = isGroupCall
    ? groupMembers.filter((m) => m.id !== currentUser?.id && m.id !== (displayUser ? displayUser.id : targetUser.id))
    : [];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] sm:h-[82vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between">
        {/* Top Info Bar */}
        <div className="relative z-20 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              {isGroupCall ? (
                groupAvatar ? (
                  <img
                    src={api.getMediaUrl(groupAvatar)}
                    alt={groupName || 'Group'}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-indigo-500 shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-400 flex items-center justify-center text-white shadow-md">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                )
              ) : (
                <img
                  src={api.getMediaUrl(targetUser.avatar)}
                  alt={targetUser.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-blue-500 shadow-md"
                />
              )}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  callStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-pulse'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  {isGroupCall ? groupName || 'Group Call' : targetUser.name}
                </h3>
                {isGroupCall && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
                    {language === 'km' ? 'ការហៅជាក្រុម' : 'Group Call'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {isGroupCall ? (language === 'km' ? 'កំពុងដំណើរការ' : 'Active Group Call') : statusLabel()}
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
            {isGroupCall && (
              <button
                onClick={() => setShowInviteDrawer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer border border-indigo-400/30"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'km' ? 'អញ្ជើញមិត្តភក្តិ' : 'Invite'}</span>
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300 backdrop-blur-md font-mono">
              <Signal className="w-3 h-3 text-emerald-400" />
              <span className="text-blue-400">{isGroupCall ? 'Group Mesh' : 'WebRTC P2P'}</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              {callType === 'video' ? 'Video' : 'Audio'}
            </div>
          </div>
        </div>

        {/* Main Calling Stage */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-900">
          <div className="absolute w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Remote Video Sink - Always Mounted in DOM to Guarantee Stream Attachment */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${
              showRemoteVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Dedicated Audio Sink - Permanently mounted so remote audio plays seamlessly */}
          <audio ref={remoteAudioRef} autoPlay playsInline />

          {/* Fallback Display with Avatar when remote video is not active / during ringing */}
          {!showRemoteVideo && (
            isGroupCall ? (
              /* Group Call Multi-Participant Stage */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 z-10 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl w-full">
                  {/* Current User Card */}
                  <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative shadow-lg">
                    <div className="relative">
                      <img
                        src={api.getMediaUrl(currentUser?.avatar || '')}
                        alt={currentUser?.name || 'You'}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-indigo-500"
                      />
                      <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                        isMuted ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white text-xs sm:text-sm font-semibold truncate max-w-[120px]">
                        {currentUser?.name || 'You'} <span className="text-slate-400 font-normal">({language === 'km' ? 'អ្នក' : 'You'})</span>
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                        {isMuted ? <MicOff className="w-3 h-3 text-red-400" /> : <Mic className="w-3 h-3 text-emerald-400" />}
                        {isMuted ? (language === 'km' ? 'បិទសំឡេង' : 'Muted') : (language === 'km' ? 'កំពុងនិយាយ' : 'Speaking')}
                      </p>
                    </div>
                  </div>

                  {/* Target User / Joined Peer Card */}
                  {displayUser ? (
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative shadow-lg">
                      <div className="relative">
                        <img
                          src={api.getMediaUrl(displayUser.avatar)}
                          alt={displayUser.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-blue-500"
                        />
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-emerald-500 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-white text-xs sm:text-sm font-semibold truncate max-w-[120px]">
                          {displayUser.name}
                        </p>
                        <p className="text-[11px] text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                          <Mic className="w-3 h-3 text-emerald-400" />
                          {hasRemoteStream ? (language === 'km' ? 'សកម្ម' : 'Active') : (language === 'km' ? 'កំពុងភ្ជាប់...' : 'Connecting...')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative shadow-lg">
                      <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 border-2 border-dashed border-indigo-400/50 flex items-center justify-center text-indigo-400">
                          <Users className="w-7 h-7 animate-pulse" />
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-amber-400 animate-ping" />
                      </div>
                      <div>
                        <p className="text-white text-xs sm:text-sm font-semibold truncate max-w-[120px]">
                          {language === 'km' ? 'រង់ចាំសមាជិក...' : 'Waiting to join...'}
                        </p>
                        <p className="text-[11px] text-amber-400 mt-0.5">
                          {language === 'km' ? 'កំពុងហៅ...' : 'Ringing...'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Other Group Members in Call / Group */}
                  {otherMembers.slice(0, 1).map((member) => (
                    <div
                      key={member.id}
                      className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative shadow-lg"
                    >
                      <div className="relative">
                        <img
                          src={api.getMediaUrl(member.avatar)}
                          alt={member.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-700"
                        />
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${
                          invitedUserIds.has(member.id) ? 'bg-amber-400 animate-ping' : member.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                        }`} />
                      </div>
                      <div>
                        <p className="text-white text-xs sm:text-sm font-semibold truncate max-w-[120px]">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {invitedUserIds.has(member.id) ? (language === 'km' ? 'បានអញ្ជើញ...' : 'Invited...') : member.role}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Quick Invite Button Tile in Grid */}
                  <button
                    onClick={() => setShowInviteDrawer(true)}
                    className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/30 hover:bg-slate-950/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-slate-800 group-hover:bg-indigo-600/30 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-colors">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                      {language === 'km' ? '+ អញ្ជើញសមាជិក' : '+ Invite Member'}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              /* Direct 1-on-1 Call Fallback Display */
              <div className="flex flex-col items-center justify-center p-6 text-center z-10 space-y-5">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-blue-500 shadow-2xl overflow-hidden relative z-10 bg-slate-800">
                    <img
                      src={api.getMediaUrl(displayUser ? displayUser.avatar : targetUser.avatar)}
                      alt={displayUser ? displayUser.name : targetUser.name}
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
                  <h3 className="text-xl sm:text-2xl font-black text-white">{displayUser ? displayUser.name : targetUser.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{statusLabel()}</p>
                </div>
              </div>
            )
          )}

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
                    value={`${window.location.origin}/calls?room=${roomId}`}
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
                      const isInvited = invitedUserIds.has(member.id);
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
                              isInvited
                                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }`}
                          >
                            {isInvited ? (
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
            title={isGroupCall ? 'Leave Call' : 'End Call'}
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

