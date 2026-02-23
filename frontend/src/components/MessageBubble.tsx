import { useState } from 'react';
import type { Message } from '../types';
import { getSocket } from '../services/socket';
import { SmileyIcon } from './Icons';
import './MessageBubble.css';

interface MessageBubbleProps {
    message: Message;
    isSent: boolean;
    showAvatar: boolean;
    senderName?: string;
}

const REACTION_TYPES = [
    { type: 'like', emoji: '👍' },
    { type: 'love', emoji: '❤️' },
    { type: 'haha', emoji: '😂' },
    { type: 'sad', emoji: '😢' },
    { type: 'angry', emoji: '😡' },
];

const MessageBubble = ({ message, isSent, showAvatar, senderName }: MessageBubbleProps) => {
    const [showPicker, setShowPicker] = useState(false);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleReaction = (reactionType: string) => {
        const socket = getSocket();
        if (!socket) return;
        socket.emit('send_reaction', { messageId: message._id, reactionType });
        setShowPicker(false);
    };

    const avatarLetter = (senderName || message.senderId).charAt(0).toUpperCase();

    // Group reactions by type
    const reactionGroups = (message.reactions || []).reduce((acc: Record<string, number>, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
    }, {});

    const reactionIcon = (
        <div className="message-action-overlay">
            <button
                className={`reaction-trigger-btn ${showPicker ? 'active' : ''}`}
                onClick={() => setShowPicker(!showPicker)}
            >
                <SmileyIcon size={13} />
            </button>
            {showPicker && (
                <div className="reaction-picker">
                    {REACTION_TYPES.map((r) => (
                        <button
                            key={r.type}
                            className="reaction-option"
                            onClick={() => handleReaction(r.type)}
                            title={r.type}
                        >
                            {r.emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    const timeLabel = (
        <span className="message-time-outside">{formatTime(message.createdAt)}</span>
    );

    return (
        <div className={`message-bubble-wrapper ${isSent ? 'sent' : 'received'} ${showAvatar ? 'has-avatar' : ''}`}>
            {/* Avatar for received messages */}
            {!isSent && (
                <div className="message-avatar-container">
                    {showAvatar ? (
                        <div className="message-avatar" title={senderName || message.senderId}>
                            {avatarLetter}
                        </div>
                    ) : (
                        <div className="message-avatar-spacer" />
                    )}
                </div>
            )}

            {/* For sent: Time → Icon → Bubble */}
            {isSent && timeLabel}
            {isSent && reactionIcon}

            {/* Bubble */}
            <div className="message-content-container">
                <div className="message-bubble">
                    {!isSent && senderName && <div className="sender-name">{senderName}</div>}
                    <div>{message.content}</div>

                    {Object.keys(reactionGroups).length > 0 && (
                        <div className="message-reactions">
                            {Object.entries(reactionGroups).map(([type, count]) => (
                                <span key={type} className="reaction-badge" title={type}>
                                    {REACTION_TYPES.find(r => r.type === type)?.emoji}
                                    {count > 1 && <span className="reaction-count">{count}</span>}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* For received: Bubble → Icon → Time */}
            {!isSent && reactionIcon}
            {!isSent && timeLabel}
        </div>
    );
};

export default MessageBubble;
