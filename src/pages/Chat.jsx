import { useState, useRef, useEffect, useMemo } from 'react';
import { MessageCircle, Send, ArrowLeft, Search, ChevronRight, Loader2 } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import MenuDrawer from '../components/MenuDrawer';
import chatAPI from '../api/chat';
import { getTokens } from '../api/client';
import { useAuth } from '../context/AuthContext.jsx';
import useToast from '../hooks/useToast.js';

const WS_BASE = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000') + '/ws/chat/';

export default function Chat({ onSignOut }) {
    const { user } = useAuth();
    const toast = useToast();

    const [showMenu, setShowMenu] = useState(false);
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [activeChatData, setActiveChatData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);
    const wsRef = useRef(null);

    const currentUserId = user?.id;

    // ── Fetch conversations ────────────────────────────
    const fetchChats = async () => {
        try {
            const { data } = await chatAPI.list();
            const chatList = data.results || data || [];
            setConversations(chatList);
            return chatList;
        } catch {
            setConversations([]);
            return [];
        }
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const chatList = await fetchChats();

            const pendingChatId = sessionStorage.getItem('safetrack_open_chat');
            if (pendingChatId) {
                const exists = chatList.find((c) => c.id === pendingChatId);
                if (exists) {
                    setActiveChat(pendingChatId);
                } else {
                    setActiveChat(pendingChatId);
                }
                sessionStorage.removeItem('safetrack_open_chat');
            }

            setLoading(false);
        };

        init();
    }, []);

    // ── Open chat: fetch detail + messages + connect WS ─
    useEffect(() => {
        if (!activeChat) return;

        let isMounted = true;
        let pollInterval = null;

        const openChat = async () => {
            setMessagesLoading(true);

            try {
                const [chatRes, messagesRes] = await Promise.all([
                    chatAPI.detail(activeChat),
                    chatAPI.messages(activeChat),
                ]);

                if (!isMounted) return;

                setActiveChatData(chatRes.data);
                const msgList = (messagesRes.data.results || messagesRes.data || []).reverse();
                setMessages(msgList);
                chatAPI.markRead(activeChat).catch(() => {});
            } catch {
                if (isMounted) toast.error('Failed to load chat.');
            } finally {
                if (isMounted) setMessagesLoading(false);
            }

            // Close previous WS
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }

            // Connect WebSocket
            const { access } = getTokens();
            if (access) {
                try {
                    const ws = new WebSocket(`${WS_BASE}${activeChat}/?token=${access}`);

                    ws.onopen = () => {
                        console.log('WebSocket connected');
                        // Stop polling if WS is working
                        if (pollInterval) {
                            clearInterval(pollInterval);
                            pollInterval = null;
                        }
                        try {
                            ws.send(JSON.stringify({ type: 'read' }));
                        } catch {}
                    };

                    ws.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            if (data.type === 'message' && data.message) {
                                setMessages((prev) => {
                                    if (prev.some((m) => m.id === data.message.id)) return prev;
                                    return [...prev, {
                                        id: data.message.id,
                                        sender_id: data.message.sender_id,
                                        sender_name: data.message.sender_name,
                                        message_text: data.message.text,
                                        message_type: data.message.message_type || 'text',
                                        metadata: data.message.metadata || {},
                                        sent_at: data.message.time,
                                    }];
                                });
                                fetchChats();
                            }
                        } catch {}
                    };

                    ws.onerror = () => {
                        console.warn('WebSocket error — falling back to polling');
                    };

                    ws.onclose = () => {
                        console.log('WebSocket closed');
                    };

                    wsRef.current = ws;
                } catch {
                    console.warn('WebSocket connection failed');
                }
            }

            // Polling fallback — refresh messages every 5 seconds
            // This ensures messages show up even if WebSocket fails
            pollInterval = setInterval(async () => {
                if (!isMounted) return;
                // Only poll if WebSocket is NOT open
                if (wsRef.current?.readyState === WebSocket.OPEN) return;

                try {
                    const { data } = await chatAPI.messages(activeChat);
                    const msgList = (data.results || data || []).reverse();
                    if (isMounted) {
                        setMessages(msgList);
                    }
                } catch {}
            }, 5000);
        };

        openChat();

        return () => {
            isMounted = false;
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [activeChat, toast]);

    // ── Scroll to bottom ───────────────────────────────
    useEffect(() => {
        if (activeChat) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, activeChat]);

    const handleSend = async () => {
        const text = newMessage.trim();
        if (!text || !activeChat || sending) return;

        setSending(true);

        try {
            // Prefer websocket
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'message',
                    text,
                }));
                setNewMessage('');
                setSending(false);
                return;
            }

            // Fallback to REST
            const { data } = await chatAPI.sendMessage(activeChat, {
                message_text: text,
                message_type: 'text',
            });

            const sent = data.data;
            setMessages((prev) => [...prev, sent]);
            setNewMessage('');
            fetchChats();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter((c) =>
            (c.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    // ── Active chat screen ─────────────────────────────
    if (activeChat) {
        const chat = activeChatData || conversations.find((c) => c.id === activeChat);

        return (
            <div style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-primary)' }}>
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderBottom: '1px solid var(--color-border)',
                }}>
                    <button
                        onClick={() => {
                            setActiveChat(null);
                            setActiveChatData(null);
                            setMessages([]);
                        }}
                        style={{
                            width: '40px', height: '40px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer',
                        }}
                        aria-label="Back"
                    >
                        <ArrowLeft style={{ width: '20px', height: '20px', color: 'var(--color-text-primary)' }} />
                    </button>

                    <div style={{
                        width: '40px', height: '40px',
                        borderRadius: '50%',
                        backgroundColor: chat?.chat_type === 'direct'
                            ? 'rgba(212,160,23,0.1)'
                            : 'rgba(34,139,34,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 'bold',
                        color: chat?.chat_type === 'direct'
                            ? 'var(--color-primary)'
                            : 'var(--color-secondary)',
                    }}>
                        {chat?.avatar || 'CH'}
                    </div>

                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '14px', margin: 0 }}>
                            {chat?.display_name || chat?.title || 'Chat'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0 }}>
                            {chat?.subtitle || (chat?.participants ? `${chat.participants.length} member(s)` : '')}
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                    {messagesLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                            <Loader2 style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} className="animate-spin" />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === currentUserId;
                                const isSystem = !msg.sender_id || msg.message_type === 'system';

                                if (isSystem) {
                                    return (
                                        <div key={msg.id} style={{ display: 'flex', justifyContent: 'center' }}>
                                            <div style={{
                                                maxWidth: '85%',
                                                padding: '8px 12px',
                                                borderRadius: '12px',
                                                backgroundColor: 'var(--color-bg-secondary)',
                                                border: '1px solid var(--color-border)',
                                            }}>
                                                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'center' }}>
                                                    {msg.message_text}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                        <div style={{
                                            maxWidth: '75%',
                                            padding: '10px 14px',
                                            borderRadius: '16px',
                                            backgroundColor: isMe ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                                            color: isMe ? 'white' : 'var(--color-text-primary)',
                                            borderBottomRightRadius: isMe ? '4px' : '16px',
                                            borderBottomLeftRadius: isMe ? '16px' : '4px',
                                            border: isMe ? 'none' : '1px solid var(--color-border)',
                                        }}>
                                            <p style={{ fontSize: '14px', margin: 0 }}>{msg.message_text}</p>
                                            <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>
                                                {msg.sent_at
                                                    ? new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderTop: '1px solid var(--color-border)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{
                                flex: 1,
                                height: '44px',
                                padding: '0 16px',
                                backgroundColor: 'var(--color-bg-primary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '22px',
                                color: 'var(--color-text-primary)',
                                fontSize: '16px',
                                outline: 'none',
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!newMessage.trim() || sending}
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
                                backgroundColor: newMessage.trim() ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                                color: newMessage.trim() ? 'white' : 'var(--color-text-muted)',
                                opacity: sending ? 0.7 : 1,
                            }}
                            aria-label="Send message"
                        >
                            {sending ? (
                                <Loader2 style={{ width: '18px', height: '18px' }} className="animate-spin" />
                            ) : (
                                <Send style={{ width: '20px', height: '20px' }} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Conversation list screen ───────────────────────
    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)', paddingBottom: '80px' }}>
            <TopBar currentLocation="Messages" showSearch={false} onMenuClick={() => setShowMenu(true)} />

            <div style={{ paddingTop: '80px', padding: '80px 16px 80px 16px' }}>
                {/* Search */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '16px',
                        height: '16px',
                        color: 'var(--color-text-muted)',
                        pointerEvents: 'none',
                    }} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            height: '44px',
                            paddingLeft: '40px',
                            paddingRight: '16px',
                            backgroundColor: 'var(--color-bg-secondary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: '12px',
                            color: 'var(--color-text-primary)',
                            fontSize: '16px',
                            outline: 'none',
                        }}
                    />
                </div>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <MessageCircle style={{ width: '20px', height: '20px', color: 'var(--color-primary)' }} />
                    <h2 style={{ fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>Recent Chats</h2>
                </div>

                {/* Conversation list */}
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                        <Loader2 style={{ width: '24px', height: '24px', color: 'var(--color-primary)' }} className="animate-spin" />
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid var(--color-border)',
                        textAlign: 'center',
                    }}>
                        <p style={{ fontWeight: '600', color: 'var(--color-text-primary)', margin: 0 }}>No conversations yet</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                            Start a walk with someone to begin chatting.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredConversations.map((convo) => (
                            <button
                                key={convo.id}
                                onClick={() => setActiveChat(convo.id)}
                                type="button"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--color-border)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    flexShrink: 0,
                                    backgroundColor: convo.is_group ? 'rgba(34,139,34,0.1)' : 'rgba(212,160,23,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: convo.is_group ? 'var(--color-secondary)' : 'var(--color-primary)',
                                }}>
                                    {convo.avatar || '?'}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                        <p style={{
                                            fontWeight: '600',
                                            color: 'var(--color-text-primary)',
                                            fontSize: '14px',
                                            margin: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {convo.display_name}
                                        </p>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                                            {convo.last_message_time
                                                ? new Date(convo.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : ''}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '2px' }}>
                                        <p style={{
                                            fontSize: '13px',
                                            color: 'var(--color-text-secondary)',
                                            margin: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {convo.last_message || 'No messages yet'}
                                        </p>

                                        {convo.unread_count > 0 && (
                                            <span style={{
                                                minWidth: '20px',
                                                height: '20px',
                                                padding: '0 6px',
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: 'bold',
                                                borderRadius: '999px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                {convo.unread_count}
                                            </span>
                                        )}
                                    </div>

                                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                                        {convo.subtitle}
                                    </p>
                                </div>

                                <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--color-text-muted)', flexShrink: 0 }} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav activeTab="chat" />
            <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} onSignOut={onSignOut} />
        </div>
    );
}