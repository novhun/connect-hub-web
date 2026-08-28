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
  private manuallyClosed = false;

  connect(userId: string) {
    if (this.ws && this.userId === userId && this.ws.readyState <= WebSocket.OPEN) {
      return;
    }
    this.disconnect();
    this.manuallyClosed = false;
    this.userId = userId;
    this.open();
  }

  private open() {
    if (!this.userId) return;
    try {
      const ws = new WebSocket(api.getChatWebSocketUrl(this.userId));
      this.ws = ws;

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
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
