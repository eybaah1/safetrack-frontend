// Mock data for Security Dashboard

// Active SOS Alerts
export const ACTIVE_SOS_ALERTS = [
    {
        id: 'SOS-001',
        studentId: '2048112',
        studentName: 'Kwame Mensah',
        location: 'Near Brunei Hostel',
        lat: 6.6805,
        lng: -1.5678,
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
        status: 'active',
    },
    {
        id: 'SOS-002',
        studentId: '2049234',
        studentName: 'Ama Serwaa',
        location: 'Hall 7 Junction',
        lat: 6.6782,
        lng: -1.5689,
        timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 mins ago
        status: 'active',
    },
    {
        id: 'SOS-003',
        studentId: '2047891',
        studentName: 'Kofi Asante',
        location: 'Near JQB',
        lat: 6.6731,
        lng: -1.5672,
        timestamp: new Date(Date.now() - 3 * 60 * 1000), // 3 mins ago
        status: 'responding',
    },
];

// Active Walk Sessions
export const ACTIVE_WALKS = [
    {
        id: 'WALK-001',
        studentId: '2050456',
        studentName: 'Efya Owusu',
        from: 'Main Library',
        to: 'Hall 7',
        startTime: new Date(Date.now() - 8 * 60 * 1000),
        companion: 'security',
        currentLat: 6.6755,
        currentLng: -1.5720,
    },
    {
        id: 'WALK-002',
        studentId: '2048789',
        studentName: 'Yaw Boateng',
        from: 'Engineering',
        to: 'Ayeduase',
        startTime: new Date(Date.now() - 15 * 60 * 1000),
        companion: 'friend',
        currentLat: 6.6710,
        currentLng: -1.5660,
    },
];

// Patrol Units
export const PATROL_UNITS = [
    { id: 'PATROL-1', name: 'Unit Alpha', lat: 6.6760, lng: -1.5700, status: 'available' },
    { id: 'PATROL-2', name: 'Unit Beta', lat: 6.6720, lng: -1.5680, status: 'responding' },
    { id: 'PATROL-3', name: 'Unit Gamma', lat: 6.6800, lng: -1.5740, status: 'available' },
];

// Dashboard Stats
export const DASHBOARD_STATS = {
    activeAlerts: 3,
    activeWalks: 2,
    patrolsOnDuty: 3,
    resolvedToday: 7,
    averageResponseTime: '3.2 min',
    studentsActive: 156,
};

// Heatmap data (high traffic areas at night)
export const HEATMAP_DATA = [
    { lat: 6.6731, lng: -1.5672, intensity: 0.9 }, // JQB
    { lat: 6.6738, lng: -1.5725, intensity: 0.8 }, // Library
    { lat: 6.6782, lng: -1.5689, intensity: 0.7 }, // Hall 7
    { lat: 6.6805, lng: -1.5678, intensity: 0.6 }, // Brunei
    { lat: 6.6698, lng: -1.5645, intensity: 0.75 }, // Ayeduase
];
