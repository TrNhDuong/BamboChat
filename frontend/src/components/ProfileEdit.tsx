import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI } from '../services/api';
import './ProfileEdit.css';

interface ProfileEditProps {
    onClose: () => void;
}

const ProfileEdit = ({ onClose }: ProfileEditProps) => {
    const { user, updateUser, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar?.url || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const { data } = await userAPI.updateProfile({ displayName, bio });
            updateUser(data);
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setAvatarPreview(localUrl);

        setAvatarLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const { data } = await userAPI.uploadAvatar(formData);
            updateUser(data);
            // Update preview to the real Cloudinary URL
            if (data.avatar?.url) setAvatarPreview(data.avatar.url);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload avatar');
            // Revert preview on error
            setAvatarPreview(user?.avatar?.url || null);
        } finally {
            setAvatarLoading(false);
            // Reset file input so the same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitial = () => {
        if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
        if (user?._id) return user._id.charAt(0).toUpperCase();
        return '?';
    };

    return (
        <div className="profile-edit-overlay" onClick={onClose}>
            <div className="profile-edit-card" onClick={(e) => e.stopPropagation()}>
                <div className="profile-edit-header">
                    <h2>Edit Profile</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                {/* Avatar Section */}
                <div className="avatar-section">
                    <div
                        className={`avatar-preview ${avatarLoading ? 'avatar-loading' : ''}`}
                        onClick={handleAvatarClick}
                        title="Change avatar"
                    >
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="avatar-img" />
                        ) : (
                            <span className="avatar-placeholder">{getInitial()}</span>
                        )}
                        <div className="avatar-overlay">
                            {avatarLoading ? (
                                <span className="avatar-overlay-text">Uploading…</span>
                            ) : (
                                <span className="avatar-overlay-text">Change Photo</span>
                            )}
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarChange}
                    />
                    <p className="avatar-hint">Click the avatar to upload a new photo</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>User ID</label>
                        <input className="input" type="text" value={user?._id} disabled />
                        <span className="input-hint">Your unique identifier cannot be changed.</span>
                    </div>

                    <div className="form-group">
                        <label>Display Name</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="How others see you"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            maxLength={50}
                        />
                    </div>

                    <div className="form-group">
                        <label>Bio</label>
                        <textarea
                            className="input"
                            placeholder="Tell us about yourself..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={160}
                            rows={3}
                        />
                    </div>

                    <div className="settings-divider">App Settings</div>

                    <div className="form-group setting-row">
                        <div className="setting-info">
                            <label>Dark Mode</label>
                            <span className="input-hint">Change the look of BamboChat</span>
                        </div>
                        <label className="switch">
                            <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="form-group setting-row">
                        <div className="setting-info">
                            <label>Session</label>
                            <span className="input-hint">Log out from this device</span>
                        </div>
                        <button type="button" className="btn btn-danger btn-sm" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    {success && <p className="success-message">Profile updated successfully!</p>}

                    <div className="profile-edit-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileEdit;
