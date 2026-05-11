import api from './api';
import {
  Rental,
  RentalRequest,
  ApiResponse,
  ConditionCheckRequest,
  RentalPhotoUploadResponse,
  RentalReturnWorkflow,
  ReviewReturnDecisionRequest,
} from '../types';

export const rentalService = {
  createRental: async (rental: RentalRequest): Promise<Rental> => {
    const response = await api.post<Rental>('/rentals', rental);
    return response.data;
  },

  getMyRentals: async (): Promise<Rental[]> => {
    const response = await api.get<Rental[]>('/rentals/my');
    return response.data;
  },

  getAllRentals: async (): Promise<Rental[]> => {
    const response = await api.get<Rental[]>('/rentals');
    return response.data;
  },

  getRentalById: async (id: number): Promise<Rental> => {
    const response = await api.get<Rental>(`/rentals/${id}`);
    return response.data;
  },

  updateRentalStatus: async (id: number, status: string): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/rentals/${id}/status?newStatus=${status}`);
    return response.data;
  },

  deleteRental: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/rentals/${id}`);
    return response.data;
  },

  checkItemCondition: async (id: number, request: ConditionCheckRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/rentals/${id}/check-condition`, request);
    return response.data;
  },

  generateAwb: async (id: number): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/rentals/${id}/generate-awb`);
    return response.data;
  },

  uploadBaselinePhoto: async (id: number, file: File): Promise<RentalPhotoUploadResponse> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post<RentalPhotoUploadResponse>(`/rentals/${id}/baseline-photos`, form);
    return response.data;
  },

  uploadReturnPhoto: async (id: number, file: File): Promise<RentalPhotoUploadResponse> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post<RentalPhotoUploadResponse>(`/rentals/${id}/return-photos`, form);
    return response.data;
  },

  getReturnWorkflow: async (id: number): Promise<RentalReturnWorkflow> => {
    const response = await api.get<RentalReturnWorkflow>(`/rentals/${id}/return-workflow`);
    return response.data;
  },

  submitReturnRequest: async (id: number): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/rentals/${id}/submit-return-request`);
    return response.data;
  },

  runAiComparison: async (id: number): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/rentals/${id}/run-ai-comparison`);
    return response.data;
  },

  runHandoverVerification: async (id: number, stage: 'BASELINE' | 'RETURN'): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/rentals/${id}/run-handover-verification?stage=${stage}`);
    return response.data;
  },

  reviewReturnDecision: async (id: number, request: ReviewReturnDecisionRequest): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/rentals/${id}/review-return`, request);
    return response.data;
  },
};
