import { Post, Story, Group, User, ReactionType, NotificationItem, DirectMessage, EventItem, SupportMessage, UserSettings, FriendStatusInfo, FriendRequestItem } from '../types';

const API_BASE = (((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:8008').replace(/\/$/, '');
const API_URL = `${API_BASE}/api/v1`;

class ApiService {
  private token: string | null = localStorage.getItem('connect_hub_token');

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('connect_hub_token', token);
    } else {
      localStorage.removeItem('connect_hub_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public getMediaUrl(path: string | undefined): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.message || errorData.detail || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // --- AUTH ---
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async register(data: { name: string; email: string; password: string; role?: string; avatar?: string }): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async googleLogin(token: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- USERS ---
  async getUsers(params?: { onlyOnline?: boolean; query?: string }): Promise<User[]> {
    const query = new URLSearchParams();
    if (params?.onlyOnline !== undefined) query.set('only_online', String(params.onlyOnline));
    if (params?.query) query.set('query', params.query);
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request<User[]>(`/users${qStr}`);
  }

  async getUserProfile(userId: string): Promise<User> {
    return this.request<User>(`/users/profile/${userId}`);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updatePresence(isOnline: boolean): Promise<User> {
    return this.request<User>('/users/presence', {
      method: 'PATCH',
      body: JSON.stringify({ is_online: isOnline }),
    });
  }

  // --- POSTS ---
  async getFeed(params?: { group?: string; authorId?: string; savedOnly?: boolean }): Promise<Post[]> {
    const query = new URLSearchParams();
    if (params?.group) query.set('group', params.group);
    if (params?.authorId) query.set('author_id', params.authorId);
    if (params?.savedOnly) query.set('saved_only', 'true');
    const qStr = query.toString() ? `?${query.toString()}` : '';
    return this.request<Post[]>(`/posts${qStr}`);
  }

  async createPost(data: {
    content: string;
    privacy?: 'public' | 'friends' | 'only_me';
    images?: string[];
    feeling?: string;
    location?: string;
    taggedGroup?: string;
  }): Promise<Post> {
    return this.request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async reactPost(postId: string, reaction: ReactionType | null): Promise<Post> {
    return this.request<Post>(`/posts/${postId}/react`, {
      method: 'POST',
      body: JSON.stringify({ reaction }),
    });
  }

  async addComment(postId: string, content: string): Promise<Post> {
    return this.request<Post>(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async toggleCommentLike(commentId: string): Promise<{ isLiked: boolean }> {
    return this.request<{ isLiked: boolean }>(`/posts/comments/${commentId}/like`, {
      method: 'POST',
    });
  }

  async toggleSavePost(postId: string): Promise<{ isSaved: boolean }> {
    return this.request<{ isSaved: boolean }>(`/posts/${postId}/save`, {
      method: 'POST',
    });
  }

  async sharePost(postId: string): Promise<{ sharesCount: number }> {
    return this.request<{ sharesCount: number }>(`/posts/${postId}/share`, {
      method: 'POST',
    });
  }

  async deletePost(postId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  // --- STORIES ---
  async getStories(): Promise<Story[]> {
    return this.request<Story[]>('/stories');
  }

  async createStory(data: { storyImage: string; caption?: string }): Promise<Story> {
    return this.request<Story>('/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markStoryViewed(storyId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/stories/${storyId}/view`, {
      method: 'POST',
    });
  }

  async deleteStory(storyId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/stories/${storyId}`, {
      method: 'DELETE',
    });
  }

  // --- GROUPS ---
  async getGroups(): Promise<Group[]> {
    return this.request<Group[]>('/groups');
  }

  async getGroup(groupId: string): Promise<Group> {
    return this.request<Group>(`/groups/${groupId}`);
  }

  async createGroup(data: {
    name: string;
    icon: string;
    coverImage?: string;
    description: string;
    isPrivate?: boolean;
  }): Promise<Group> {
    return this.request<Group>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinGroup(groupId: string): Promise<Group> {
    return this.request<Group>(`/groups/${groupId}/join`, {
      method: 'POST',
    });
  }

  async leaveGroup(groupId: string): Promise<Group> {
    return this.request<Group>(`/groups/${groupId}/leave`, {
      method: 'POST',
    });
  }

  // --- CHAT ---
  async getMessages(userId: string): Promise<DirectMessage[]> {
    return this.request<DirectMessage[]>(`/chat/${userId}`);
  }

  async sendMessage(userId: string, text: string): Promise<DirectMessage> {
    return this.request<DirectMessage>(`/chat/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async markChatRead(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/chat/${userId}/read`, {
      method: 'POST',
    });
  }

  getChatWebSocketUrl(userId: string): string {
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = API_BASE.replace(/^https?:\/\//, '');
    const token = this.token ? `?token=${encodeURIComponent(this.token)}` : '';
    return `${wsProto}//${host}/api/v1/chat/ws/${userId}${token}`;
  }

  // --- CALLS & PEERJS ---
  async initiateCall(receiverId: string, callType: 'audio' | 'video'): Promise<{
    id: string;
    callerId: string;
    receiverId: string;
    roomId: string;
    callType: 'audio' | 'video';
    status: string;
    durationSeconds: number;
  }> {
    return this.request('/calls/initiate', {
      method: 'POST',
      body: JSON.stringify({ receiverId, callType }),
    });
  }

  async updateCallStatus(sessionId: string, status: string, durationSeconds?: number) {
    return this.request(`/calls/${sessionId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, durationSeconds }),
    });
  }

  async getCallHistory(): Promise<any[]> {
    return this.request('/calls/history');
  }

  logout() {
    this.setToken(null);
  }

  getPeerJsWebSocketUrl(peerId: string): string {
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = API_BASE.replace(/^https?:\/\//, '');
    return `${wsProto}//${host}/ws/peerjs/${peerId}`;
  }

  async getPeerId(): Promise<string> {
    const res = await fetch(`${API_BASE}/peerjs/id`);
    return res.text();
  }

  // --- NOTIFICATIONS ---
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
    });
  }

  // --- EVENTS ---
  async getEvents(): Promise<EventItem[]> {
    return this.request<EventItem[]>('/events');
  }

  async createEvent(data: {
    title: string;
    description?: string;
    location: string;
    category?: string;
    coverImage?: string;
    startAt: string;
  }): Promise<EventItem> {
    return this.request<EventItem>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async attendEvent(eventId: string): Promise<EventItem> {
    return this.request<EventItem>(`/events/${eventId}/attend`, {
      method: 'POST',
    });
  }

  async leaveEvent(eventId: string): Promise<EventItem> {
    return this.request<EventItem>(`/events/${eventId}/leave`, {
      method: 'POST',
    });
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // --- SUPPORT ---
  async getSupportMessages(): Promise<SupportMessage[]> {
    return this.request<SupportMessage[]>('/support/messages');
  }

  async sendSupportMessage(text: string): Promise<{ userMessage: SupportMessage; assistantMessage: SupportMessage }> {
    return this.request('/support/messages', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // --- SETTINGS ---
  async getSettings(): Promise<UserSettings> {
    return this.request<UserSettings>('/settings');
  }

  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    return this.request<UserSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- FRIENDS ---
  async getFriends(): Promise<User[]> {
    return this.request<User[]>('/friends');
  }

  async getFriendRequests(direction: 'incoming' | 'outgoing' = 'incoming'): Promise<FriendRequestItem[]> {
    return this.request<FriendRequestItem[]>(`/friends/requests?direction=${direction}`);
  }

  async getFriendSuggestions(): Promise<User[]> {
    return this.request<User[]>('/friends/suggestions');
  }

  async getFriendStatus(userId: string): Promise<FriendStatusInfo> {
    return this.request<FriendStatusInfo>(`/friends/status/${userId}`);
  }

  async sendFriendRequest(userId: string): Promise<FriendStatusInfo> {
    return this.request<FriendStatusInfo>(`/friends/request/${userId}`, { method: 'POST' });
  }

  async respondFriendRequest(requestId: string, accept: boolean): Promise<FriendStatusInfo> {
    return this.request<FriendStatusInfo>(`/friends/respond/${requestId}`, {
      method: 'POST',
      body: JSON.stringify({ accept }),
    });
  }

  async cancelFriendRequest(requestId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/friends/request/${requestId}`, { method: 'DELETE' });
  }

  async unfriend(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/friends/${userId}`, { method: 'DELETE' });
  }

  // --- MEDIA UPLOAD ---
  async uploadMedia(file: File): Promise<{ url: string; filename: string; size: number }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request<{ url: string; filename: string; size: number }>('/media/upload', {
      method: 'POST',
      body: formData,
    });
  }
}

export const api = new ApiService();
