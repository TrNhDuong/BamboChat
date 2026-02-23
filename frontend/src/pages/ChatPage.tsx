import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { conversationAPI, friendAPI } from '../services/api';
import type { Conversation, User } from '../types';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import FriendPanel from '../components/FriendPanel';
import './ChatPage.css';

const ChatPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
    const [friends, setFriends] = useState<User[]>([]);

    const loadConversations = useCallback(async () => {
        try {
            const { data } = await conversationAPI.getAll();
            setConversations(data);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        }
    }, []);

    const loadFriends = useCallback(async () => {
        try {
            const { data } = await friendAPI.getFriends();
            setFriends(data);
        } catch (err) {
            console.error('Failed to load friends:', err);
        }
    }, []);

    useEffect(() => {
        loadConversations();
        loadFriends();
    }, [loadConversations, loadFriends]);

    // Reload friends when switching to chats tab (in case user accepted a request)
    useEffect(() => {
        if (activeTab === 'chats') {
            loadFriends();
        }
    }, [activeTab, loadFriends]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getConversationName = (id: string) => {
        const conv = conversations.find((c) => c._id === id);
        if (!conv) return 'Chat';
        if (conv.type === 'group' && conv.name) return conv.name;
        // For DMs, show the other participant's display name or ID
        if (conv.type === 'direct_message' && conv.participants && Array.isArray(conv.participants)) {
            const other = conv.participants.find((p: any) => {
                const pId = typeof p === 'string' ? p : p?._id;
                return pId !== user?._id;
            });
            if (other) {
                if (typeof other === 'string') return other;
                return other.displayName || other._id || 'Direct Message';
            }
        }
        return 'Direct Message';
    };

    const getOtherUserId = (conversationId: string): string | null => {
        const conv = conversations.find((c) => c._id === conversationId);
        if (!conv || conv.type !== 'direct_message' || !conv.participants || !Array.isArray(conv.participants)) return null;
        const other = conv.participants.find((p: any) => {
            const pId = typeof p === 'string' ? p : p?._id;
            return pId !== user?._id;
        });
        if (other) {
            return typeof other === 'string' ? other : other._id;
        }
        return null;
    };

    const isFriend = (otherUserId: string | null): boolean => {
        if (!otherUserId) return false;
        return friends.some((f) => f._id === otherUserId);
    };

    const handleStartChat = async (otherUserId: string) => {
        try {
            // Check if DM already exists in current list
            const existingDM = conversations.find(c =>
                c.type === 'direct_message' &&
                c.participants.some(p => p._id === otherUserId)
            );

            if (existingDM) {
                setActiveConversation(existingDM._id);
                setActiveTab('chats');
            } else {
                // Create new DM
                const { data } = await conversationAPI.create('direct_message', [otherUserId]);
                await loadConversations();
                setActiveConversation(data.conversation._id);
                setActiveTab('chats');
            }
        } catch (err) {
            console.error('Failed to start chat:', err);
        }
    };

    return (
        <div className="chat-page">
            <Sidebar
                conversations={conversations}
                activeConversation={activeConversation}
                onSelectConversation={setActiveConversation}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                userId={user?._id || ''}
                onRefreshConversations={loadConversations}
            />

            <div className="chat-main">
                {activeTab === 'friends' ? (
                    <FriendPanel onChatWithUser={handleStartChat} />
                ) : (
                    <ChatWindow
                        conversationId={activeConversation}
                        conversationName={activeConversation ? getConversationName(activeConversation) : ''}
                        userId={user?._id || ''}
                        isFriend={activeConversation ? isFriend(getOtherUserId(activeConversation)) : false}
                        isDirectMessage={activeConversation ? conversations.find(c => c._id === activeConversation)?.type === 'direct_message' : false}
                        participants={activeConversation ? conversations.find(c => c._id === activeConversation)?.participants || [] : []}
                    />
                )}
            </div>
        </div>
    );
};

export default ChatPage;
