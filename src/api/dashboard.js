import client from './client';

const dashboardAPI = {
  stats: () => client.get('/dashboard/stats/'),
  mapData: () => client.get('/dashboard/map/'),
  heatmap: (days = 7) => client.get('/dashboard/heatmap/', { params: { days } }),
  activity: (limit = 20) => client.get('/dashboard/activity/', { params: { limit } }),
  summary: () => client.get('/dashboard/summary/'),
  weekly: () => client.get('/dashboard/weekly/'),
  overview: () => client.get('/dashboard/overview/'),
};

export default dashboardAPI;