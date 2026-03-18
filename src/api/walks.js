import client from './client';

const walksAPI = {
  create: (data) => client.post('/walks/', data),
  activeGroups: () => client.get('/walks/active-groups/'),
  myActive: () => client.get('/walks/my-active/'),
  myHistory: () => client.get('/walks/my-history/'),
  detail: (id) => client.get(`/walks/${id}/`),
  join: (id) => client.post(`/walks/${id}/join/`),
  leave: (id) => client.post(`/walks/${id}/leave/`),
  start: (id) => client.post(`/walks/${id}/start/`),
  arrived: (id) => client.post(`/walks/${id}/arrived/`),
  end: (id) => client.post(`/walks/${id}/end/`),
  cancel: (id) => client.post(`/walks/${id}/cancel/`),

  // Security
  allActive: () => client.get('/walks/active/'),
  mapData: () => client.get('/walks/map/'),
  stats: () => client.get('/walks/stats/'),
  all: (params) => client.get('/walks/all/', { params }),
};

export default walksAPI;