export interface User {
    _id: string;
    email: string;
    displayName?: string;
    bio?: string;
    isVerified?: boolean;
    createdAt?: string;
    avatar?: { url: string; public_id: string };
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterResponse {
    message: string;
    userId: string;
}

export interface Conversation {
    _id: string;
    type: 'direct_message' | 'group';
    name: string | null;
    participants: { _id: string; displayName: string | null; avatar?: { url: string; public_id: string } | null }[];
    lastMessage?: {
        content: string;
        createdAt: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    content: string;
    reactions?: { userId: string; type: string }[];
    createdAt: string;
}

export interface Friendship {
    _id: string;
    requesterId: string;
    addresseeId: string;
    status: 'pending' | 'accepted' | 'blocked';
    createdAt: string;
}

export interface ApiError {
    message: string;
    errors?: string[];
}
