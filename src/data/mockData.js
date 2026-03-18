// Mock data for KNUST SafeTrack

// KNUST Campus center coordinates
export const KNUST_CENTER = {
    lat: 6.6745,
    lng: -1.5716,
};

// Current user location (simulated - near Library)
export const USER_LOCATION = {
    lat: 6.6742,
    lng: -1.5718,
};

// Campus locations for search and Walk With Me
export const CAMPUS_LOCATIONS = [
    { id: 1, name: 'JQB (Junior Quarters)', lat: 6.6731, lng: -1.5672, type: 'landmark' },
    { id: 2, name: 'Ayeduase Gate', lat: 6.6698, lng: -1.5645, type: 'gate' },
    { id: 3, name: 'Hall 7 Junction', lat: 6.6782, lng: -1.5689, type: 'hostel' },
    { id: 4, name: 'Main Library', lat: 6.6738, lng: -1.5725, type: 'facility' },
    { id: 5, name: 'Great Hall', lat: 6.6755, lng: -1.5745, type: 'facility' },
    { id: 6, name: 'Engineering Building', lat: 6.6721, lng: -1.5758, type: 'facility' },
    { id: 7, name: 'KSB (KNUST School of Business)', lat: 6.6768, lng: -1.5702, type: 'facility' },
    { id: 8, name: 'Brunei Area', lat: 6.6805, lng: -1.5678, type: 'hostel' },
    { id: 9, name: 'Unity Hall', lat: 6.6750, lng: -1.5735, type: 'hostel' },
    { id: 10, name: 'Queens Hall', lat: 6.6748, lng: -1.5740, type: 'hostel' },
    { id: 11, name: 'Republic Hall', lat: 6.6752, lng: -1.5730, type: 'hostel' },
    { id: 12, name: 'Gaza Hostel', lat: 6.6810, lng: -1.5660, type: 'hostel' },
];

// Safety tips for the bottom sheet
export const SAFETY_TIPS = [
    'Stick to well-lit paths when walking at night',
    'Share your live location with a trusted friend',
    'Walk in groups — use Walk With Me to find companions',
    'Save the security hotline: 0322-060-331',
    'If you feel unsafe, press the SOS button immediately',
];
