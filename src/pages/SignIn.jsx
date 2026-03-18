import { useState } from 'react';
import { Shield, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useToast from '../hooks/useToast.js';

export default function SignIn({ onSwitchToSignUp, onSwitchToForgotPassword }) {
    const { signIn } = useAuth();
    const toast = useToast();

    const [isStudent, setIsStudent] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const formMaxWidth = 'clamp(360px, 60vw, 720px)';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const data = await signIn({
                userType: isStudent ? 'student' : 'security',
                identifier: formData.identifier.trim(),
                password: formData.password,
            });

            toast.success(`Welcome back, ${data.user.full_name}!`);
            window.location.hash = data.user.user_role === 'security' ? 'dashboard' : 'map';
        } catch (err) {
            const errData = err.response?.data;
            const msg =
                errData?.non_field_errors?.[0] ||
                errData?.detail ||
                errData?.error ||
                'Login failed. Please check your credentials.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        height: '48px',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '12px 48px',
        color: 'var(--color-text-primary)',
        fontSize: '16px',
        outline: 'none',
        boxSizing: 'border-box',
        display: 'block',
    };

    const buttonStyle = {
        width: '100%',
        height: '48px',
        borderRadius: '12px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        opacity: isLoading ? 0.7 : 1,
        color: '#FFFFFF',
        backgroundColor: isStudent ? 'var(--color-primary)' : 'var(--color-secondary)',
    };

    return (
        <div style={{
            minHeight: '100dvh',
            width: '100%',
            backgroundColor: 'var(--color-bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(16px, 5vw, 32px)',
            overflowY: 'auto',
        }}>
            {/* Background Gradient */}
            <div style={{
                position: 'fixed',
                inset: 0,
                background: 'linear-gradient(to bottom right, rgba(212, 160, 23, 0.06), transparent, rgba(34, 139, 34, 0.06))',
                pointerEvents: 'none',
            }} />

            {/* Logo & Title */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 16px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}>
                    <img src="/knust-logo.png" alt="KNUST Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    KNUST SafeTrack
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    Campus Safety & Security
                </p>
            </div>

            {/* User Type Toggle */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: formMaxWidth, marginBottom: '24px' }}>
                <div style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: '12px',
                    padding: '6px',
                    display: 'flex',
                    gap: '4px',
                    border: '1px solid var(--color-border)',
                }}>
                    <button
                        type="button"
                        onClick={() => { setIsStudent(true); setError(''); }}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '8px',
                            fontWeight: '500',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: isStudent ? 'var(--color-primary)' : 'transparent',
                            color: isStudent ? '#FFFFFF' : 'var(--color-text-secondary)',
                        }}
                    >
                        <User style={{ width: '16px', height: '16px' }} />
                        <span>Student</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsStudent(false); setError(''); }}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '8px',
                            fontWeight: '500',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: !isStudent ? 'var(--color-secondary)' : 'transparent',
                            color: !isStudent ? '#FFFFFF' : 'var(--color-text-secondary)',
                        }}
                    >
                        <Shield style={{ width: '16px', height: '16px' }} />
                        <span>Security</span>
                    </button>
                </div>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: formMaxWidth }}>
                {/* Error Message */}
                {error && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: 'rgba(220, 38, 38, 0.08)',
                        border: '1px solid rgba(220, 38, 38, 0.2)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                    }}>
                        <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--color-danger)', flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '14px', color: 'var(--color-danger)', margin: 0 }}>{error}</p>
                    </div>
                )}

                {/* Identifier Field */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                        {isStudent ? 'Student Email' : 'Staff ID'}
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Mail style={{
                            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                            width: '20px', height: '20px', color: 'var(--color-text-muted)', pointerEvents: 'none',
                        }} />
                        <input
                            type={isStudent ? 'email' : 'text'}
                            placeholder={isStudent ? 'name@st.knust.edu.gh' : 'SID-XXXX'}
                            value={formData.identifier}
                            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            style={inputStyle}
                            required
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                        Password
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Lock style={{
                            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                            width: '20px', height: '20px', color: 'var(--color-text-muted)', pointerEvents: 'none',
                        }} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ ...inputStyle, paddingRight: '48px' }}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--color-text-muted)', padding: '4px',
                            }}
                        >
                            {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                        </button>
                    </div>
                </div>

                {/* Forgot Password */}
                <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                    <button type="button" onClick={onSwitchToForgotPassword} style={{
                        background: 'none', border: 'none', color: 'var(--color-primary)',
                        fontSize: '14px', cursor: 'pointer', fontWeight: '500',
                    }}>
                        Forgot password?
                    </button>
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={isLoading} style={buttonStyle}>
                    {isLoading ? (
                        <div style={{
                            width: '20px', height: '20px', border: '2px solid white',
                            borderTopColor: 'transparent', borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite',
                        }} />
                    ) : (
                        <>
                            <span>Sign In</span>
                            <ArrowRight style={{ width: '20px', height: '20px' }} />
                        </>
                    )}
                </button>
            </form>

            {/* Switch to Sign Up */}
            <p style={{ position: 'relative', zIndex: 10, color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '24px', textAlign: 'center' }}>
                Don&apos;t have an account?{' '}
                <button
                    type="button"
                    onClick={onSwitchToSignUp}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                >
                    Request Access
                </button>
            </p>

            <p style={{ position: 'relative', zIndex: 10, color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '16px', textAlign: 'center' }}>
                By signing in, you agree to our Terms & Privacy Policy
            </p>

            {/* Spinner keyframe */}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}