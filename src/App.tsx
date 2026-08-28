import React, { useState, useEffect } from 'react';
import { Post, Story, Group, User, ReactionType, NotificationItem } from './types';
import {
  Header,
  LeftSidebar,
  RightSidebar,
  MobileBottomNav,
  FloatingSupportButton,
  StoriesSection,
  StoryViewerModal,
  CreateStoryModal,
  CreatePostBox,
  PostCard,
  CreatePostModal,
  EditPostModal,
  ShareModal,
  SavedPostsView,
  ExploreView,
  MessagesView,
  ChatFloatingWindow,
  CallsView,
  SupportCenterModal,
  RealCallModal,
  IncomingCallModal,
  LoginModal,
  RegisterModal,
  GroupsView,
  GroupDetailModal,
  EditGroupModal,
  GroupMembersModal,
  UserProfileModal,
  SettingsView,
  NotificationsPopover,
  NotificationsView,
  AboutView,
  EventsView,
  FriendsView,
} from './modules';
import { useLanguage } from './context/LanguageContext';
import { api } from './services/api';
import { friendsApi } from './modules/friends/api';
import { realtime, RealtimeMessage } from './services/realtime';
import { unlockAudio } from './services/ringtone';

const DEFAULT_USER: User = {
  id: '',
  name: 'Guest',
  email: '',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  role: 'Guest',
  bio: '',
  isOnline: false,
};

const LOGGED_OUT_KEY = 'connect_hub_logged_out';

interface ParsedRoute {
  tab: string;
  groupId?: string;
  profileUserId?: string;
  isAuthLogin?: boolean;
  isAuthRegister?: boolean;
}

function parseBrowserRoute(pathname: string): ParsedRoute {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean || clean === 'home' || clean === 'feed') {
    return { tab: 'home' };
  }
  if (clean.startsWith('explore')) return { tab: 'explore' };
  if (clean.startsWith('notifications') || clean.startsWith('notifs')) return { tab: 'notifications' };
  if (clean.startsWith('groups')) {
    const parts = clean.split('/');
    return { tab: 'groups', groupId: parts[1] };
  }
  if (clean.startsWith('friends')) return { tab: 'friends' };
  if (clean.startsWith('messages') || clean.startsWith('chat')) return { tab: 'messages' };
  if (clean.startsWith('calls')) return { tab: 'calls' };
  if (clean.startsWith('events')) return { tab: 'events' };
  if (clean.startsWith('saved') || clean.startsWith('bookmarks')) return { tab: 'saved' };
  if (clean.startsWith('settings')) return { tab: 'settings' };
  if (clean.startsWith('about') || clean.startsWith('tech')) return { tab: 'about' };
  if (clean.startsWith('profile')) {
    const parts = clean.split('/');
    return { tab: 'home', profileUserId: parts[1] };
  }
  if (clean === 'login') return { tab: 'home', isAuthLogin: true };
  if (clean === 'register' || clean === 'signup') return { tab: 'home', isAuthRegister: true };
  return { tab: 'home' };
}

function formatRoutePath(tab: string, param?: string | null): string {
  if (tab === 'home') return '/';
  if (tab === 'explore') return '/explore';
  if (tab === 'notifications') return '/notifications';
  if (tab === 'groups') return param ? `/groups/${param}` : '/groups';
  if (tab === 'friends') return '/friends';
  if (tab === 'messages') return param ? `/messages/${param}` : '/messages';
  if (tab === 'calls') return '/calls';
  if (tab === 'events') return '/events';
  if (tab === 'saved' || tab === 'bookmarks') return '/saved';
  if (tab === 'settings') return '/settings';
  if (tab === 'about') return '/about';
  if (tab === 'login') return '/login';
  if (tab === 'register') return '/register';
  if (tab === 'profile') return param ? `/profile/${param}` : '/';
  return `/${tab}`;
}

export default function App() {
  const { t, language } = useLanguage();
  const initialRoute = parseBrowserRoute(window.location.pathname);

  // App state & active route
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [activeTab, setActiveTabState] = useState<string>(initialRoute.tab);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApiConnected, setIsApiConnected] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auth & Real Call states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(Boolean(initialRoute.isAuthLogin));
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(Boolean(initialRoute.isAuthRegister));
  const [activeRealCall, setActiveRealCall] = useState<{
    targetUser: User;
    callType: 'audio' | 'video';
    roomId: string;
    role: 'caller' | 'callee';
    sessionId?: string;
  } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    fromUserId: string;
    fromUser: User;
    callType: 'audio' | 'video';
    roomId: string;
    sessionId?: string;
  } | null>(null);

  // Live Data states from FastAPI Backend
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [onlineMembers, setOnlineMembers] = useState<User[]>([]);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);

  // Modals state
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostInitialType, setCreatePostInitialType] = useState<'photo' | 'feeling' | 'location' | undefined>(undefined);
  const [supportModalMode, setSupportModalMode] = useState<'chat' | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(initialRoute.groupId || null);
  const selectedGroupDetail = selectedGroupId ? groups.find((g) => g.id === selectedGroupId) || null : null;
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(initialRoute.profileUserId || null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [viewingMembersGroup, setViewingMembersGroup] = useState<Group | null>(null);

  // Central Router Navigation Function
  const setActiveTab = (tab: string, param?: string | null, replace = false) => {
    setActiveTabState(tab);
    const newPath = formatRoutePath(tab, param);
    if (window.location.pathname !== newPath) {
      if (replace) {
        window.history.replaceState(null, '', newPath);
      } else {
        window.history.pushState(null, '', newPath);
      }
    }
  };

  // Synchronize Browser Back / Forward Button Navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = parseBrowserRoute(window.location.pathname);
      setActiveTabState(route.tab);
      if (route.groupId) setSelectedGroupId(route.groupId);
      if (route.profileUserId) setViewingProfileUserId(route.profileUserId);
      if (route.isAuthLogin) setIsLoginModalOpen(true);
      if (route.isAuthRegister) setIsRegisterModalOpen(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Browsers block audio playback until a real user gesture — unlock ringtone
  // audio on the first interaction so it's ready before any call ever rings.
  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['click', 'keydown', 'touchstart'];
    const handleFirstGesture = () => {
      unlockAudio();
      events.forEach((evt) => window.removeEventListener(evt, handleFirstGesture));
    };
    events.forEach((evt) => window.addEventListener(evt, handleFirstGesture, { once: true }));
    return () => events.forEach((evt) => window.removeEventListener(evt, handleFirstGesture));
  }, []);

  // Initialize API connection & fetch 100% Real Live Data
  useEffect(() => {
    const initAppWithApi = async () => {
      // Respect an explicit logout: don't silently re-authenticate as the demo account.
      if (!api.getToken() && localStorage.getItem(LOGGED_OUT_KEY) === 'true') {
        setIsLoading(false);
        setIsLoginModalOpen(true);
        return;
      }

      setIsLoading(true);
      try {
        let user = currentUser;
        try {
          if (!api.getToken()) {
            const loginRes = await api.login('sokun@connecthub.app', 'password123');
            user = loginRes.user;
          } else {
            user = await api.getMe();
          }
          setCurrentUser(user);
          setIsApiConnected(true);
          localStorage.removeItem(LOGGED_OUT_KEY);
          realtime.connect(user.id);
        } catch (authErr) {
          console.warn('Auto auth notice, authenticating demo account:', authErr);
          try {
            api.logout();
            const loginRes = await api.login('sokun@connecthub.app', 'password123');
            user = loginRes.user;
            setCurrentUser(user);
            setIsApiConnected(true);
            localStorage.removeItem(LOGGED_OUT_KEY);
            realtime.connect(user.id);
          } catch (_) { }
        }

        // Fetch Posts, Stories, Groups, Friends, Notifications, Friend Requests in parallel
        const [postsRes, storiesRes, groupsRes, friendsRes, notifsRes, friendReqRes] = await Promise.allSettled([
          api.getFeed(),
          api.getStories(),
          api.getGroups(),
          friendsApi.getFriends(),
          api.getNotifications(),
          friendsApi.getRequests('incoming'),
        ]);

        if (postsRes.status === 'fulfilled' && Array.isArray(postsRes.value)) {
          setPosts(postsRes.value);
          setIsApiConnected(true);
        }
        if (storiesRes.status === 'fulfilled' && Array.isArray(storiesRes.value)) {
          setStories(storiesRes.value);
        }
        if (groupsRes.status === 'fulfilled' && Array.isArray(groupsRes.value)) {
          setGroups(groupsRes.value);
        }
        if (friendsRes.status === 'fulfilled' && Array.isArray(friendsRes.value)) {
          setOnlineMembers(friendsRes.value);
        }
        if (notifsRes.status === 'fulfilled' && Array.isArray(notifsRes.value)) {
          setNotifications(notifsRes.value);
        }
        if (friendReqRes.status === 'fulfilled' && Array.isArray(friendReqRes.value)) {
          setFriendRequestsCount(friendReqRes.value.length);
        }
      } catch (err) {
        console.warn('API sync warning:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAppWithApi();
  }, []);

  // Auth Handlers
  const handleLogout = () => {
    api.logout();
    realtime.disconnect();
    localStorage.setItem(LOGGED_OUT_KEY, 'true');
    setCurrentUser(DEFAULT_USER);
    setPosts([]);
    setStories([]);
    setNotifications([]);
    setGroups([]);
    setOnlineMembers([]);
    setFriendRequestsCount(0);
    setIsApiConnected(false);
    setIsLoginModalOpen(true);
  };

  const handleAuthSuccess = async (user: User) => {
    localStorage.removeItem(LOGGED_OUT_KEY);
    setCurrentUser(user);
    setIsApiConnected(true);
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
    realtime.connect(user.id);
    try {
      const [fetchedPosts, fetchedStories, fetchedGroups, fetchedNotifs, fetchedFriends, fetchedFriendReqs] = await Promise.all([
        api.getFeed(),
        api.getStories(),
        api.getGroups(),
        api.getNotifications(),
        friendsApi.getFriends(),
        friendsApi.getRequests('incoming'),
      ]);
      if (fetchedPosts?.length) setPosts(fetchedPosts);
      if (fetchedStories?.length) setStories(fetchedStories);
      if (fetchedGroups?.length) setGroups(fetchedGroups);
      if (fetchedNotifs?.length) setNotifications(fetchedNotifs);
      if (fetchedFriends?.length) setOnlineMembers(fetchedFriends);
      setFriendRequestsCount(fetchedFriendReqs?.length || 0);
    } catch (_) { }
  };

  // Real Call Handlers — places a real call: sends a signaling invite over the
  // realtime channel so the other user's browser can actually ring, then opens
  // the caller's own call modal to start the WebRTC handshake once accepted.
  const handleStartRealCall = async (user: User, type: 'audio' | 'video') => {
    if (activeRealCall) return; // already in a call
    let roomId = `call-${currentUser.id}-${user.id}-${Date.now()}`;
    let sessionId: string | undefined;
    try {
      const session = await api.initiateCall(user.id, type);
      if (session?.roomId) roomId = session.roomId;
      sessionId = session?.id;
    } catch (e) {
      console.warn('Initiate call API notice:', e);
    }

    realtime.send({
      type: 'CALL_INVITE',
      targetUserId: user.id,
      callerId: currentUser.id,
      callerName: currentUser.name,
      callerAvatar: currentUser.avatar,
      callType: type,
      roomId,
      sessionId,
    });

    setActiveRealCall({ targetUser: user, callType: type, roomId, role: 'caller', sessionId });
  };

  const handleAcceptIncomingCall = () => {
    if (!incomingCall) return;
    realtime.send({ type: 'CALL_ACCEPT', targetUserId: incomingCall.fromUserId, roomId: incomingCall.roomId });
    setActiveRealCall({
      targetUser: incomingCall.fromUser,
      callType: incomingCall.callType,
      roomId: incomingCall.roomId,
      role: 'callee',
      sessionId: incomingCall.sessionId,
    });
    setIncomingCall(null);
  };

  const handleDeclineIncomingCall = () => {
    if (!incomingCall) return;
    realtime.send({ type: 'CALL_DECLINE', targetUserId: incomingCall.fromUserId, roomId: incomingCall.roomId });
    if (incomingCall.sessionId) {
      api.updateCallStatus(incomingCall.sessionId, 'declined').catch(() => { });
    }
    setIncomingCall(null);
  };

  // Listen for incoming call invites app-wide, regardless of which tab/modal is open.
  useEffect(() => {
    const unsubscribe = realtime.subscribe((msg: RealtimeMessage) => {
      if (msg.type === 'CALL_INVITE') {
        if (activeRealCall || incomingCall) {
          // Already busy — let the caller know instead of silently dropping it.
          realtime.send({ type: 'CALL_DECLINE', targetUserId: msg.callerId, roomId: msg.roomId });
          return;
        }
        setIncomingCall({
          fromUserId: msg.callerId,
          fromUser: { id: msg.callerId, name: msg.callerName, avatar: msg.callerAvatar, isOnline: true },
          callType: msg.callType,
          roomId: msg.roomId,
          sessionId: msg.sessionId,
        });
      } else if (msg.type === 'CALL_END') {
        // Caller hung up/cancelled while we were still looking at the ringing prompt.
        setIncomingCall((prev) => (prev && prev.roomId === msg.roomId ? null : prev));
      }
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRealCall, incomingCall]);

  // Filtered posts based on search
  const filteredPosts = searchQuery.trim()
    ? posts.filter(
      (p) =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.taggedGroup && p.taggedGroup.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : posts;

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  // Post Actions
  const handleReactPost = async (postId: string, reaction: ReactionType | null) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const oldReaction = post.userReaction;
        const newCounts = { ...post.reactionCounts };

        if (oldReaction) {
          newCounts[oldReaction] = Math.max(0, newCounts[oldReaction] - 1);
        }
        if (reaction) {
          newCounts[reaction] = (newCounts[reaction] || 0) + 1;
        }

        return {
          ...post,
          userReaction: reaction,
          reactionCounts: newCounts,
        };
      })
    );

    // Call API
    try {
      const updatedPost = await api.reactPost(postId, reaction);
      if (updatedPost) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (e) {
      console.warn('React post API notice:', e);
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    // Optimistic UI update
    const tempComment = {
      id: `comm-${Date.now()}`,
      user: currentUser,
      content: commentText,
      timestamp: 'Just now',
      likes: 0,
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [...post.comments, tempComment],
        };
      })
    );

    // Call API
    try {
      const updatedPost = await api.addComment(postId, commentText);
      if (updatedPost) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (e) {
      console.warn('Add comment API notice:', e);
    }
  };

  const handleSaveToggle = async (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return { ...post, isSaved: !post.isSaved };
      })
    );

    try {
      await api.toggleSavePost(postId);
    } catch (e) {
      console.warn('Save toggle API notice:', e);
    }
  };

  const handleDeletePost = async (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await api.deletePost(postId);
    } catch (e) {
      console.warn('Delete post API notice:', e);
    }
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
    setEditingPost(null);
  };

  const handleAddPost = async (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);

    try {
      const serverPost = await api.createPost({
        content: newPost.content,
        privacy: newPost.privacy,
        images: newPost.images,
        feeling: newPost.feeling,
        location: newPost.location,
        taggedGroup: newPost.taggedGroup,
      });
      if (serverPost) {
        setPosts((prev) => [serverPost, ...prev.filter((p) => p.id !== newPost.id)]);
      }
    } catch (e) {
      console.warn('Create post API notice:', e);
    }
  };

  const handleAddStory = async (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);

    try {
      const serverStory = await api.createStory({
        storyImage: newStory.storyImage,
        caption: newStory.caption,
      });
      if (serverStory) {
        setStories((prev) => [serverStory, ...prev.filter((s) => s.id !== newStory.id)]);
      }
    } catch (e) {
      console.warn('Create story API notice:', e);
    }
  };

  const handleShareToFeed = async (postToShare: Post, caption: string) => {
    const sharedPost: Post = {
      id: `post-shared-${Date.now()}`,
      author: currentUser,
      timestamp: 'Just now',
      privacy: 'public',
      content: caption ? `${caption}\n\n[Shared from ${postToShare.author.name}]:\n${postToShare.content}` : `[Shared from ${postToShare.author.name}]:\n${postToShare.content}`,
      images: postToShare.images,
      reactionCounts: { like: 0, love: 0, care: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
      userReaction: null,
      comments: [],
      sharesCount: 0,
    };
    setPosts((prev) => [sharedPost, ...prev]);
    setPosts((prev) =>
      prev.map((p) => (p.id === postToShare.id ? { ...p, sharesCount: p.sharesCount + 1 } : p))
    );

    try {
      await api.createPost({
        content: sharedPost.content,
        privacy: 'public',
        images: sharedPost.images,
      });
      await api.sharePost(postToShare.id);
    } catch (e) {
      console.warn('Share post API notice:', e);
    }
  };

  const handleToggleJoinGroup = async (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    const willJoin = !group?.joined;

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, joined: willJoin } : g))
    );

    try {
      const updated = willJoin ? await api.joinGroup(groupId) : await api.leaveGroup(groupId);
      if (updated) {
        setGroups((prev) => prev.map((g) => (g.id === groupId ? updated : g)));
      }
    } catch (e) {
      console.warn('Toggle group join API notice:', e);
    }
  };

  const handleGroupCreated = (newGroup: Group) => {
    setGroups((prev) => [newGroup, ...prev]);
  };

  const handleGroupUpdated = (updatedGroup: Group) => {
    setGroups((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
  };

  const handleGroupDeleted = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (selectedGroupId === groupId) {
      handleCloseGroup();
    }
  };

  const handleMarkAllNotifsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (e) {
      console.warn('Mark all notifs read API notice:', e);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    try {
      await api.markNotificationRead(notif.id);
    } catch (e) {
      console.warn('Mark notif read API notice:', e);
    }

    if (notif.type === 'call') {
      handleStartRealCall(notif.user, 'audio');
    } else {
      setActiveTab('home');
    }
    setIsNotificationsOpen(false);
  };

  // Route-synchronized Modal Handlers
  const handleOpenLogin = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    const path = formatRoutePath('login');
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  const handleCloseLogin = () => {
    setIsLoginModalOpen(false);
    const path = formatRoutePath(activeTab);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  const handleOpenRegister = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    const path = formatRoutePath('register');
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  const handleCloseRegister = () => {
    setIsRegisterModalOpen(false);
    const path = formatRoutePath(activeTab);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  const handleOpenProfile = (userId: string) => {
    setViewingProfileUserId(userId);
    const path = formatRoutePath('profile', userId);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  const handleCloseProfile = () => {
    setViewingProfileUserId(null);
    const path = formatRoutePath(activeTab);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    const path = formatRoutePath('groups', groupId);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  const handleCloseGroup = () => {
    setSelectedGroupId(null);
    const path = formatRoutePath(activeTab);
    if (window.location.pathname !== path) window.history.pushState(null, '', path);
  };

  return (
    <div className={`text-gray-800 h-screen flex flex-col overflow-hidden bg-[#f0f2f5] ${language === 'km' ? 'font-khmer' : ''}`}>
      {/* BEGIN: Top Navigation Bar */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onOpenMessages={() => setActiveTab('messages')}
        onOpenSupport={() => setSupportModalMode('chat')}
        onOpenProfile={() => handleOpenProfile(currentUser.id)}
        onViewProfile={(id) => handleOpenProfile(id)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onLogout={handleLogout}
        onOpenLogin={handleOpenLogin}
      />

      {/* BEGIN: Main Layout Wrapper */}
      <div className="flex flex-1 overflow-hidden">
        {/* BEGIN: Left Sidebar */}
        <LeftSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCreatePost={() => {
            setCreatePostInitialType(undefined);
            setIsCreatePostOpen(true);
          }}
          unreadNotifsCount={unreadNotifsCount}
          friendRequestsCount={friendRequestsCount}
          groups={groups}
          onSelectGroup={(g) => handleSelectGroup(g.id)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* BEGIN: Main Center Feed / View Container */}
        <main
          id="main-feed"
          className="flex-1 overflow-y-auto bg-[#f0f2f5] p-3 sm:p-6 pb-20 md:pb-6"
        >
          {/* Render based on active navigation tab */}
          {activeTab === 'home' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Welcome & Community Hero Callout */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-700/60 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1.5 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-300 text-[10px] font-bold border border-blue-400/30">
                      {language === 'km' ? 'បណ្តាញសង្គមជំនាន់ថ្មី' : 'CONNECT HUB SOCIAL'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {language === 'km' ? 'ស្ថានភាព: ដំណើរការ' : 'Status: Online'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {language === 'km' ? 'សូមស្វាគមន៍មកកាន់ មជ្ឈមណ្ឌលតភ្ជាប់' : 'Welcome to Connect Hub'}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    {language === 'km'
                      ? 'ភ្ជាប់ទំនាក់ទំនងជាមួយមិត្តភក្តិ ចែករំលែកការបង្ហោះ និងការហៅជាសំឡេង/វីដេអូ HD ដោយសុវត្ថិភាពខ្ពស់។'
                      : 'Connect with friends, share memorable moments, and experience real-time HD audio & video calling.'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('about')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0 cursor-pointer transition-colors relative z-10"
                >
                  {language === 'km' ? 'ស្វែងយល់បន្ថែម' : 'Learn More'}
                </button>
              </div>

              {/* 1. Stories Carousel */}
              <StoriesSection
                currentUser={currentUser}
                stories={stories}
                onOpenCreateStory={() => setIsCreateStoryOpen(true)}
                onViewStory={(s, idx) => setActiveStoryIndex(idx)}
              />

              {/* 2. Create Post Composer */}
              <CreatePostBox
                currentUser={currentUser}
                onOpenCreatePost={(type) => {
                  setCreatePostInitialType(type);
                  setIsCreatePostOpen(true);
                }}
              />

              {/* 3. Post Feed Stream */}
              <div className="space-y-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((n) => (
                      <div key={n} className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100/70 animate-pulse space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200" />
                          <div className="space-y-2 flex-1">
                            <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                            <div className="h-2.5 bg-gray-100 rounded w-1/4" />
                          </div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-48 bg-gray-100 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 space-y-3">
                    <p className="text-gray-500 text-sm">
                      {language === 'km' ? 'មិនទាន់មានការបង្ហោះនៅឡើយទេ។' : 'No posts in feed yet.'}
                    </p>
                    <button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                    >
                      {language === 'km' ? 'បង្កើតការបង្ហោះដំបូង' : 'Create First Post'}
                    </button>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onReact={handleReactPost}
                      onAddComment={handleAddComment}
                      onShare={(p) => setSharingPost(p)}
                      onSaveToggle={handleSaveToggle}
                      onEditPost={(p) => setEditingPost(p)}
                      onDeletePost={handleDeletePost}
                      onViewProfile={(id) => handleOpenProfile(id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'explore' && (
            <ExploreView
              posts={posts}
              groups={groups}
              onSelectGroup={(g) => handleSelectGroup(g.id)}
              onReact={handleReactPost}
              onAddComment={handleAddComment}
              currentUser={currentUser}
              onViewProfile={(id) => handleOpenProfile(id)}
            />
          )}

          {activeTab === 'groups' && (
            <GroupsView
              groups={groups}
              currentUser={currentUser}
              onSelectGroup={(g) => handleSelectGroup(g.id)}
              onToggleJoinGroup={handleToggleJoinGroup}
              onViewProfile={(id) => handleOpenProfile(id)}
              onStartChat={(user) => setActiveChatUser(user)}
              onGroupCreated={handleGroupCreated}
              onGroupUpdated={handleGroupUpdated}
              onGroupDeleted={handleGroupDeleted}
            />
          )}

          {activeTab === 'friends' && (
            <FriendsView onViewProfile={(id) => handleOpenProfile(id)} />
          )}

          {activeTab === 'messages' && (
            <MessagesView
              onlineMembers={onlineMembers}
              currentUser={currentUser}
              onStartCall={handleStartRealCall}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'calls' && (
            <CallsView
              onlineMembers={onlineMembers}
              onStartCall={handleStartRealCall}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'bookmarks' && (
            <SavedPostsView
              posts={posts}
              currentUser={currentUser}
              onReact={handleReactPost}
              onAddComment={handleAddComment}
              onShare={(p) => setSharingPost(p)}
              onSaveToggle={handleSaveToggle}
              onEditPost={(p) => setEditingPost(p)}
              onDeletePost={handleDeletePost}
              onViewProfile={(id) => handleOpenProfile(id)}
            />
          )}

          {activeTab === 'saved' && (
            <SavedPostsView
              posts={posts}
              currentUser={currentUser}
              onReact={handleReactPost}
              onAddComment={handleAddComment}
              onShare={(p) => setSharingPost(p)}
              onSaveToggle={handleSaveToggle}
              onEditPost={(p) => setEditingPost(p)}
              onDeletePost={handleDeletePost}
              onViewProfile={(id) => handleOpenProfile(id)}
            />
          )}

          {activeTab === 'events' && (
            <EventsView
              currentUser={currentUser}
              onViewProfile={(id) => handleOpenProfile(id)}
              onStartChat={(user) => setActiveChatUser(user)}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              currentUser={currentUser}
              onViewProfile={(id) => handleOpenProfile(id)}
              onStartCall={handleStartRealCall}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onUpdateProfile={(patch) => setCurrentUser((prev) => ({ ...prev, ...patch }))}
            />
          )}

          {activeTab === 'about' && (
            <AboutView
              currentUser={currentUser}
              onStartDemoCall={(type) => handleStartRealCall(onlineMembers[0] || currentUser, type)}
            />
          )}
        </main>

        {/* BEGIN: Right Sidebar */}
        <RightSidebar
          managedGroups={groups.filter((g) => g.isManaged)}
          onlineMembers={onlineMembers}
          onOpenChat={(user) => setActiveChatUser(user)}
          onStartCall={handleStartRealCall}
          onViewProfile={(id) => handleOpenProfile(id)}
          onOpenSupport={(mode) => {
            if (mode === 'chat') setSupportModalMode('chat');
            else handleStartRealCall(onlineMembers[0] || currentUser, mode);
          }}
          onSelectGroup={(g) => handleSelectGroup(g.id)}
          onSeeAllGroups={() => setActiveTab('groups')}
        />
      </div>

      {/* MODALS */}
      {/* 1. Real WebRTC & PeerJS Call Room Modal */}
      {activeRealCall && (
        <RealCallModal
          targetUser={activeRealCall.targetUser}
          callType={activeRealCall.callType}
          roomId={activeRealCall.roomId}
          role={activeRealCall.role}
          sessionId={activeRealCall.sessionId}
          onClose={() => setActiveRealCall(null)}
        />
      )}

      {/* 1b. Incoming Call Alert — shown to the callee so they can accept/decline */}
      {incomingCall && !activeRealCall && (
        <IncomingCallModal
          fromUser={incomingCall.fromUser}
          callType={incomingCall.callType}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}

      {/* 2. Real Auth Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={handleCloseLogin}
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={handleOpenRegister}
        />
      )}

      {/* 3. Real Auth Register Modal */}
      {isRegisterModalOpen && (
        <RegisterModal
          onClose={handleCloseRegister}
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={handleOpenLogin}
        />
      )}

      {/* 4. Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={activeStoryIndex}
          currentUser={currentUser}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}

      {/* 5. Create Story Modal */}
      {isCreateStoryOpen && (
        <CreateStoryModal
          currentUser={currentUser}
          onClose={() => setIsCreateStoryOpen(false)}
          onAddStory={handleAddStory}
        />
      )}

      {/* 6. Create Post Modal */}
      {isCreatePostOpen && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setIsCreatePostOpen(false)}
          onAddPost={handleAddPost}
          initialType={createPostInitialType}
          groups={groups}
        />
      )}

      {/* 6b. Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          currentUser={currentUser}
          onClose={() => setEditingPost(null)}
          onUpdatePost={handleUpdatePost}
        />
      )}

      {/* 7. Support Center & Real-Time AI Specialist Modal */}
      {supportModalMode && (
        <SupportCenterModal
          mode={supportModalMode}
          onClose={() => setSupportModalMode(null)}
        />
      )}

      {/* 8. Floating Direct Chat Window */}
      {activeChatUser && (
        <ChatFloatingWindow
          targetUser={activeChatUser}
          currentUser={currentUser}
          onClose={() => setActiveChatUser(null)}
          onStartCall={handleStartRealCall}
        />
      )}

      {/* 9. Post Share Modal */}
      {sharingPost && (
        <ShareModal
          post={sharingPost}
          onClose={() => setSharingPost(null)}
          onShare={handleShareToFeed}
        />
      )}

      {/* 10. Group Detail Modal */}
      {selectedGroupDetail && (
        <GroupDetailModal
          group={selectedGroupDetail}
          onClose={handleCloseGroup}
          onToggleJoin={handleToggleJoinGroup}
          groupPosts={posts.filter((p) => p.taggedGroup === selectedGroupDetail.name)}
          currentUser={currentUser}
          onReact={handleReactPost}
          onAddComment={handleAddComment}
          onShare={(p) => setSharingPost(p)}
          onSaveToggle={handleSaveToggle}
          onEditPost={(p) => setEditingPost(p)}
          onDeletePost={handleDeletePost}
          onViewProfile={(id) => handleOpenProfile(id)}
          onEditGroup={(g) => setEditingGroup(g)}
          onDeleteGroup={(g) => handleGroupDeleted(g.id)}
          onViewMembers={(g) => setViewingMembersGroup(g)}
        />
      )}

      {/* 10b. Edit Group Modal */}
      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onGroupUpdated={handleGroupUpdated}
        />
      )}

      {/* 10c. Group Members Modal */}
      {viewingMembersGroup && (
        <GroupMembersModal
          group={viewingMembersGroup}
          currentUser={currentUser}
          onClose={() => setViewingMembersGroup(null)}
          onSelectUser={(u) => handleOpenProfile(u.id)}
          onStartChat={(user) => setActiveChatUser(user)}
        />
      )}

      {/* 11. Notifications Popover */}
      {isNotificationsOpen && (
        <NotificationsPopover
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          onNotificationClick={handleNotificationClick}
        />
      )}

      {/* 12. User Profile Modal */}
      {viewingProfileUserId && (
        <UserProfileModal
          userId={viewingProfileUserId}
          currentUser={currentUser}
          onClose={handleCloseProfile}
          onUpdateProfile={(patch) => setCurrentUser((prev) => ({ ...prev, ...patch }))}
          onOpenChat={(user) => {
            handleCloseProfile();
            setActiveChatUser(user);
          }}
          onStartCall={(user, type) => {
            handleCloseProfile();
            handleStartRealCall(user, type);
          }}
        />
      )}

      {/* 13. Mobile Floating Support Help Button (Visible on screens < xl) */}
      <FloatingSupportButton
        onOpenSupport={(mode) => {
          if (mode === 'chat') setSupportModalMode('chat');
          else handleStartRealCall(onlineMembers[0] || currentUser, mode);
        }}
      />

      {/* 14. Mobile Bottom Navigation Bar (Visible on screens < 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreatePost={() => {
          setCreatePostInitialType(undefined);
          setIsCreatePostOpen(true);
        }}
        unreadNotifsCount={unreadNotifsCount}
      />
    </div>
  );
}
