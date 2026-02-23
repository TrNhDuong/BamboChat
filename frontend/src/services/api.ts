import axios from 'axios';
import type { LoginResponse, RegisterResponse, Conversation, Message, User, Friendship } from '../types';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── Auth ────────────────────────────────────
export const authAPI = {
    register: (id: string, email: string, password: string) =>
        api.post<RegisterResponse>('/auth/register', { id, email, password }),

    verifyOTP: (email: string, otpCode: string) =>
        api.post<{ message: string }>('/auth/verify-otp', { email, otpCode }),

    login: (id: string, password: string) =>
        api.post<LoginResponse>('/auth/login', { id, password }),
};

// ─── Users ───────────────────────────────────
export const userAPI = {
    search: (id: string) =>
        api.get<User[]>('/users/search', { params: { id } }),

    updateProfile: (data: { displayName?: string; bio?: string }) =>
        api.put<User>('/users/profile', data),

    uploadAvatar: (formData: FormData) =>
        api.post<User>('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
};

// ─── Friends ─────────────────────────────────
export const friendAPI = {
    getFriends: () =>
        api.get<User[]>('/friends'),

    getPendingRequests: () =>
        api.get<Friendship[]>('/friends/requests/pending'),

    getSentRequests: () =>
        api.get<Friendship[]>('/friends/requests/sent'),

    sendRequest: (addresseeId: string) =>
        api.post('/friends/requests', { addresseeId }),

    respondToRequest: (requestId: string, action: 'accept' | 'reject') =>
        api.put(`/friends/requests/${requestId}`, { action }),

    unfriend: (friendId: string) =>
        api.delete(`/friends/${friendId}`),
};

// ─── Conversations ───────────────────────────
export const conversationAPI = {
    create: (type: string, participantIds: string[], name?: string) =>
        api.post<{ conversation: Conversation; isExisting: boolean }>('/conversations', {
            type,
            name,
            participantIds,
        }),

    getAll: () =>
        api.get<Conversation[]>('/conversations'),

    getMessages: (conversationId: string, cursor?: string, limit = 20) =>
        api.get<Message[]>(`/conversations/${conversationId}/messages`, {
            params: { cursor, limit },
        }),

    addParticipants: (conversationId: string, participantIds: string[]) =>
        api.post<{ success: boolean; addedCount: number }>(`/conversations/${conversationId}/participants`, {
            participantIds,
        }),
};

export default api;
