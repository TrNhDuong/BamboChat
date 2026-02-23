import { useState, useEffect } from 'react';
import { conversationAPI, friendAPI } from '../services/api';
import './CreateGroup.css';

interface CreateGroupProps {
    onClose: () => void;
    onSuccess: (conversationId: string) => void;
}

const CreateGroup = ({ onClose, onSuccess }: CreateGroupProps) => {
    const [groupName, setGroupName] = useState('');
    const [friends, setFriends] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const { data } = await friendAPI.getFriends();
                setFriends(data);
            } catch (err) {
                console.error('Failed to fetch friends:', err);
            }
        };
        fetchFriends();
    }, []);

    const handleToggleMember = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!groupName.trim()) {
            setError('Vui lòng nhập tên nhóm');
            return;
        }
        if (selectedIds.length === 0) {
            setError('Vui lòng chọn ít nhất 1 thành viên');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const { data } = await conversationAPI.create('group', selectedIds, groupName.trim());
            onSuccess(data.conversation._id);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Không thể tạo nhóm');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-group-overlay">
            <div className="create-group-card fade-in">
                <div className="modal-header">
                    <h3>Tạo nhóm mới</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label>Tên nhóm</label>
                    <input
                        className="input"
                        type="text"
                        placeholder="Nhập tên nhóm..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="form-group member-selection-group">
                    <label>Chọn thành viên ({selectedIds.length})</label>
                    <div className="friend-selection-list">
                        {friends.length === 0 ? (
                            <p className="no-friends">Bạn chưa có bạn bè nào để thêm vào nhóm</p>
                        ) : (
                            friends.map(friendId => (
                                <label key={friendId} className="friend-selection-item">
                                    <div className="friend-checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(friendId)}
                                            onChange={() => handleToggleMember(friendId)}
                                        />
                                    </div>
                                    <div className="friend-small-avatar">
                                        {friendId.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="friend-id">{friendId}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Hủy</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleCreate}
                        disabled={loading}
                    >
                        {loading ? 'Đang tạo...' : 'Tạo nhóm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroup;
