import { useMemo, useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Clock, Loader2 } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';
import locationsAPI from '../api/locations';

export default function SearchModal({ isOpen, onClose, onSelectLocation }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [popular, setPopular] = useState([]);
    const [searching, setSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('safetrack_recent_searches') || '[]');
        } catch { return []; }
    });
    const inputRef = useRef(null);
    const panelRef = useRef(null);
    const debounceRef = useRef(null);

    useEscapeKey(isOpen, onClose);
    useFocusTrap({ enabled: isOpen, containerRef: panelRef, initialFocusRef: inputRef });

    // Fetch popular locations on open
    useEffect(() => {
        if (!isOpen) return;
        locationsAPI.popular()
            .then(({ data }) => setPopular(data))
            .catch(() => {});
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);
        debounceRef.current = setTimeout(() => {
            locationsAPI.search(query.trim())
                .then(({ data }) => {
                    setResults(data.results || []);
                    setSearching(false);
                })
                .catch(() => {
                    setResults([]);
                    setSearching(false);
                });
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    const handleSelect = (location) => {
        // Save to recent
        const updated = [location.name, ...recentSearches.filter((s) => s !== location.name)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('safetrack_recent_searches', JSON.stringify(updated));

        if (onSelectLocation) onSelectLocation(location);
        onClose();
        setQuery('');
    };

    const handleRecentSearch = (term) => setQuery(term);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex flex-col">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div
                ref={panelRef}
                className="relative bg-bg-primary m-4 rounded-2xl overflow-hidden animate-slide-up max-h-[80vh] flex flex-col border border-border"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}
                role="dialog"
                aria-modal="true"
            >
                {/* Search Input */}
                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search locations, hostels, landmarks..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-bg-secondary border border-border rounded-xl py-3 pl-12 pr-12 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                            aria-label="Search locations"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto p-4">
                    {query.trim() === '' ? (
                        <>
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-xs font-medium text-text-muted mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Recent Searches
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((term, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleRecentSearch(term)}
                                                className="px-3 py-1.5 bg-bg-secondary border border-border rounded-full text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular Locations */}
                            <div>
                                <h3 className="text-xs font-medium text-text-muted mb-2">Popular Locations</h3>
                                <div className="space-y-2">
                                    {popular.map((loc) => (
                                        <button
                                            key={loc.id}
                                            onClick={() => handleSelect(loc)}
                                            className="w-full flex items-center gap-3 p-3 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors text-left border border-border"
                                        >
                                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">{loc.name}</p>
                                                <p className="text-xs text-text-secondary">{loc.type} • {loc.area}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : searching ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-2">
                            <p className="text-xs text-text-muted mb-2">
                                {results.length} result{results.length !== 1 ? 's' : ''} found
                            </p>
                            {results.map((loc) => (
                                <button
                                    key={loc.id}
                                    onClick={() => handleSelect(loc)}
                                    className="w-full flex items-center gap-3 p-3 bg-bg-secondary rounded-xl hover:bg-bg-tertiary transition-colors text-left border border-border"
                                >
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-text-primary">{loc.name}</p>
                                        <p className="text-xs text-text-secondary">{loc.type} • {loc.area}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Search className="w-12 h-12 text-text-muted mx-auto mb-3" />
                            <p className="text-text-secondary">No locations found for &ldquo;{query}&rdquo;</p>
                            <p className="text-xs text-text-muted mt-1">Try a different search term</p>
                        </div>
                    )}
                </div>

                {/* Close */}
                <div className="p-4 border-t border-border">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-bg-secondary text-text-primary rounded-xl font-medium hover:bg-bg-tertiary transition-colors border border-border"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}