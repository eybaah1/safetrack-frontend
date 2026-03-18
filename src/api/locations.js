import client from './client';

const locationsAPI = {
  list: (params) => client.get('/locations/', { params }),
  search: (q) => client.get('/locations/search/', { params: { q } }),
  popular: () => client.get('/locations/popular/'),
  mapMarkers: () => client.get('/locations/map/'),
  detail: (id) => client.get(`/locations/${id}/`),
  nearby: (id) => client.get(`/locations/${id}/nearby/`),
};

export default locationsAPI;