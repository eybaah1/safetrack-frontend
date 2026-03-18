import client from './client';

const chatAPI = {
  list: () => client.get('/chats/'),
  unreadCount: () => client.get('/chats/unread/'),
  createDirect: (userId) => client.post('/chats/direct/', { user_id: userId }),
  createGroup: (data) => client.post('/chats/group/', data),
  createSOSSupport: (sosAlertId) =>
    client.post('/chats/sos-support/', { sos_alert_id: sosAlertId }),
  detail: (id) => client.get(`/chats/${id}/`),
  messages: (id, params) => client.get(`/chats/${id}/messages/`, { params }),
  sendMessage: (id, data) => client.post(`/chats/${id}/messages/`, data),
  markRead: (id) => client.post(`/chats/${id}/read/`),
  participants: (id) => client.get(`/chats/${id}/participants/`),
  addParticipant: (id, userId) =>
    client.post(`/chats/${id}/participants/`, { user_id: userId }),
  leave: (id) => client.post(`/chats/${id}/leave/`),
};

export default chatAPI;