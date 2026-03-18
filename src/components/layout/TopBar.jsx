import { Menu, Search, MapPin, ArrowLeft } from 'lucide-react';

export default function TopBar({
    currentLocation = 'KNUST Campus',
    showSearch = true,
    showBack = false,
    onBack,
    onMenuClick,
    onSearchClick
}) {
    return (
        <div className="absolute top-3 left-4 right-4 z-[1000]">
            <div
                className="flex items-center justify-between h-12 px-4 bg-bg-primary/95 backdrop-blur-sm rounded-xl border border-border"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
                <button
                    onClick={showBack ? onBack : onMenuClick}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg-secondary transition-colors"
                    aria-label={showBack ? 'Go back' : 'Open menu'}
                >
                    {showBack ? (
                        <ArrowLeft className="w-5 h-5 text-text-primary" />
                    ) : (
                        <Menu className="w-5 h-5 text-text-primary" />
                    )}
                </button>

                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-bg-secondary transition-colors">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-text-primary truncate max-w-[160px]">
                        {currentLocation}
                    </span>
                </button>

                {showSearch ? (
                    <button
                        onClick={onSearchClick}
                        className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg-secondary transition-colors"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5 text-text-primary" />
                    </button>
                ) : (
                    <div className="w-10 h-10" />
                )}
            </div>
        </div>
    );
}