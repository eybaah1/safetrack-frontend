import { useRef, useState, useEffect } from 'react';
import { X, Bell, Moon, Shield, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';
import notificationsAPI from '../api/notifications';
import useToast from '../hooks/useToast.js';

function ToggleSwitch({ enabled, onToggle }) {
    return (
        <button type="button" onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {enabled
                ? <ToggleRight style={{ width: '32px', height: '32px', color: 'var(--color-primary)' }} />
                : <ToggleLeft style={{ width: '32px', height: '32px', color: 'var(--color-text-muted)' }} />
            }
        </button>
    );
}

export default function SettingsModal({ isOpen, onClose }) {
    const toast = useToast();
    const [settings, setSettings] = useState({
        notifications_enabled: true,
        sos_alerts_enabled: true,
        share_location_enabled: true,
        dark_mode_enabled: false,
        sound_alerts_enabled: true,
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const modalRef = useRef(null);
    const closeBtnRef = useRef(null);

    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: modalRef, initialFocusRef: closeBtnRef });

    // Fetch preferences when modal opens
    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        notificationsAPI.getPreferences()
            .then(({ data }) => setSettings(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [isOpen]);

    const toggleSetting = (key) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await notificationsAPI.updatePreferences(settings);
            toast.success('Settings saved!');
            onClose();
        } catch {
            toast.error('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const rowStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px', backgroundColor: 'var(--color-bg-primary)',
        borderRadius: '12px', marginBottom: '8px',
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
            <div ref={modalRef} role="dialog" aria-modal="true" style={{
                position: 'relative', width: '100%', maxWidth: '400px',
                backgroundColor: 'var(--color-bg-secondary)', borderRadius: '16px',
                border: '1px solid var(--color-border)', overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>Settings</h2>
                    <button ref={closeBtnRef} type="button" onClick={onClose} style={{ padding: '8px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X style={{ width: '20px', height: '20px', color: 'var(--color-text-secondary)' }} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
                            <Loader2 style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} className="animate-spin" />
                        </div>
                    ) : (
                        <>
                            <h3 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Bell style={{ width: '14px', height: '14px' }} /> NOTIFICATIONS
                            </h3>
                            <div style={rowStyle}>
                                <div><p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Push Notifications</p><p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Get alerts on your device</p></div>
                                <ToggleSwitch enabled={settings.notifications_enabled} onToggle={() => toggleSetting('notifications_enabled')} />
                            </div>
                            <div style={rowStyle}>
                                <div><p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>SOS Alerts</p><p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Receive emergency broadcasts</p></div>
                                <ToggleSwitch enabled={settings.sos_alerts_enabled} onToggle={() => toggleSetting('sos_alerts_enabled')} />
                            </div>
                            <div style={rowStyle}>
                                <div><p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Sound Alerts</p><p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Play sound for emergencies</p></div>
                                <ToggleSwitch enabled={settings.sound_alerts_enabled} onToggle={() => toggleSetting('sound_alerts_enabled')} />
                            </div>

                            <h3 style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-muted)', margin: '20px 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield style={{ width: '14px', height: '14px' }} /> PRIVACY
                            </h3>
                            <div style={rowStyle}>
                                <div><p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>Share Location</p><p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Allow friends to see you</p></div>
                                <ToggleSwitch enabled={settings.share_location_enabled} onToggle={() => toggleSetting('share_location_enabled')} />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
                    <button onClick={handleSave} disabled={saving || loading} style={{
                        width: '100%', padding: '12px', backgroundColor: 'var(--color-primary)',
                        color: 'white', borderRadius: '12px', fontWeight: '600',
                        border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}>
                        {saving ? <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" /> : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
}