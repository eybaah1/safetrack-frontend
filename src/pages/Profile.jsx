import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Bell, Shield, LogOut, ChevronRight, Edit2, Plus, Trash2, Loader2 } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import MenuDrawer from '../components/MenuDrawer';
import { useAuth } from '../context/AuthContext.jsx';
import authAPI from '../api/auth';
import useToast from '../hooks/useToast.js';

export default function Profile({ onSignOut }) {
    const { user, refreshUser } = useAuth();
    const toast = useToast();
    const [showMenu, setShowMenu] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [savedLocations, setSavedLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch profile data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [contactsRes, locationsRes] = await Promise.allSettled([
                    authAPI.getEmergencyContacts(),
                    authAPI.getSavedLocations(),
                ]);
                if (contactsRes.status === 'fulfilled') {
                    setContacts(contactsRes.value.data.results || contactsRes.value.data || []);
                }
                if (locationsRes.status === 'fulfilled') {
                    setSavedLocations(locationsRes.value.data.results || locationsRes.value.data || []);
                }
            } catch {} finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddContact = async () => {
        const name = prompt('Contact name:');
        if (!name) return;
        const phone = prompt('Phone number:');
        if (!phone) return;
        const relationship = prompt('Relationship (e.g. Mom, Dad, Friend):') || '';

        try {
            const { data } = await authAPI.createEmergencyContact({
                contact_name: name,
                phone,
                relationship,
                notify_for_sos: true,
                priority_order: contacts.length + 1,
            });
            setContacts((prev) => [...prev, data]);
            toast.success('Emergency contact added!');
        } catch {
            toast.error('Failed to add contact.');
        }
    };

    const handleDeleteContact = async (id) => {
        if (!confirm('Remove this emergency contact?')) return;
        try {
            await authAPI.deleteEmergencyContact(id);
            setContacts((prev) => prev.filter((c) => c.id !== id));
            toast.success('Contact removed.');
        } catch {
            toast.error('Failed to remove contact.');
        }
    };

    if (!user) return null;

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', paddingBottom: '80px' }}>
            <TopBar currentLocation="Profile" showSearch={false} onMenuClick={() => setShowMenu(true)} />

            <div style={{ paddingTop: '80px', padding: '80px 16px 80px 16px' }}>
                {/* Profile Header */}
                <div style={{
                    backgroundColor: 'var(--color-bg-secondary)', borderRadius: '16px',
                    padding: '24px', border: '1px solid var(--color-border)', marginBottom: '24px',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '64px', height: '64px', backgroundColor: 'rgba(212,160,23,0.1)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <User style={{ width: '32px', height: '32px', color: 'var(--color-primary)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0 }}>
                                {user.full_name}
                            </h2>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>
                                {user.student_id ? `ID: ${user.student_id}` : user.staff_id ? `Staff: ${user.staff_id}` : user.user_role}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-secondary)', borderRadius: '50%' }} />
                                <span style={{ fontSize: '12px', color: 'var(--color-secondary)' }}>
                                    {user.account_status === 'approved' ? 'Active' : user.account_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div style={{
                    backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                    border: '1px solid var(--color-border)', marginBottom: '24px', overflow: 'hidden',
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                        <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>Contact Information</h3>
                    </div>
                    {[
                        { icon: Mail, label: 'Email', value: user.email },
                        { icon: Phone, label: 'Phone', value: user.phone },
                        { icon: MapPin, label: 'Hostel', value: user.hostel_name },
                        { icon: MapPin, label: 'Town', value: user.town },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                            <Icon style={{ width: '20px', height: '20px', color: 'var(--color-text-muted)' }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>{label}</p>
                                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', margin: 0 }}>{value || '—'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Emergency Contacts */}
                <div style={{
                    backgroundColor: 'var(--color-bg-secondary)', borderRadius: '12px',
                    border: '1px solid var(--color-border)', marginBottom: '24px', overflow: 'hidden',
                }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>Emergency Contacts</h3>
                        <button onClick={handleAddContact} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '12px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Plus style={{ width: '14px', height: '14px' }} /> Add
                        </button>
                    </div>
                    {loading ? (
                        <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                            <Loader2 style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} className="animate-spin" />
                        </div>
                    ) : contacts.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>No emergency contacts yet.</p>
                        </div>
                    ) : (
                        contacts.map((contact) => (
                            <div key={contact.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{
                                    width: '36px', height: '36px', backgroundColor: 'rgba(220,38,38,0.1)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Shield style={{ width: '16px', height: '16px', color: 'var(--color-danger)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-primary)', margin: 0 }}>
                                        {contact.contact_name}
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                                        {contact.relationship ? `${contact.relationship} • ` : ''}{contact.phone}
                                    </p>
                                </div>
                                <button onClick={() => handleDeleteContact(contact.id)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                                    <Trash2 style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)' }} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Sign Out */}
                <button
                    onClick={onSignOut}
                    type="button"
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                        backgroundColor: 'rgba(220,38,38,0.05)', borderRadius: '12px',
                        padding: '14px 16px', border: '1px solid rgba(220,38,38,0.15)',
                        cursor: 'pointer',
                    }}
                >
                    <LogOut style={{ width: '20px', height: '20px', color: 'var(--color-danger)' }} />
                    <span style={{ flex: 1, textAlign: 'left', fontSize: '14px', fontWeight: '500', color: 'var(--color-danger)' }}>Sign Out</span>
                </button>
            </div>

            <BottomNav activeTab="profile" />
            <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} onSignOut={onSignOut} />
        </div>
    );
}