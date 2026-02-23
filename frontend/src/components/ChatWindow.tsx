import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../types';
import { conversationAPI } from '../services/api';
import { getSocket } from '../services/socket';
import MessageBubble from './MessageBubble';
import { ClockIcon, WaveIcon, SendIcon, UserPlusIcon } from './Icons';
import AddMember from './AddMember';
import './ChatWindow.css';

interface ChatWindowProps {
    conversationId: string | null;
    conversationName: string;
    userId: string;
    isFriend: boolean;
    isDirectMessage: boolean;
    participants: { _id: string; displayName: string | null; avatar?: { url: string; public_id: string } | null }[];
}

const ChatWindow = ({
    conversationId,
    conversationName,
    userId,
    isFriend,
    isDirectMessage,
    participants
}: ChatWindowProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [showAddMember, setShowAddMember] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load messages when conversation changes
    const loadMessages = useCallback(async () => {
        if (!conversationId) return;
        setLoading(true);
        try {
            const { data } = await conversationAPI.getMessages(conversationId);
            setMessages(data.reverse()); // API returns newest first, reverse for display
            setHasMore(data.length === 20);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    useEffect(() => {
        setMessages([]);
        setHasMore(true);
        loadMessages();
    }, [loadMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket event listeners
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleNewMessage = (msg: Message) => {
            if (msg.conversationId === conversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        const handleTyping = ({ conversationId: cId, userId: typerId, isTyping }: any) => {
            if (cId === conversationId && typerId !== userId) {
                setTypingUsers((prev) =>
                    isTyping ? [...new Set([...prev, typerId])] : prev.filter((u) => u !== typerId)
                );
            }
        };

        const handleReactionUpdate = ({ messageId, reactions }: any) => {
            setMessages((prev) =>
                prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
            );
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('typing', handleTyping);
        socket.on('reaction_update', handleReactionUpdate);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('typing', handleTyping);
            socket.off('reaction_update', handleReactionUpdate);
        };
    }, [conversationId, userId]);

    // Load more (pagination)
    const loadMore = async () => {
        if (!conversationId || messages.length === 0) return;
        const cursor = messages[0]._id;
        try {
            const { data } = await conversationAPI.getMessages(conversationId, cursor);
            setMessages((prev) => [...data.reverse(), ...prev]);
            setHasMore(data.length === 20);
        } catch (err) {
            console.error('Failed to load more messages:', err);
        }
    };

    // Send message
    const handleSend = () => {
        if (!newMessage.trim() || !conversationId) return;
        const socket = getSocket();
        if (!socket) return;

        socket.emit('send_message', {
            conversationId,
            content: newMessage.trim(),
        });

        setNewMessage('');

        // Stop typing indicator
        socket.emit('typing', { conversationId, isTyping: false });
    };

    // Typing indicator
    const handleInputChange = (value: string) => {
        setNewMessage(value);
        const socket = getSocket();
        if (!socket || !conversationId) return;

        socket.emit('typing', { conversationId, isTyping: true });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing', { conversationId, isTyping: false });
        }, 2000);
    };

    if (!conversationId) {
        return (
            <div className="chat-window">
                <div className="no-conversation">
                    <div className="no-conv-icon">💬</div>
                    <p>Select a conversation to start messaging</p>
                    <span className="hint">Choose from your existing chats or start a new one</span>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div className="chat-header-avatar">
                    {isDirectMessage ? (() => {
                        const otherParticipant = participants.find(p => p._id !== userId);
                        return otherParticipant?.avatar?.url ? (
                            <img
                                src={otherParticipant.avatar.url}
                                alt={conversationName}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                        ) : (
                            typeof conversationName === 'string' && conversationName.length > 0
                                ? conversationName.charAt(0).toUpperCase()
                                : '?'
                        );
                    })() : (
                        typeof conversationName === 'string' && conversationName.length > 0
                            ? conversationName.charAt(0).toUpperCase()
                            : '?'
                    )}
                </div>
                <div className="chat-header-info">
                    <div className="chat-header-name-row">
                        <h3>{conversationName}</h3>
                        {isDirectMessage && (
                            <span className={`friend-badge ${isFriend ? 'is-friend' : 'not-friend'}`}>
                                {isFriend ? '✓ Friend' : 'Not friend'}
                            </span>
                        )}
                    </div>
                    {typingUsers.length > 0 ? (
                        <div className="typing-indicator">
                            {typingUsers.join(', ')} is typing...
                        </div>
                    ) : (
                        <div className="online-status">Active now</div>
                    )}
                </div>
                {!isDirectMessage && (
                    <button
                        className="header-action-btn"
                        title="Thêm thành viên"
                        onClick={() => setShowAddMember(true)}
                    >
                        <UserPlusIcon size={20} />
                    </button>
                )}
            </div>

            {showAddMember && conversationId && (
                <AddMember
                    conversationId={conversationId}
                    existingParticipantIds={participants.map(p => p._id)}
                    onClose={() => setShowAddMember(false)}
                    onSuccess={() => {
                        // Normally we'd refresh participants, but they'll get added via socket eventually
                        // For now just hide
                        setShowAddMember(false);
                    }}
                />
            )}

            <div className="message-list">
                {hasMore && messages.length > 0 && (
                    <button className="btn btn-ghost btn-sm load-more-btn" onClick={loadMore}>
                        Load older messages
                    </button>
                )}

                {loading && messages.length === 0 ? (
                    <div className="message-list-empty">
                        <span className="empty-icon"><ClockIcon size={40} /></span>
                        Loading messages...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="message-list-empty">
                        <span className="empty-icon"><WaveIcon size={48} /></span>
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const prevMsg = messages[index - 1];
                        const nextMsg = messages[index + 1];

                        const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId;
                        const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;
                        const showAvatar = !isSent(msg) && isFirstInGroup;

                        const sender = participants.find(p => p._id === msg.senderId);
                        const senderName = sender?.displayName || msg.senderId;
                        const avatarUrl = sender?.avatar?.url;

                        function isSent(m: Message) {
                            return m.senderId === userId;
                        }

                        return (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                isSent={isSent(msg)}
                                showAvatar={showAvatar}
                                senderName={senderName}
                                avatarUrl={avatarUrl}
                                isDirectMessage={isDirectMessage}
                                isFirstInGroup={isFirstInGroup}
                                isLastInGroup={isLastInGroup}
                            />
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-area">
                <div className="chat-input-row">
                    <input
                        className="input"
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                    >
                        <SendIcon size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
