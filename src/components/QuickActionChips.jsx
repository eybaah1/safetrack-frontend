import { Users, Share2, AlertTriangle } from 'lucide-react';
import useToast from '../hooks/useToast.js';
import trackingAPI from '../api/tracking';

const chips = [
    { id: 'walk', label: 'Walk With Me', icon: Users, color: 'secondary' },
    { id: 'share', label: 'Share Location', icon: Share2, color: 'primary' },
    { id: 'report', label: 'Report Issue', icon: AlertTriangle, color: 'muted' },
];

export default function QuickActionChips({ onWalkWithMe, onReport }) {
    const toast = useToast();

    const handleChipClick = async (chipId) => {
        if (chipId === 'walk' && onWalkWithMe) {
            onWalkWithMe();
        } else if (chipId === 'share') {
            try {
                await trackingAPI.toggleSharing(true);
                toast.success('Location sharing enabled!');
            } catch {
                toast.info('Location sharing link copied (demo)!');
            }
        } else if (chipId === 'report') {
            if (onReport) {
                onReport();
            } else {
                toast.info('Report Issue feature coming soon!');
            }
        }
    };

    return (
        <div
            className="absolute z-[1000] left-0 right-0 px-4 overflow-x-auto hide-scrollbar"
            style={{ bottom: 'calc(64px + 140px + 12px)' }}
        >
            <div className="flex gap-2 w-max">
                {chips.map((chip) => {
                    const Icon = chip.icon;
                    const bgColor = chip.color === 'secondary'
                        ? 'bg-secondary/10 hover:bg-secondary/20 border-secondary/20'
                        : chip.color === 'primary'
                            ? 'bg-primary/10 hover:bg-primary/20 border-primary/20'
                            : 'bg-bg-secondary hover:bg-bg-tertiary border-border';
                    const textColor = chip.color === 'secondary'
                        ? 'text-secondary'
                        : chip.color === 'primary'
                            ? 'text-primary'
                            : 'text-text-secondary';

                    return (
                        <button
                            key={chip.id}
                            onClick={() => handleChipClick(chip.id)}
                            className={`flex items-center gap-2 px-4 py-2 ${bgColor} rounded-full transition-colors whitespace-nowrap border`}
                            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                        >
                            <Icon className={`w-4 h-4 ${textColor}`} />
                            <span className={`text-sm font-medium ${textColor}`}>{chip.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}