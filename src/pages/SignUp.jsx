import { useState } from 'react';
import { Shield, User, Mail, Lock, Eye, EyeOff, ArrowRight, Phone, Home, MapPin, ChevronDown, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useToast from '../hooks/useToast.js';

const HOSTELS = [
    'Unity Hall', 'University Hall (Katanga)', 'Independence Hall (Conti)',
    'Queens Hall', 'Republic Hall (Repub)', 'Africa Hall',
    'Hall 7 (Brunei)', 'Gaza Hostel', 'Ayeduase Hostel',
    'Private Hostel (Off-campus)',
];
const GENDERS = ['Male', 'Female', 'Prefer not to say'];

export default function SignUp({ onSwitchToSignIn }) {
    const { signUp } = useAuth();
    const toast = useToast();

    const [isStudent, setIsStudent] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '', email: '', phone: '', studentId: '',
        password: '', confirmPassword: '',
        hostel: '', town: '', landmark: '', gender: '',
    });
    const formMaxWidth = 'clamp(360px, 60vw, 720px)';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                user_type: isStudent ? 'student' : 'security',
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                confirm_password: formData.confirmPassword,
                gender: formData.gender,
                hostel_name: formData.hostel,
                town: formData.town,
                landmark: formData.landmark,
            };
            if (isStudent) payload.student_id = formData.studentId;

            const data = await signUp(payload);

            if (data.tokens) {
                toast.success('Account created! Welcome to SafeTrack.');
                window.location.hash = 'map';
            } else {
                toast.success(data.message || 'Account created! Awaiting admin approval.');
                window.location.hash = 'signin';
            }
        } catch (err) {
            const errData = err.response?.data;
            if (errData && typeof errData === 'object') {
                const firstErr = Object.values(errData).flat()[0];
                setError(typeof firstErr === 'string' ? firstErr : 'Registration failed.');
            } else {
                setError('Registration failed. Please try again.');
            }
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

    const selectStyle = {
        ...inputStyle,
        appearance: 'none',
        WebkitAppearance: 'none',
        cursor: 'pointer',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: 'var(--color-text-secondary)',
        marginBottom: '8px',
    };

    const iconStyle = {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        color: 'var(--color-text-muted)',
        pointerEvents: 'none',
    };

    const chevronStyle = {
        position: 'absolute',
        right: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '18px',
        height: '18px',
        color: 'var(--color-text-muted)',
        pointerEvents: 'none',
    };

    return (
        <div style={{
            minHeight: '100dvh',
            width: '100%',
            backgroundColor: 'var(--color-bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 'clamp(16px, 5vw, 32px)',
            paddingTop: '48px',
            overflowY: 'auto',
        }}>
            <div style={{
                position: 'fixed', inset: 0,
                background: 'linear-gradient(to bottom right, rgba(212, 160, 23, 0.06), transparent, rgba(34, 139, 34, 0.06))',
                pointerEvents: 'none',
            }} />

            {/* Logo */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                    width: '64px', height: '64px', margin: '0 auto 12px',
                    backgroundColor: 'var(--color-bg-secondary)', borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--color-border)', overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}>
                    <img src="/knust-logo.png" alt="KNUST Logo" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
                </div>
                <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Request Access</h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Join KNUST SafeTrack</p>
            </div>

            {/* Toggle */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: formMaxWidth, marginBottom: '20px' }}>
                <div style={{
                    backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                    padding: '6px', display: 'flex', gap: '4px', border: '1px solid var(--color-border)',
                }}>
                    <button type="button" onClick={() => setIsStudent(true)} style={{
                        flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: '500', fontSize: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: isStudent ? 'var(--color-primary)' : 'transparent',
                        color: isStudent ? '#FFFFFF' : 'var(--color-text-secondary)',
                    }}>
                        <User style={{ width: '16px', height: '16px' }} /><span>Student</span>
                    </button>
                    <button type="button" onClick={() => setIsStudent(false)} style={{
                        flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: '500', fontSize: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        border: 'none', cursor: 'pointer',
                        backgroundColor: !isStudent ? 'var(--color-secondary)' : 'transparent',
                        color: !isStudent ? '#FFFFFF' : 'var(--color-text-secondary)',
                    }}>
                        <Shield style={{ width: '16px', height: '16px' }} /><span>Security</span>
                    </button>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: formMaxWidth }}>
                {error && (
                    <div style={{
                        marginBottom: '16px', padding: '12px',
                        backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
                        borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px',
                    }}>
                        <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--color-danger)', flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ fontSize: '14px', color: 'var(--color-danger)', margin: 0 }}>{error}</p>
                    </div>
                )}

                {/* Full Name */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                        <User style={iconStyle} />
                        <input type="text" placeholder="Enter your full name" value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} style={inputStyle} required />
                    </div>
                </div>

                {/* Student ID */}
                {isStudent && (
                    <div style={{ marginBottom: '14px' }}>
                        <label style={labelStyle}>Student ID</label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={iconStyle} />
                            <input type="text" placeholder="e.g., 20012345" value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} style={inputStyle} required />
                        </div>
                    </div>
                )}

                {/* Email */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>{isStudent ? 'Student Email' : 'Work Email'}</label>
                    <div style={{ position: 'relative' }}>
                        <Mail style={iconStyle} />
                        <input type="email" placeholder={isStudent ? 'name@st.knust.edu.gh' : 'name@knust.edu.gh'}
                            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            style={inputStyle} required />
                    </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                        <Phone style={iconStyle} />
                        <input type="tel" placeholder="e.g., 024 123 4567" value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} required />
                    </div>
                </div>

                {/* Gender */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Gender</label>
                    <div style={{ position: 'relative' }}>
                        <User style={iconStyle} />
                        <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            style={{ ...selectStyle, color: formData.gender ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }} required>
                            <option value="" disabled>Select gender</option>
                            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                        <ChevronDown style={chevronStyle} />
                    </div>
                </div>

                {/* Hostel */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Hostel Name</label>
                    <div style={{ position: 'relative' }}>
                        <Home style={iconStyle} />
                        <select value={formData.hostel} onChange={(e) => setFormData({ ...formData, hostel: e.target.value })}
                            style={{ ...selectStyle, color: formData.hostel ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }} required>
                            <option value="" disabled>Select your hostel</option>
                            {HOSTELS.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <ChevronDown style={chevronStyle} />
                    </div>
                </div>

                {/* Town */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Town</label>
                    <div style={{ position: 'relative' }}>
                        <MapPin style={iconStyle} />
                        <input type="text" placeholder="e.g., Ayeduase, Bomso, Kotei" value={formData.town}
                            onChange={(e) => setFormData({ ...formData, town: e.target.value })} style={inputStyle} required />
                    </div>
                </div>

                {/* Landmark */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Landmark <span style={{ color: 'var(--color-text-muted)', fontWeight: '400' }}>(Optional)</span></label>
                    <div style={{ position: 'relative' }}>
                        <MapPin style={iconStyle} />
                        <input type="text" placeholder="e.g., Near Pharmacy, Opposite KFC" value={formData.landmark}
                            onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} style={inputStyle} />
                    </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock style={iconStyle} />
                        <input type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            style={{ ...inputStyle, paddingRight: '48px' }} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px',
                        }}>
                            {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                        </button>
                    </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock style={iconStyle} />
                        <input type={showPassword ? 'text' : 'password'} placeholder="Confirm your password" value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} style={inputStyle} required />
                    </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading} style={{
                    width: '100%', height: '48px', borderRadius: '12px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.7 : 1, color: '#FFFFFF',
                    backgroundColor: isStudent ? 'var(--color-primary)' : 'var(--color-secondary)',
                }}>
                    {isLoading ? (
                        <div style={{
                            width: '20px', height: '20px', border: '2px solid white',
                            borderTopColor: 'transparent', borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite',
                        }} />
                    ) : (
                        <>
                            <span>Request Access</span>
                            <ArrowRight style={{ width: '20px', height: '20px' }} />
                        </>
                    )}
                </button>
            </form>

            {/* Switch */}
            <p style={{ position: 'relative', zIndex: 10, color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '24px', textAlign: 'center' }}>
                Already have an account?{' '}
                <button type="button" onClick={onSwitchToSignIn} style={{
                    background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                }}>
                    Sign In
                </button>
            </p>

            <p style={{ position: 'relative', zIndex: 10, color: 'var(--color-text-muted)', fontSize: '11px', marginTop: '16px', textAlign: 'center', paddingBottom: '32px' }}>
                Your request will be reviewed by campus security
            </p>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}