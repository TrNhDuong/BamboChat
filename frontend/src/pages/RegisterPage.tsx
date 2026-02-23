import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { BambooIcon } from '../components/Icons';
import './Auth.css';

const RegisterPage = () => {
    const [id, setId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register(id, email, password);
            // Navigate to OTP verification with email in state
            navigate('/verify-otp', { state: { email } });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const { currentTarget, clientX, clientY } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPercent = ((clientX - left) / width) * 100;
        const yPercent = ((clientY - top) / height) * 100;

        (currentTarget as HTMLElement).style.setProperty('--mouse-x', `${xPercent}%`);
        (currentTarget as HTMLElement).style.setProperty('--mouse-y', `${yPercent}%`);

        // Create ripples
        if (Date.now() % 3 === 0) {
            const newRipple = { id: Date.now(), x: clientX - left, y: clientY - top };
            setRipples((prev) => [...prev.slice(-15), newRipple]);
            setTimeout(() => {
                setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
            }, 1200);
        }
    };

    return (
        <div className="auth-page" onMouseMove={handleMouseMove}>
            {/* Background elements */}
            <div className="wave-layer" />
            <div className="wave-layer secondary" />

            {/* Interactive Ripples */}
            {ripples.map((r) => (
                <div key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
            ))}

            {/* Random water drops */}
            <div className="water-drop" style={{ width: 70, height: 80, top: '20%', left: '80%', animationDelay: '0s' }} />
            <div className="water-drop" style={{ width: 90, height: 100, top: '70%', left: '10%', animationDelay: '-3s' }} />
            <div className="water-drop" style={{ width: 50, height: 60, top: '85%', left: '75%', animationDelay: '-5s' }} />

            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-brand-icon">
                        <BambooIcon size={40} style={{ color: 'var(--white)' }} />
                    </div>
                    <span className="auth-brand-name">BamboChat</span>
                </div>
                <h1>Create account</h1>
                <p className="subtitle">Join the conversation today</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>User ID</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="Choose a unique user ID"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            className="input"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            className="input"
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
