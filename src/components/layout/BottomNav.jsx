import { useEffect, useState } from 'react';
import { Map, MessageCircle, Bell, User } from 'lucide-react';
import notificationsAPI from '../../api/notifications';
import chatAPI from '../../api/chat';

const navItems = [
    { id: 'map', label: 'Map', icon: Map, hash: '#map' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, hash: '#chat', badgeKey: 'chat' },
    { id: 'alerts', label: 'Alerts', icon: Bell, hash: '#alerts', badgeKey: 'notifications' },
    { id: 'profile', label: 'Profile', icon: User, hash: '#profile' },
];

export default function BottomNav({ activeTab }) {
    const [badges, setBadges] = useState({ chat: 0, notifications: 0 });
    const currentHash = window.location.hash.replace('#', '') || 'map';
    const currentTab = activeTab || currentHash;

    // Fetch badge counts
    useEffect(() => {
        const fetchBadges = async () => {
            try {
                const [chatRes, notifRes] = await Promise.allSettled([
                    chatAPI.unreadCount(),
                    notificationsAPI.unreadCount(),
                ]);

                setBadges({
                    chat: chatRes.status === 'fulfilled' ? chatRes.value.data.unread_count : 0,
                    notifications: notifRes.status === 'fulfilled' ? notifRes.value.data.unread_count : 0,
                });
            } catch {
                // ignore
            }
        };

        fetchBadges();
        const interval = setInterval(fetchBadges, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[1001] bg-bg-primary border-t border-border">
            <div className="flex items-center justify-around h-16 px-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                    return (
                        <a
                            key={item.id}
                            href={item.hash}
                            className={`flex flex-col items-center justify-center gap-1 w-16 py-2 rounded-xl transition-colors relative ${
                                isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary'
                            }`}
                            aria-label={item.label}
                        >
                            <div className="relative">
                                <Icon className="w-5 h-5" />
                                {badgeCount > 0 && (
                                    <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {badgeCount > 99 ? '99+' : badgeCount}
                                    </span>
                                )}
                            </div>
                            <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute -bottom-0 w-8 h-0.5 bg-primary rounded-full" />
                            )}
                        </a>
                    );
                })}
            </div>
            <div className="bg-bg-primary" style={{ height: 'env(safe-area-inset-bottom)' }} />
        </nav>
    );
}