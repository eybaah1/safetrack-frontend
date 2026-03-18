import client from './client';

const notificationsAPI = {
  list: (params) => client.get('/notifications/', { params }),
  unreadCount: () => client.get('/notifications/unread-count/'),
  markRead: (id) => client.post(`/notifications/${id}/read/`),
  markAllRead: () => client.post('/notifications/mark-all-read/'),
  deleteOne: (id) => client.delete(`/notifications/${id}/delete/`),
  clearRead: () => client.delete('/notifications/clear/'),

  // Broadcasts
  broadcasts: (params) => client.get('/notifications/broadcasts/', { params }),
  createBroadcast: (data) => client.post('/notifications/broadcasts/create/', data),
  deactivateBroadcast: (id) =>
    client.post(`/notifications/broadcasts/${id}/deactivate/`),

  // Devices
  registerDevice: (data) => client.post('/notifications/devices/register/', data),
  unregisterDevice: (token) =>
    client.post('/notifications/devices/unregister/', { device_token: token }),

  // Preferences
  getPreferences: () => client.get('/notifications/preferences/'),
  updatePreferences: (data) => client.patch('/notifications/preferences/', data),
};

export default notificationsAPI;