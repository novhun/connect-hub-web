import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Send, 
  Phone, 
  Video, 
  MessageSquare, 
  UserPlus, 
  ArrowLeft, 
  Loader2, 
  Users, 
  Mic, 
  Paperclip, 
  Smile, 
  Play, 
  Pause, 
  FileText, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  AlertCircle,
  X,
  Film
} from 'lucide-react';
import { User, DirectMessage } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { friendsApi } from '../../modules/friends/api';
import { realtime, RealtimeMessage } from '../../services/realtime';
import { getYouTubeVideoId, extractUrls, isVideoFile } from '../../utils/mediaHelpers';
import { VideoEmbedPlayer } from '../VideoEmbedPlayer';
import { MediaViewerModal } from '../MediaViewerModal';

interface ChatContact {
  user: User;
  lastMessage?: string;
  lastTimestamp?: string;
  unreadCount?: number;
}

interface MessagesViewProps {
  onlineMembers?: User[];
  currentUser: User;
  onStartCall: (user: User, type: 'audio' | 'video') => void;
  onNavigate?: (tab: string) => void;
}

// 70 Megabytes in bytes
const MAX_FILE_SIZE_BYTES = 70 * 1024 * 1024;

// Format bytes to human readable size
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Sticker collections
const STICKER_LIST = [
  { id: 'st-like', emoji: '👍', name: 'Thumbs Up' },
  { id: 'st-heart', emoji: '❤️', name: 'Heart' },
  { id: 'st-fire', emoji: '🔥', name: 'Fire' },
  { id: 'st-party', emoji: '🎉', name: 'Party' },
  { id: 'st-laugh', emoji: '😂', name: 'Laughing' },
  { id: 'st-love', emoji: '🥰', name: 'Love Eyes' },
  { id: 'st-rocket', emoji: '🚀', name: 'Rocket' },
  { id: 'st-100', emoji: '💯', name: '100 Points' },
  { id: 'st-clap', emoji: '👏', name: 'Clap' },
  { id: 'st-star', emoji: '⭐', name: 'Star' },
  { id: 'st-cat', emoji: '😻', name: 'Love Cat' },
  { id: 'st-dog', emoji: '🐶', name: 'Puppy' },
  { id: 'st-cool', emoji: '😎', name: 'Cool' },
  { id: 'st-mindblown', emoji: '🤯', name: 'Mind Blown' },
  { id: 'st-money', emoji: '🤑', name: 'Money Face' },
  { id: 'st-magic', emoji: '✨', name: 'Sparkles' },
  { id: 'st-pizza', emoji: '🍕', name: 'Pizza' },
  { id: 'st-coffee', emoji: '☕', name: 'Coffee' },
  { id: 'st-peace', emoji: '✌️', name: 'Peace' },
  { id: 'st-cry', emoji: '😭', name: 'Sobbing' },
  { id: 'st-pray', emoji: '🙏', name: 'Thank You' },
  { id: 'st-ok', emoji: '👌', name: 'OK Sign' },
  { id: 'st-diamond', emoji: '💎', name: 'Diamond' },
  { id: 'st-flex', emoji: '💪', name: 'Strong' },
];

// Voice player component for voice message bubbles
const VoiceMessagePlayer: React.FC<{ url: string; duration?: string; isMe: boolean }> = ({ url, duration, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(api.getMediaUrl(url));
    audioRef.current = audio;

    const handleLoaded = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoaded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoaded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.warn('Audio play notice:', e));
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPct = totalDuration > 0 ? (currentTime / totalDuration) * 100 : (isPlaying ? 50 : 0);

  return (
    <div className={`flex items-center gap-2.5 py-1 px-1.5 min-w-[200px] sm:min-w-[230px]`}>
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs transition-transform active:scale-95 ${
          isMe ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
      </button>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-0.5 h-4">
          {[40, 70, 30, 90, 50, 80, 60, 100, 45, 75, 95, 35, 65, 85, 55, 70, 90, 40].map((h, i) => {
            const barPct = (i / 18) * 100;
            const isPassed = barPct <= progressPct;
            return (
              <div
                key={i}
                style={{ height: `${h}%` }}
                className={`w-1 rounded-full transition-colors ${
                  isPassed
                    ? (isMe ? 'bg-white' : 'bg-blue-600')
                    : (isMe ? 'bg-white/40' : 'bg-gray-300')
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-medium leading-none">
          <span className={isMe ? 'text-blue-100' : 'text-gray-500'}>
            {isPlaying ? formatSecs(currentTime) : (duration || formatSecs(totalDuration || 0))}
          </span>
          <span className={isMe ? 'text-blue-200' : 'text-gray-400'}>
            {formatSecs(totalDuration || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  onStartCall,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isMobileThreadActive, setIsMobileThreadActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lightbox Media Viewer State
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; fileName?: string } | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stickerPickerRef = useRef<HTMLDivElement>(null);

  // Close stickers on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (stickerPickerRef.current && !stickerPickerRef.current.contains(e.target as Node)) {
        setShowStickers(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch confirmed friends + all users who have ever chatted with currentUser
  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const [friendsRes, convsRes] = await Promise.allSettled([
        friendsApi.getFriends(),
        api.getConversations(),
      ]);

      const friendsList: User[] = friendsRes.status === 'fulfilled' && Array.isArray(friendsRes.value) ? friendsRes.value : [];
      const convsList = convsRes.status === 'fulfilled' && Array.isArray(convsRes.value) ? convsRes.value : [];

      const contactsMap = new Map<string, ChatContact>();

      // 1. Add all users who have ever chatted with currentUser
      for (const conv of convsList) {
        if (conv?.user?.id && conv.user.id !== currentUser.id) {
          contactsMap.set(conv.user.id, {
            user: conv.user,
            lastMessage: conv.lastMessage,
            lastTimestamp: conv.lastTimestamp,
            unreadCount: conv.unreadCount || 0,
          });
        }
      }

      // 2. Add all confirmed friends (if not already in map)
      for (const friend of friendsList) {
        if (friend.id && friend.id !== currentUser.id) {
          if (!contactsMap.has(friend.id)) {
            contactsMap.set(friend.id, {
              user: friend,
            });
          }
        }
      }

      const combined = Array.from(contactsMap.values());
      setContacts(combined);

      // Auto-select first contact if none currently selected
      if (combined.length > 0 && !selectedUser) {
        setSelectedUser(combined[0].user);
      }
    } catch (e) {
      console.warn('Fetch contacts notice:', e);
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch messages from API whenever selected user changes
  const fetchMessages = async (userId: string) => {
    if (!userId) return;
    try {
      setLoadingMessages(true);
      const data = await api.getMessages(userId);
      setMessages(data || []);
      // Mark read
      api.markChatRead(userId).catch(() => {});
    } catch (e) {
      console.warn('Could not fetch messages from API, keeping local state:', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedUser?.id) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Live chat updates via shared app-wide realtime connection
  useEffect(() => {
    const unsubscribe = realtime.subscribe((msg: RealtimeMessage) => {
      if (msg.type === 'NEW_MESSAGE' && msg.message) {
        if (msg.message.senderId === selectedUser?.id) {
          setMessages((prev) => [...prev, msg.message]);
        }
        // Update contact last message preview
        setContacts((prev) =>
          prev.map((c) => {
            if (c.user.id === msg.message.senderId) {
              return {
                ...c,
                lastMessage: msg.message.messageType === 'voice' 
                  ? `🎤 ${t('messages.voiceMessage')}`
                  : msg.message.messageType === 'sticker' 
                  ? `✨ ${t('messages.stickers')}`
                  : msg.message.messageType === 'file' 
                  ? `📎 ${msg.message.fileName || 'File'}`
                  : msg.message.text,
                lastTimestamp: msg.message.timestamp,
              };
            }
            return c;
          })
        );
      }
    });
    return unsubscribe;
  }, [selectedUser?.id]);

  const handleSelectMember = (member: User) => {
    setSelectedUser(member);
    setIsMobileThreadActive(true);
  };

  // Generic message sender helper
  const sendChatMessage = async (payload: {
    text?: string;
    messageType?: 'text' | 'voice' | 'file' | 'sticker' | 'image';
    mediaUrl?: string;
    fileName?: string;
    fileSize?: string;
    duration?: string;
  }) => {
    if (!selectedUser?.id) return;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const tempMsg: DirectMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: payload.text || '',
      timestamp: timeStr,
      isMe: true,
      messageType: payload.messageType || 'text',
      mediaUrl: payload.mediaUrl,
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      duration: payload.duration,
    };
    setMessages((prev) => [...prev, tempMsg]);

    // Update contacts list preview
    const previewText = payload.messageType === 'voice' 
      ? `🎤 ${t('messages.voiceMessage')}`
      : payload.messageType === 'sticker' 
      ? `✨ ${payload.text || t('messages.stickers')}`
      : payload.messageType === 'file' 
      ? `📎 ${payload.fileName || 'File'}`
      : payload.text || '';

    setContacts((prev) =>
      prev.map((c) =>
        c.user.id === selectedUser.id
          ? { ...c, lastMessage: previewText, lastTimestamp: timeStr }
          : c
      )
    );

    try {
      const serverMsg = await api.sendMessage(selectedUser.id, payload);
      if (serverMsg) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? serverMsg : m))
        );
      }
    } catch (e) {
      console.warn('Message send failed on API:', e);
    }
  };

  // Text message send
  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    sendChatMessage({ text, messageType: 'text' });
  };

  // Send Sticker
  const handleSendSticker = (sticker: typeof STICKER_LIST[0]) => {
    setShowStickers(false);
    sendChatMessage({
      text: sticker.emoji,
      messageType: 'sticker',
    });
  };

  // Handle File Upload (Max 70MB)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploadError(null);

    // Validate size <= 70 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(t('messages.fileSizeExceeded'));
      setTimeout(() => setUploadError(null), 5000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.uploadMedia(file);
      if (res?.url) {
        const isImg = file.type.startsWith('image/');
        sendChatMessage({
          text: isImg ? '' : file.name,
          messageType: isImg ? 'image' : 'file',
          mediaUrl: res.url,
          fileName: file.name,
          fileSize: formatFileSize(file.size),
        });
      }
    } catch (err) {
      console.warn('File upload failed:', err);
      setUploadError(language === 'km' ? 'ការបញ្ចូលឯកសារបរាជ័យ' : 'File upload failed');
      setTimeout(() => setUploadError(null), 4000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      setUploadError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied:', err);
      setUploadError(language === 'km' ? 'សូមអនុញ្ញាតការប្រើប្រាស់មីក្រូហ្វូន' : 'Please allow microphone access');
      setTimeout(() => setUploadError(null), 4000);
    }
  };

  // Stop and Send Voice Recording
  const stopAndSendRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    clearInterval(recordingTimerRef.current);
    const durationStr = `${Math.floor(recordingSeconds / 60)}:${recordingSeconds % 60 < 10 ? '0' : ''}${recordingSeconds % 60}`;

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });

      // Stop audio tracks
      if (mediaRecorderRef.current?.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }

      setIsRecording(false);
      setRecordingSeconds(0);

      try {
        setIsUploading(true);
        const res = await api.uploadMedia(audioFile);
        if (res?.url) {
          sendChatMessage({
            text: '',
            messageType: 'voice',
            mediaUrl: res.url,
            duration: durationStr,
          });
        }
      } catch (e) {
        console.warn('Voice upload failed:', e);
      } finally {
        setIsUploading(false);
      }
    };

    mediaRecorderRef.current.stop();
  };

  // Cancel Voice Recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  // Filter contacts based on search query
  const filteredContacts = contacts.filter((c) =>
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden flex h-[75vh] sm:h-[78vh] relative">
      {/* Left conversation list */}
      <div className={`${isMobileThreadActive ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-gray-200 flex-col`}>
        <div className="p-3.5 sm:p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="font-bold text-gray-900 text-base sm:text-lg">{t('messages.chats')}</h2>
            {contacts.length > 0 && (
              <span className="text-[11px] font-semibold text-gray-400">
                {contacts.length} {language === 'km' ? 'ការសន្ទនា' : 'Chats'}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('messages.searchMessenger')}
              className="w-full bg-gray-100 rounded-full py-1.5 pl-9 pr-3 text-xs outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loadingContacts ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-xs">{t('messages.loadingChats')}</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">{t('messages.noFriendsTitle')}</h4>
                <p className="text-[11px] text-gray-400 mt-1">
                  {t('messages.noFriendsDesc')}
                </p>
              </div>
              <button
                onClick={() => onNavigate?.('friends')}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t('messages.findFriends')}</span>
              </button>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const member = contact.user;
              const isSelected = selectedUser?.id === member.id;
              return (
                <div
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className={`p-3 sm:p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={api.getMediaUrl(member.avatar)}
                      alt={member.name}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-gray-200"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white ${
                        member.isOnline ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{member.name}</h4>
                      {contact.lastTimestamp && (
                        <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                          {contact.lastTimestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-500 truncate mt-0.5">
                      {contact.lastMessage || t('messages.startConversation')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right chat thread */}
      <div className={`${!isMobileThreadActive ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#f8fafc]`}>
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setIsMobileThreadActive(false)}
                  className="md:hidden p-1.5 -ml-1 hover:bg-gray-100 rounded-full text-gray-600 cursor-pointer"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative shrink-0">
                  <img
                    src={api.getMediaUrl(selectedUser.avatar)}
                    alt={selectedUser.name}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                      selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{selectedUser.name}</h3>
                  <p className="text-[11px] text-green-600 font-medium">
                    {selectedUser.isOnline ? t('messages.activeNow') : (language === 'km' ? 'ក្រៅបណ្តាញ' : 'Offline')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                <button
                  onClick={() => onStartCall(selectedUser, 'audio')}
                  className="p-2 hover:bg-gray-100 rounded-full text-green-600 transition-colors cursor-pointer"
                  title={t('messages.audioCall')}
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onStartCall(selectedUser, 'video')}
                  className="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-colors cursor-pointer"
                  title={t('messages.videoCall')}
                >
                  <Video className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {uploadError && (
              <div className="bg-red-50 border-b border-red-100 px-4 py-2 text-xs text-red-600 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{uploadError}</span>
                </div>
                <button onClick={() => setUploadError(null)} className="p-0.5 hover:bg-red-100 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message history */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
              {loadingMessages && messages.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{t('messages.loadingMessages')}</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-400 space-y-2">
                  <MessageSquare className="w-8 h-8 text-gray-300 mx-auto" />
                  <p>{t('messages.noMessages', { name: selectedUser.name })}</p>
                </div>
              ) : (
                messages.map((msg) => {
                  // Check if message text contains a video / YouTube URL
                  const urls = extractUrls(msg.text);
                  const firstYtOrVideoUrl = urls.find((u) => getYouTubeVideoId(u) || isVideoFile(u));
                  const isFileVideo = msg.messageType === 'file' && msg.mediaUrl && isVideoFile(msg.fileName || msg.mediaUrl);

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${
                        msg.isMe ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      {!msg.isMe && (
                        <img
                          src={api.getMediaUrl(selectedUser.avatar)}
                          alt={selectedUser.name}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0 mt-1"
                        />
                      )}
                      <div className="flex flex-col">
                        {/* Voice Message Bubble */}
                        {msg.messageType === 'voice' && msg.mediaUrl ? (
                          <div
                            className={`rounded-2xl shadow-2xs ${
                              msg.isMe
                                ? 'bg-[#2563eb] text-white rounded-br-xs'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs'
                            }`}
                          >
                            <VoiceMessagePlayer url={msg.mediaUrl} duration={msg.duration} isMe={msg.isMe} />
                          </div>
                        ) : msg.messageType === 'sticker' ? (
                          <div className="py-1 px-1 text-5xl sm:text-6xl hover:scale-110 transition-transform select-none">
                            {msg.text}
                          </div>
                        ) : msg.messageType === 'image' && msg.mediaUrl ? (
                          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xs max-w-[260px] bg-black/5">
                            <img
                              src={api.getMediaUrl(msg.mediaUrl)}
                              alt="Uploaded visual"
                              onClick={() => setLightboxMedia({ url: msg.mediaUrl!, fileName: msg.fileName })}
                              className="w-full h-auto max-h-60 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                            />
                          </div>
                        ) : isFileVideo && msg.mediaUrl ? (
                          /* Video File Player */
                          <div className="max-w-xs sm:max-w-sm">
                            <VideoEmbedPlayer
                              url={msg.mediaUrl}
                              title={msg.fileName}
                              onOpenFullscreen={(u) => setLightboxMedia({ url: u, fileName: msg.fileName })}
                            />
                          </div>
                        ) : msg.messageType === 'file' && msg.mediaUrl ? (
                          /* Regular Document File */
                          <div
                            className={`p-3 rounded-2xl border flex items-center gap-3 max-w-sm ${
                              msg.isMe
                                ? 'bg-[#2563eb] text-white border-blue-600 rounded-br-xs'
                                : 'bg-white text-gray-800 border-gray-200 rounded-bl-xs shadow-2xs'
                            }`}
                          >
                            <div className={`p-2.5 rounded-xl ${msg.isMe ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs truncate">{msg.fileName || 'Attached File'}</p>
                              <span className={`text-[10px] ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                {msg.fileSize || '70 MB max'}
                              </span>
                            </div>
                            <a
                              href={api.getMediaUrl(msg.mediaUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={msg.fileName || 'file'}
                              className={`p-2 rounded-lg transition-colors ${
                                msg.isMe ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-600'
                              }`}
                              title={t('messages.downloadFile')}
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        ) : (
                          /* Text Message with optional YouTube / Video Link Embed */
                          <div className="flex flex-col">
                            <div
                              className={`p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm whitespace-pre-wrap break-words ${
                                msg.isMe
                                  ? 'bg-[#2563eb] text-white rounded-br-xs'
                                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-xs shadow-2xs'
                              }`}
                            >
                              {msg.text}
                            </div>

                            {/* Embedded YouTube / Video Link if present in text */}
                            {firstYtOrVideoUrl && (
                              <div className="mt-1.5 max-w-xs sm:max-w-sm">
                                <VideoEmbedPlayer
                                  url={firstYtOrVideoUrl}
                                  onOpenFullscreen={(u) => setLightboxMedia({ url: u, fileName: 'Video Preview' })}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        <span className={`text-[10px] text-gray-400 block mt-0.5 px-1 ${msg.isMe ? 'text-right' : ''}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Hidden File Input (Max 70MB) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Sticker Picker Popover */}
            {showStickers && (
              <div
                ref={stickerPickerRef}
                className="mx-3 mb-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-30 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                  <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-amber-500" />
                    <span>{t('messages.stickers')}</span>
                  </h4>
                  <button
                    onClick={() => setShowStickers(false)}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-1">
                  {STICKER_LIST.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => handleSendSticker(sticker)}
                      className="text-2xl sm:text-3xl p-2 rounded-xl hover:bg-blue-50 hover:scale-125 transition-all cursor-pointer flex items-center justify-center"
                      title={sticker.name}
                    >
                      {sticker.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Voice Recording Bar or Standard Input */}
            {isRecording ? (
              <div className="p-2.5 sm:p-3 bg-red-50/80 border-t border-red-200 flex items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-semibold text-red-600">
                    {t('messages.recording')} ({Math.floor(recordingSeconds / 60)}:{recordingSeconds % 60 < 10 ? '0' : ''}{recordingSeconds % 60})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>{t('messages.cancelRecord')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopAndSendRecording}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('messages.sendVoice')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendText} className="p-2.5 sm:p-3 bg-white border-t border-gray-200 flex items-center gap-1.5 sm:gap-2 relative">
                {/* Upload File Button (Max 70MB) */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  title={t('messages.uploadFile')}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600" />
                  ) : (
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                {/* Stickers Button */}
                <button
                  type="button"
                  onClick={() => setShowStickers(!showStickers)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showStickers ? 'text-amber-500 bg-amber-50' : 'text-gray-500 hover:text-amber-500 hover:bg-gray-100'
                  }`}
                  title={t('messages.stickers')}
                >
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`${t('messages.typeMessage')} (${selectedUser.name})`}
                  className="flex-1 bg-gray-100 focus:bg-white text-xs sm:text-sm text-gray-800 placeholder-gray-400 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />

                {/* Voice Recording Button or Send Button */}
                {inputText.trim() ? (
                  <button
                    type="submit"
                    className="p-2 sm:p-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-2 sm:p-2.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full transition-colors cursor-pointer shrink-0"
                    title={t('messages.voiceRecord')}
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
              </form>
            )}
          </>
        ) : (
          /* Empty state when no friend is selected or no friends exist */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{t('messages.noFriendsSelected')}</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                {t('messages.noFriendsDesc')}
              </p>
            </div>
            <button
              onClick={() => onNavigate?.('friends')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('messages.findFriends')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Media Viewer Modal */}
      {lightboxMedia && (
        <MediaViewerModal
          mediaUrl={lightboxMedia.url}
          fileName={lightboxMedia.fileName}
          onClose={() => setLightboxMedia(null)}
        />
      )}
    </div>
  );
};
