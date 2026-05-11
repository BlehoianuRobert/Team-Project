import api from './api';
import { ApiResponse, ProfilePatchPayload, UserProfile } from '../types';

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>('/me/profile');
    return data;
  },

  patchProfile: async (payload: ProfilePatchPayload): Promise<UserProfile> => {
    const { data } = await api.patch<UserProfile>('/me/profile', payload);
    return data;
  },

  deleteOwnAccount: async (): Promise<ApiResponse> => {
    const { data } = await api.delete<ApiResponse>('/me/profile');
    return data;
  },
};
