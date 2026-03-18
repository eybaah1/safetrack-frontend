import client from './client';

const sosAPI = {
  trigger: (data) => client.post('/sos/', data),
  myActive: () => client.get('/sos/my-active/'),
  myHistory: () => client.get('/sos/my-history/'),
  cancel: (id) => client.post(`/sos/${id}/cancel/`),

  // Security/admin
  active: () => client.get('/sos/active/'),
  all: (params) => client.get('/sos/all/', { params }),
  detail: (id) => client.get(`/sos/${id}/`),
  updateStatus: (id, data) => client.patch(`/sos/${id}/status/`, data),
  addNote: (id, data) => client.post(`/sos/${id}/notes/`, data),
  events: (id) => client.get(`/sos/${id}/events/`),
  mapData: () => client.get('/sos/map/'),
  stats: () => client.get('/sos/stats/'),
  heatmap: (days = 7) => client.get('/sos/heatmap/', { params: { days } }),
  callInfo: (id) => client.get(`/sos/${id}/call-info/`),  // ← NEW

};

export default sosAPI;