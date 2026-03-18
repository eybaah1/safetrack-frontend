import { useState, useRef } from 'react';
import { Bot, X, Send, Sparkles, ChevronRight } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';
import Portal from './layout/Portal.jsx';

const QUICK_QUESTIONS = [
    'Is it safe to walk to Brunei now?',
    'Where is the nearest help point?',
    'Report a broken street light',
    'Tips for walking at night',
];

const AI_RESPONSES = {
    'Is it safe to walk to Brunei now?': 'Based on recent activity, the route to Brunei Hostel is moderately busy right now. Security patrols are active in the area. I recommend using well-lit paths via Hall 7 Junction. Would you like to start a "Walk With Me" session?',
    'Where is the nearest help point?': 'The nearest help point is the Security Post at Engineering Building, about 300m from your current location. You can also reach Campus Security directly at 0322-060-331.',
    'Report a broken street light': 'I can help you report that. Please share the location of the broken street light and I\'ll forward it to the maintenance team. You can also describe the exact spot for faster fixing.',
    'Tips for walking at night': '🌙 Here are some safety tips:\n\n1. Stick to well-lit paths\n2. Walk in groups when possible — use Walk With Me!\n3. Keep your phone charged\n4. Share your live location with a friend\n5. Avoid shortcuts through unlit areas\n6. If you feel unsafe, press the SOS button immediately',
};

export default function AIChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: 'Hi! I\'m SafeTrack AI 🤖\nI can help you with campus safety info, directions, and tips. How can I help?',
            time: 'Now',
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const panelRef = useRef(null);
    const closeBtnRef = useRef(null);

    useEscapeKey(isOpen, () => setIsOpen(false));
    useFocusTrap({ enabled: isOpen, containerRef: panelRef, initialFocusRef: closeBtnRef });

    const handleSend = (text) => {
        const messageText = text || inputValue.trim();
        if (!messageText) return;

        // Add user message
        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInputValue('');

        // Simulate AI response after a short delay
        setTimeout(() => {
            const response = AI_RESPONSES[messageText] ||
                'I understand your concern. For immediate assistance, please use the SOS button or contact Campus Security at 0322-060-331. Is there anything specific I can help you with?';
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    sender: 'bot',
                    text: response,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
            ]);
        }, 800);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Floating AI Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="absolute bottom-[252px] right-4 z-[1000] flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
                    style={{
                        background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
                        boxShadow: '0 4px 20px rgba(56, 189, 248, 0.4)',
                    }}
                    aria-label="Open AI Chatbot"
                >
                    <Sparkles className="w-6 h-6 text-white" />
                </button>
            )}

            {/* Chat Modal */}
            {isOpen && (
                <Portal>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} role="dialog" aria-modal="true" aria-label="SafeTrack AI Chat">
                        <div ref={panelRef} style={{ width: '100%', maxWidth: '448px', height: '80vh', borderRadius: '24px 24px 0 0', overflow: 'hidden' }} className="bg-bg-secondary flex flex-col animate-slide-up">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-text-primary">SafeTrack AI</h2>
                                        <p className="text-xs text-text-secondary">Always here to help</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center hover:bg-border transition-colors"
                                    type="button"
                                    aria-label="Close"
                                    ref={closeBtnRef}
                                >
                                    <X className="w-5 h-5 text-text-secondary" />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.sender === 'user'
                                                ? 'bg-accent text-white rounded-br-md'
                                                : 'bg-bg-primary text-text-primary rounded-bl-md'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-line">{msg.text}</p>
                                            <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-text-muted'}`}>
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Quick Questions (show only at start) */}
                                {messages.length <= 1 && (
                                    <div className="space-y-2 mt-2">
                                        <p className="text-xs text-text-muted font-medium">Quick Questions:</p>
                                        {QUICK_QUESTIONS.map((q) => (
                                            <button
                                                key={q}
                                                onClick={() => handleSend(q)}
                                                className="w-full flex items-center gap-2 p-3 bg-bg-primary rounded-xl hover:bg-bg-tertiary/50 transition-colors text-left"
                                                type="button"
                                            >
                                                <Sparkles className="w-4 h-4 text-accent shrink-0" />
                                                <span className="text-sm text-text-primary">{q}</span>
                                                <ChevronRight className="w-4 h-4 text-text-muted shrink-0 ml-auto" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Input */}
                            <div className="px-4 py-3 border-t border-border shrink-0">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Ask SafeTrack AI..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 h-11 px-4 bg-bg-primary border border-border rounded-full text-text-primary text-sm outline-none focus:border-accent transition-colors"
                                        style={{ fontSize: '16px' }}
                                    />
                                    <button
                                        onClick={() => handleSend()}
                                        disabled={!inputValue.trim()}
                                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${inputValue.trim()
                                            ? 'bg-accent text-white'
                                            : 'bg-bg-tertiary text-text-muted'
                                            }`}
                                        aria-label="Send message"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    );
}
