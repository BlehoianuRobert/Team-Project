import api from './api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  reply: string;
}

export const chatService = {
  sendMessage: async (message: string, history: ChatMessage[]): Promise<ChatResponse> => {
    const response = await api.post<ChatResponse>('/chat', { message, history });
    return response.data;
  },
};
