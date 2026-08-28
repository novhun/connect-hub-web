import React, { useState } from 'react';
import { 
  CURRENT_USER, 
  ONLINE_MEMBERS, 
  INITIAL_STORIES, 
  GROUPS_DATA, 
  INITIAL_POSTS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';
import { Post, Story, Group, User, ReactionType, NotificationItem } from './types';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { StoriesSection } from './components/StoriesSection';
import { CreatePostBox } from './components/CreatePostBox';
import { PostCard } from './components/PostCard';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CreateStoryModal } from './components/CreateStoryModal';
import { CreatePostModal } from './components/CreatePostModal';
import { SupportCenterModal } from './components/SupportCenterModal';
import { ChatFloatingWindow } from './components/ChatFloatingWindow';
import { ShareModal } from './components/ShareModal';
import { GroupDetailModal } from './components/GroupDetailModal';
import { NotificationsPopover } from './components/NotificationsPopover';
import { UserProfileModal } from './components/UserProfileModal';
import { useLanguage } from './context/LanguageContext';

// Views
import { ExploreView } from './components/views/ExploreView';
import { MessagesView } from './components/views/MessagesView';
import { CallsView } from './components/views/CallsView';
import { SavedPostsView } from './components/views/SavedPostsView';
import { EventsView } from './components/views/EventsView';
import { SettingsView } from './components/views/SettingsView';
import { GroupsView } from './components/views/GroupsView';

export default function App() {
  const { t, language } = useLanguage();

  // App state
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Data states
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [groups, setGroups] = useState<Group[]>(GROUPS_DATA);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [onlineMembers, setOnlineMembers] = useState<User[]>(ONLINE_MEMBERS);

  // Modals state
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isCreateStoryOpen, setIsCreateStoryOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [createPostInitialType, setCreatePostInitialType] = useState<'photo' | 'feeling' | 'location' | undefined>(undefined);
  const [supportModalMode, setSupportModalMode] = useState<'audio' | 'video' | 'chat' | null>(null);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const [selectedGroupDetail, setSelectedGroupDetail] = useState<Group | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
  const handleReactPost = (postId: string, reaction: ReactionType | null) => {
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
  };

  const handleAddComment = (postId: string, commentText: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `comm-${Date.now()}`,
              user: currentUser,
              content: commentText,
              timestamp: 'Just now',
              likes: 0,
            },
          ],
        };
      })
    );
  };

  const handleSaveToggle = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return { ...post, isSaved: !post.isSaved };
      })
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleAddPost = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleAddStory = (newStory: Story) => {
    setStories((prev) => [newStory, ...prev]);
  };

  const handleShareToFeed = (postToShare: Post, caption: string) => {
    const sharedPost: Post = {
      id: `post-shared-${Date.now()}`,
      author: currentUser,
      timestamp: 'Just now',
      privacy: 'public',
      content: caption ? `${caption}\n\n[Shared from ${postToShare.author.name}]:\n${postToShare.content}` : `[Shared from ${postToShare.author.name}]:\n${postToShare.content}`,
      images: postToShare.images,
      reactionCounts: { like: 1, love: 0, care: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
      userReaction: 'like',
      comments: [],
      sharesCount: 0,
    };
    setPosts((prev) => [sharedPost, ...prev]);
    // increment original post share count
    setPosts((prev) =>
      prev.map((p) => (p.id === postToShare.id ? { ...p, sharesCount: p.sharesCount + 1 } : p))
    );
  };

  const handleToggleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, joined: !g.joined } : g))
    );
  };

  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    if (notif.type === 'call') {
      setSupportModalMode('audio');
    } else {
      setActiveTab('home');
    }
    setIsNotificationsOpen(false);
  };

  return (
    <div className="text-gray-800 h-screen flex flex-col overflow-hidden font-['Inter',sans-serif] bg-[#f0f2f5]">
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
        onOpenProfile={() => setIsProfileOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
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
          groups={groups}
          onSelectGroup={(g) => setSelectedGroupDetail(g)}
        />

        {/* BEGIN: Main Center Feed / View Container */}
        <main
          id="main-feed"
          className="flex-1 overflow-y-auto bg-[#f0f2f5] p-4 sm:p-6"
        >
          {/* Render based on active navigation tab */}
          {activeTab === 'home' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Stories Carousel */}
              <StoriesSection
                currentUser={currentUser}
                stories={stories}
                onOpenCreateStory={() => setIsCreateStoryOpen(true)}
                onViewStory={(story, idx) => setActiveStoryIndex(idx)}
              />

              {/* Create Post Quick Box */}
              <CreatePostBox
                currentUser={currentUser}
                onOpenCreatePost={(type) => {
                  setCreatePostInitialType(type);
                  setIsCreatePostOpen(true);
                }}
              />

              {/* Posts Stream */}
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    onReact={handleReactPost}
                    onAddComment={handleAddComment}
                    onShare={(p) => setSharingPost(p)}
                    onSaveToggle={handleSaveToggle}
                    onDeletePost={handleDeletePost}
                  />
                ))}

                {filteredPosts.length === 0 && (
                  <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-100 shadow-sm">
                    <p className="font-semibold text-gray-700">
                      {language === 'km' 
                        ? `មិនមានការបង្ហោះដែលត្រូវនឹង "${searchQuery}" ទេ` 
                        : `No posts found matching "${searchQuery}"`}
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-sm text-blue-600 font-medium hover:underline cursor-pointer"
                    >
                      {language === 'km' ? 'សម្អាតការស្វែងរក' : 'Clear search filter'}
                    </button>
                  </div>
                )}

                {/* Bottom Spacer for smooth scrolling */}
                <div className="h-10" />
              </div>
            </div>
          )}

          {activeTab === 'explore' && (
            <ExploreView
              posts={posts}
              currentUser={currentUser}
              onPostClick={() => {}}
            />
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">
                  {language === 'km' ? 'ការជូនដំណឹង' : 'Notifications'}
                </h1>
                <button
                  onClick={handleMarkAllNotifsRead}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  {language === 'km' ? 'សម្គាល់ថាបានអានទាំងអស់' : 'Mark all as read'}
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100 overflow-hidden">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !n.isRead ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <img
                      src={n.user.avatar}
                      alt={n.user.name}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200"
                    />
                    <div className="flex-1 text-sm">
                      <p className="text-gray-800">
                        <span className="font-bold text-gray-900">{n.user.name}</span> {n.content}
                      </p>
                      <span className="text-xs text-gray-400 mt-0.5 block">{n.timestamp}</span>
                    </div>
                    {!n.isRead && (
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <MessagesView
              onlineMembers={onlineMembers}
              currentUser={currentUser}
              onStartCall={(user, type) => setSupportModalMode(type)}
            />
          )}

          {activeTab === 'calls' && (
            <CallsView
              onlineMembers={onlineMembers}
              onStartCall={(user, type) => setSupportModalMode(type)}
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
            />
          )}

          {activeTab === 'events' && <EventsView />}

          {activeTab === 'groups' && (
            <GroupsView
              groups={groups}
              currentUser={currentUser}
              onSelectGroup={(g) => setSelectedGroupDetail(g)}
              onToggleJoinGroup={handleToggleJoinGroup}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView currentUser={currentUser} />
          )}
        </main>

        {/* BEGIN: Right Sidebar */}
        <RightSidebar
          managedGroups={groups.filter((g) => g.isManaged)}
          onlineMembers={onlineMembers}
          onStartAudioCall={() => setSupportModalMode('audio')}
          onStartVideoCall={() => setSupportModalMode('video')}
          onStartLiveChat={() => setSupportModalMode('chat')}
          onSelectGroup={(g) => setSelectedGroupDetail(g)}
          onOpenDirectChat={(member) => setActiveChatUser(member)}
          onSeeAllGroups={() => setActiveTab('groups')}
        />
      </div>

      {/* Story Viewer Modal */}
      {activeStoryIndex !== null && (
        <StoryViewerModal
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
          currentUser={currentUser}
        />
      )}

      {/* Create Story Modal */}
      {isCreateStoryOpen && (
        <CreateStoryModal
          currentUser={currentUser}
          onClose={() => setIsCreateStoryOpen(false)}
          onAddStory={handleAddStory}
        />
      )}

      {/* Create Post Modal */}
      {isCreatePostOpen && (
        <CreatePostModal
          currentUser={currentUser}
          onClose={() => setIsCreatePostOpen(false)}
          onAddPost={handleAddPost}
          initialType={createPostInitialType}
          groups={groups}
        />
      )}

      {/* Support Center Calls & Live Chat Modal */}
      {supportModalMode && (
        <SupportCenterModal
          mode={supportModalMode}
          onClose={() => setSupportModalMode(null)}
        />
      )}

      {/* Floating Chat Bubble for Online Members */}
      {activeChatUser && (
        <ChatFloatingWindow
          recipient={activeChatUser}
          onClose={() => setActiveChatUser(null)}
          onStartCall={(type) => setSupportModalMode(type)}
        />
      )}

      {/* Share Post Modal */}
      {sharingPost && (
        <ShareModal
          post={sharingPost}
          currentUser={currentUser}
          onClose={() => setSharingPost(null)}
          onShareToFeed={handleShareToFeed}
        />
      )}

      {/* Group Detail Modal */}
      {selectedGroupDetail && (
        <GroupDetailModal
          group={selectedGroupDetail}
          currentUser={currentUser}
          onClose={() => setSelectedGroupDetail(null)}
          onOpenCreatePost={() => {
            setSelectedGroupDetail(null);
            setIsCreatePostOpen(true);
          }}
        />
      )}

      {/* Notifications Popover */}
      {isNotificationsOpen && (
        <NotificationsPopover
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllRead={handleMarkAllNotifsRead}
          onNotificationClick={handleNotificationClick}
        />
      )}

      {/* User Profile Modal */}
      {isProfileOpen && (
        <UserProfileModal
          user={currentUser}
          currentUserPosts={posts.filter((p) => p.author.id === currentUser.id)}
          onClose={() => setIsProfileOpen(false)}
          onUpdateBio={(newBio) => {
            setCurrentUser((prev) => ({ ...prev, role: 'Product Designer' }));
          }}
        />
      )}
    </div>
  );
}
