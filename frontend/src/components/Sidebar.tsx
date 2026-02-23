import { useState } from 'react';
import type { Conversation } from '../types';
import { BambooIcon, SettingsIcon, SearchIcon, ChatIcon, PlusIcon } from './Icons';
import ProfileEdit from './ProfileEdit';
import CreateGroup from './CreateGroup';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

interface SidebarProps {
    conversations: Conversation[];
    activeConversation: string | null;
    onSelectConversation: (id: string) => void;
    activeTab: 'chats' | 'friends';
    onTabChange: (tab: 'chats' | 'friends') => void;
    userId: string;
    onRefreshConversations: () => void;
}

const Sidebar = ({
    conversations,
    activeConversation,
    onSelectConversation,
    activeTab,
    onTabChange,
    userId,
    onRefreshConversations,
}: SidebarProps) => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [showCreateGroup, setShowCreateGroup] = useState(false);

    const getConversationName = (conv: Conversation) => {
        if (conv.type === 'group' && conv.name) return conv.name;
        if (conv.participants && Array.isArray(conv.participants)) {
            const other = conv.participants.find((p: any) => {
                const pId = typeof p === 'string' ? p : p?._id;
                return pId !== userId;
            });
            if (other) {
                if (typeof other === 'string') return other;
                return other.displayName || other._id || 'User';
            }
        }
        return 'Direct Message';
    };

    const getConversationAvatar = (conv: Conversation) => {
        if (conv.type === 'direct_message' && conv.participants && Array.isArray(conv.participants)) {
            const other = conv.participants.find((p: any) => {
                const pId = typeof p === 'string' ? p : p?._id;
                return pId !== userId;
            });
            if (other && typeof other !== 'string' && (other as any).avatar?.url) {
                return (other as any).avatar.url as string;
            }
        }
        return null;
    };

    const getAvatarLetter = (conv: Conversation) => {
        const name = getConversationName(conv);
        if (!name || typeof name !== 'string') return '?';
        return name.charAt(0).toUpperCase();
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        if (diffMin < 1) return 'Vừa xong';
        if (diffMin < 60) return `${diffMin} phút`;
        if (diffHour < 24) return `${diffHour} giờ`;
        if (diffDay < 7) return `${diffDay} ngày`;
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const getConversationPreview = (conv: Conversation) => {
        if (conv.lastMessage && conv.lastMessage.content) {
            const content = conv.lastMessage.content;
            return content.length > 30 ? content.substring(0, 30) + '...' : content;
        }
        if (conv.type === 'group') return 'Nhóm chat';
        return 'Tin nhắn riêng';
    };

    // Filter conversations by search query
    const filteredConversations = conversations.filter((conv) => {
        if (!searchQuery.trim()) return true;
        const name = getConversationName(conv).toLowerCase();
        return name.includes(searchQuery.toLowerCase());
    });

    const handleCreateSuccess = (conversationId: string) => {
        setShowCreateGroup(false);
        onRefreshConversations();
        onSelectConversation(conversationId);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2><BambooIcon size={24} style={{ color: 'var(--bambo-green)', marginRight: 8, verticalAlign: 'middle' }} /> BamboChat</h2>
                <div className="sidebar-header-actions">
                    <span className="user-id">{userId}</span>
                    <button
                        className="settings-btn"
                        title="Edit Profile"
                        onClick={() => setShowProfileEdit(true)}
                        style={{ padding: 0, overflow: 'hidden', borderRadius: '50%', width: 32, height: 32 }}
                    >
                        {user?.avatar?.url ? (
                            <img
                                src={user.avatar.url}
                                alt="avatar"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        ) : (
                            <SettingsIcon size={18} />
                        )}
                    </button>
                </div>
            </div>

            {/* Search bar */}
            <div className="sidebar-search">
                <div className="sidebar-search-wrapper">
                    <span className="sidebar-search-icon">
                        <SearchIcon size={16} />
                    </span>
                    <input
                        className="input"
                        type="text"
                        placeholder="Tìm kiếm trên BamboChat"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Filter tabs */}
            <div className="sidebar-tabs-container">
                <div className="sidebar-tabs">
                    <button
                        className={`sidebar-tab ${activeTab === 'chats' ? 'active' : ''}`}
                        onClick={() => onTabChange('chats')}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`sidebar-tab ${activeTab === 'friends' ? 'active' : ''}`}
                        onClick={() => onTabChange('friends')}
                    >
                        Bạn bè
                    </button>
                </div>
                <button
                    className="create-group-btn"
                    title="Tạo nhóm mới"
                    onClick={() => setShowCreateGroup(true)}
                >
                    <PlusIcon size={16} />
                </button>
            </div>

            {activeTab === 'chats' && (
                <div className="conversation-list">
                    {filteredConversations.length === 0 ? (
                        <div className="sidebar-empty">
                            <span className="sidebar-empty-icon">
                                <ChatIcon size={32} />
                            </span>
                            {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Bắt đầu cuộc trò chuyện mới bên dưới'}
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv._id}
                                className={`conversation-item ${activeConversation === conv._id ? 'active' : ''}`}
                                onClick={() => onSelectConversation(conv._id)}
                            >
                                <div className="conversation-avatar">
                                    {conv.type === 'direct_message' && getConversationAvatar(conv) ? (
                                        <img
                                            src={getConversationAvatar(conv)!}
                                            alt="avatar"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                        />
                                    ) : (
                                        getAvatarLetter(conv)
                                    )}
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-top-row">
                                        <div className="conversation-name">{getConversationName(conv)}</div>
                                        <span className="conversation-time">
                                            {getRelativeTime(conv.updatedAt || conv.createdAt)}
                                        </span>
                                    </div>
                                    <div className="conversation-preview">
                                        {getConversationPreview(conv)}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showProfileEdit && <ProfileEdit onClose={() => setShowProfileEdit(false)} />}
            {showCreateGroup && (
                <CreateGroup
                    onClose={() => setShowCreateGroup(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}
        </div>
    );
};

export default Sidebar;
