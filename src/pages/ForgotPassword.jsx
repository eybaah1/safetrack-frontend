import { useState, useRef } from 'react';
import { Shield, User, Mail, ArrowLeft, ArrowRight, CheckCircle, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import authAPI from '../api/auth';
import useToast from '../hooks/useToast.js';

export default function ForgotPassword({ onBackToSignIn }) {
    const toast = useToast();
    const [step, setStep] = useState(1); // 1=email, 2=code, 3=new password, 4=success
    const [isStudent, setIsStudent] = useState(true);
    const [email, setEmail] = useState('');
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const codeRefs = useRef([]);
    const formMaxWidth = 'clamp(360px, 60vw, 720px)';

    const inputStyle = {
        width: '100%', height: '48px',
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)', borderRadius: '12px',
        padding: '12px 48px', color: 'var(--color-text-primary)',
        fontSize: '16px', outline: 'none', boxSizing: 'border-box',
    };

    // ── Step 1: Request code ────────────────────────────
    const handleRequestCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authAPI.requestResetCode(email.trim().toLowerCase());
            toast.success('Reset code sent to your email!');
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send code. Try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Code input handling ─────────────────────
    const handleCodeChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            codeRefs.current[index + 1]?.focus();
        }
    };

    const handleCodeKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            codeRefs.current[index - 1]?.focus();
        }
    };

    const handleCodePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setCode(pasted.split(''));
            codeRefs.current[5]?.focus();
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        const codeStr = code.join('');
        if (codeStr.length !== 6) { setError('Enter all 6 digits.'); return; }

        setError('');
        setLoading(true);
        try {
            await authAPI.verifyResetCode(email.trim().toLowerCase(), codeStr);
            toast.success('Code verified!');
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: Set new password ────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }

        setError('');
        setLoading(true);
        try {
            await authAPI.resetPassword({
                email: email.trim().toLowerCase(),
                code: code.join(''),
                new_password: newPassword,
                confirm_password: confirmPassword,
            });
            toast.success('Password reset successful!');
            setStep(4);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.confirm_password?.[0] || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 4: Success ─────────────────────────────────
    if (step === 4) {
        return (
            <div style={{ minHeight: '100dvh', width: '100%', backgroundColor: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 5vw, 32px)' }}>
                <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(to bottom right, rgba(212,160,23,0.06), transparent, rgba(34,139,34,0.06))', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: formMaxWidth }}>
                    <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', backgroundColor: 'rgba(34,139,34,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle style={{ width: '40px', height: '40px', color: 'var(--color-secondary)' }} />
                    </div>
                    <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '12px' }}>Password Reset!</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '32px' }}>Your password has been changed successfully. You can now sign in with your new password.</p>
                    <button type="button" onClick={onBackToSignIn} style={{ width: '100%', height: '48px', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', color: 'white', backgroundColor: 'var(--color-primary)' }}>
                        <ArrowLeft style={{ width: '20px', height: '20px' }} />
                        <span>Back to Sign In</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100dvh', width: '100%', backgroundColor: 'var(--color-bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 5vw, 32px)', overflowY: 'auto' }}>
            <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(to bottom right, rgba(212,160,23,0.06), transparent, rgba(34,139,34,0.06))', pointerEvents: 'none' }} />

            {/* Back button */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: formMaxWidth, marginBottom: '24px' }}>
                <button type="button" onClick={step > 1 ? () => setStep(step - 1) : onBackToSignIn} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                    <ArrowLeft style={{ width: '18px', height: '18px' }} />
                    {step > 1 ? 'Back' : 'Back to Sign In'}
                </button>
            </div>

            {/* Logo */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', backgroundColor: 'var(--color-bg-secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--color-border)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                    <img src="/knust-logo.png" alt="KNUST Logo" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                    {step === 1 && 'Reset Password'}
                    {step === 2 && 'Enter Code'}
                    {step === 3 && 'New Password'}
                </h1>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    {step === 1 && 'Enter your email to receive a 6-digit code'}
                    {step === 2 && `Enter the code sent to ${email}`}
                    {step === 3 && 'Create your new password'}
                </p>
            </div>

            {/* Error */}
            {error && (
                <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: formMaxWidth, marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <AlertCircle style={{ width: '20px', height: '20px', color: 'var(--color-danger)', flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ fontSize: '14px', color: 'var(--color-danger)', margin: 0 }}>{error}</p>
                </div>
            )}

            {/* ── STEP 1: Email ────────────────────────── */}
            {step === 1 && (
                <form onSubmit={handleRequestCode} style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: formMaxWidth }}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                            <input type="email" placeholder="name@st.knust.edu.gh" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', height: '48px', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, color: 'white', backgroundColor: 'var(--color-primary)' }}>
                        {loading ? <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : <><span>Send Reset Code</span><ArrowRight style={{ width: '20px', height: '20px' }} /></>}
                    </button>
                </form>
            )}

            {/* ── STEP 2: 6-digit code ─────────────────── */}
            {step === 2 && (
                <form onSubmit={handleVerifyCode} style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: formMaxWidth }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }} onPaste={handleCodePaste}>
                        {code.map((digit, i) => (
                            <input
                                key={i}
                                ref={(el) => (codeRefs.current[i] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleCodeChange(i, e.target.value)}
                                onKeyDown={(e) => handleCodeKeyDown(i, e)}
                                style={{
                                    width: '48px', height: '56px', textAlign: 'center',
                                    fontSize: '24px', fontWeight: 'bold',
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    border: digit ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    borderRadius: '12px', color: 'var(--color-text-primary)',
                                    outline: 'none',
                                }}
                            />
                        ))}
                    </div>
                    <button type="submit" disabled={loading || code.join('').length !== 6} style={{ width: '100%', height: '48px', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, color: 'white', backgroundColor: 'var(--color-primary)' }}>
                        {loading ? <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : <><span>Verify Code</span><ArrowRight style={{ width: '20px', height: '20px' }} /></>}
                    </button>
                    <button type="button" onClick={() => { setCode(['','','','','','']); handleRequestCode({ preventDefault: () => {} }); }} style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '14px', cursor: 'pointer' }}>
                        Didn&apos;t receive it? <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>Resend</span>
                    </button>
                </form>
            )}

            {/* ── STEP 3: New password ──────────────────── */}
            {step === 3 && (
                <form onSubmit={handleResetPassword} style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: formMaxWidth }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>New Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                            <input type={showPassword ? 'text' : 'password'} placeholder="Create new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ ...inputStyle, paddingRight: '48px' }} required />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                                {showPassword ? <EyeOff style={{ width: '20px', height: '20px' }} /> : <Eye style={{ width: '20px', height: '20px' }} />}
                            </button>
                        </div>
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                            <input type={showPassword ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} style={{ width: '100%', height: '48px', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, color: 'white', backgroundColor: 'var(--color-secondary)' }}>
                        {loading ? <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> : <><span>Reset Password</span><CheckCircle style={{ width: '20px', height: '20px' }} /></>}
                    </button>
                </form>
            )}

            {/* Footer */}
            <p style={{ position: 'relative', zIndex: 10, color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '24px', textAlign: 'center' }}>
                Remember your password?{' '}
                <button type="button" onClick={onBackToSignIn} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}>Sign In</button>
            </p>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}