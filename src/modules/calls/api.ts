import { api } from '../../services/api';
import { CallSession, SupportMessage } from './types';

export const callsApi = {
  initiateCall: (receiverId: string, callType: 'audio' | 'video'): Promise<CallSession> => {
    return api.initiateCall(receiverId, callType) as any;
  },
  updateStatus: (sessionId: string, status: string, durationSeconds?: number) => {
    return api.updateCallStatus(sessionId, status, durationSeconds);
  },
  getHistory: (): Promise<any[]> => {
    return api.getCallHistory();
  },
  getPeerId: (): Promise<string> => {
    return api.getPeerId();
  },
};

export const supportApi = {
  getMessages: (): Promise<SupportMessage[]> => {
    return api.getSupportMessages();
  },
  sendMessage: (text: string): Promise<{ userMessage: SupportMessage; assistantMessage: SupportMessage }> => {
    return api.sendSupportMessage(text);
  },
};
