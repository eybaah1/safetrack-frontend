import client from './client';

const trackingAPI = {
  updateLive: (data) => client.post('/tracking/live/', data),
  myLive: () => client.get('/tracking/live/me/'),
  toggleSharing: (is_sharing) => client.post('/tracking/sharing/', { is_sharing }),
  nearby: (params) => client.get('/tracking/nearby/', { params }),

  // Security
  allSharing: () => client.get('/tracking/live/all/'),
  userLive: (userId) => client.get(`/tracking/live/${userId}/`),

  // History
  recordHistory: (data) => client.post('/tracking/history/', data),
  bulkRecord: (entries) => client.post('/tracking/history/bulk/', { entries }),
  myHistory: (params) => client.get('/tracking/history/me/', { params }),
  sessionTrail: (context, refId) => client.get(`/tracking/trail/${context}/${refId}/`),
  sessionParticipants: (context, refId) =>
    client.get(`/tracking/participants/${context}/${refId}/`),
};

export default trackingAPI;