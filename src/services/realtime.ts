import { api } from './api';

export type RealtimeMessage = { type: string; [key: string]: any };
type Handler = (message: RealtimeMessage) => void;

/**
 * One persistent WebSocket per logged-in session, connected app-wide (not tied to
 * any single view). It carries both live chat delivery and WebRTC call signaling,
 * so incoming messages and calls work regardless of which screen is open.
 */
class RealtimeService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private listeners = new Set<Handler>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private manuallyClosed = false;
  private onlineUsers = new Set<string>();

  connect(userId: string) {
    if (this.ws && this.userId === userId && this.ws.readyState <= WebSocket.OPEN) {
      return;
    }
    this.disconnect();
    this.manuallyClosed = false;
    this.userId = userId;
    this.open();
  }

  isUserOnline(targetUserId: string): boolean {
    return this.onlineUsers.has(targetUserId);
  }

  getOnlineUserIds(): string[] {
    return Array.from(this.onlineUsers);
  }

  private open() {
    if (!this.userId) return;
    try {
      const ws = new WebSocket(api.getChatWebSocketUrl(this.userId));
      this.ws = ws;

      ws.onopen = () => {
        // Start heartbeat ping every 25s to keep presence active
        if (this.pingTimer) clearInterval(this.pingTimer);
        this.pingTimer = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          // Internal presence state updates
          if (payload.type === 'PRESENCE_SYNC' && Array.isArray(payload.onlineUserIds)) {
            this.onlineUsers = new Set(payload.onlineUserIds);
          } else if (payload.type === 'USER_PRESENCE' && payload.userId) {
            if (payload.isOnline) {
              this.onlineUsers.add(payload.userId);
            } else {
              this.onlineUsers.delete(payload.userId);
            }
          }

          this.listeners.forEach((handler) => handler(payload));
        } catch (e) {
          console.warn('Realtime message parse notice:', e);
        }
      };

      ws.onclose = () => {
        if (!this.manuallyClosed && this.userId) {
          this.reconnectTimer = setTimeout(() => this.open(), 2000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      console.warn('Realtime connect notice:', e);
    }
  }

  disconnect() {
    this.manuallyClosed = true;
    this.userId = null;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: RealtimeMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    console.warn('Realtime send skipped: socket not open', message.type);
    return false;
  }

  subscribe(handler: Handler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }
}

export const realtime = new RealtimeService();
