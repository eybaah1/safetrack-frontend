import { AlertTriangle, Users, Shield, CheckCircle, Clock, Activity } from 'lucide-react';

export default function StatsOverview({ stats = {} }) {
    const statCards = [
        {
            id: 'alerts',
            label: 'Active SOS Alerts',
            value: stats.total_active_sos ?? stats.active_alerts ?? 0,
            icon: AlertTriangle,
            color: 'danger',
            urgent: true,
        },
        {
            id: 'walks',
            label: 'Active Walks',
            value: stats.active_walks ?? 0,
            icon: Users,
            color: 'secondary',
        },
        {
            id: 'patrols',
            label: 'Patrols On Duty',
            value: stats.patrols_on_duty ?? 0,
            icon: Shield,
            color: 'primary',
        },
        {
            id: 'resolved',
            label: 'Resolved Today',
            value: stats.resolved_today ?? 0,
            icon: CheckCircle,
            color: 'secondary',
        },
        {
            id: 'response',
            label: 'Avg. Response',
            value: stats.average_response_time ?? 'N/A',
            icon: Clock,
            color: 'primary',
        },
        {
            id: 'students',
            label: 'Students Active',
            value: stats.students_active ?? 0,
            icon: Activity,
            color: 'muted',
        },
    ];

    return (
        <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 p-4 border-b border-border"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
        >
            {statCards.map((stat) => {
                const Icon = stat.icon;
                const bgColor = stat.color === 'danger'
                    ? 'rgba(220,38,38,0.08)'
                    : stat.color === 'secondary'
                        ? 'rgba(34,139,34,0.08)'
                        : stat.color === 'primary'
                            ? 'rgba(212,160,23,0.08)'
                            : 'var(--color-bg-tertiary)';
                const textColor = stat.color === 'danger'
                    ? 'var(--color-danger)'
                    : stat.color === 'secondary'
                        ? 'var(--color-secondary)'
                        : stat.color === 'primary'
                            ? 'var(--color-primary)'
                            : 'var(--color-text-secondary)';

                return (
                    <div
                        key={stat.id}
                        style={{
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: bgColor,
                        }}
                        className={stat.urgent ? 'animate-pulse-subtle' : ''}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Icon style={{ width: '16px', height: '16px', color: textColor }} />
                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{stat.label}</span>
                        </div>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: textColor, margin: 0 }}>
                            {stat.value}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}